
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { BotIcon, MicrophoneIcon, StopIcon, UserIcon } from './icons';
import { encode, decode, decodeAudioData } from '../utils/audio';

type TranscriptEntry = {
    sender: 'user' | 'bot';
    text: string;
};

type Status = 'idle' | 'connecting' | 'listening' | 'error';

export const LiveConversationPage: React.FC = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<Status>('idle');
    const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());


    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
         if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
    };
    
    useEffect(() => {
        return cleanup;
    }, []);

    const startConversation = async () => {
        setStatus('connecting');
        setTranscripts([]);
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        try {
                            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                            
                            mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };

                            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                            setStatus('listening');
                        } catch (err) {
                            console.error("Microphone access denied or error:", err);
                            setStatus('error');
                            cleanup();
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscriptionRef.current.trim();
                            const fullOutput = currentOutputTranscriptionRef.current.trim();
                            
                            setTranscripts(prev => {
                                let newTranscripts = [...prev];
                                if(fullInput) newTranscripts.push({ sender: 'user', text: fullInput });
                                if(fullOutput) newTranscripts.push({ sender: 'bot', text: fullOutput });
                                return newTranscripts;
                            });

                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }

                        // Handle audio playback
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const outputCtx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            for (const source of sourcesRef.current.values()) {
                                source.stop();
                                sourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus('error');
                        cleanup();
                    },
                    onclose: () => {
                        // console.log('Live session closed');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });
        } catch (error) {
            console.error("Failed to start conversation:", error);
            setStatus('error');
            cleanup();
        }
    };

    const stopConversation = () => {
        cleanup();
        setStatus('idle');
    };

    const isConversationActive = status === 'listening' || status === 'connecting';

    return (
        <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-4 md:p-6 flex flex-col overflow-hidden">
            <div className="text-center mb-4">
                <MicrophoneIcon className="w-12 h-12 text-cyan-300 mx-auto mb-2" />
                <h2 className="text-3xl font-bold text-cyan-200">{t('liveConversation.title')}</h2>
                <p className="max-w-2xl mx-auto text-gray-300 mt-2">{t('liveConversation.description')}</p>
            </div>

            <div className="flex-grow bg-black/20 rounded-lg p-4 overflow-y-auto space-y-4 mb-4">
                {transcripts.length === 0 && (
                     <p className="text-center text-gray-400">{t(`liveConversation.status.${status}`)}</p>
                )}
                {transcripts.map((entry, index) => (
                    <div key={index} className={`flex items-start gap-3 ${entry.sender === 'user' ? 'justify-end' : ''}`}>
                         {entry.sender === 'bot' && <BotIcon className="w-8 h-8 flex-shrink-0 text-cyan-300 mt-1" />}
                         <div className={`max-w-md p-3 rounded-lg ${entry.sender === 'user' ? 'bg-blue-600/80' : 'bg-gray-700/60'}`}>
                            <p className="text-white">{entry.text}</p>
                         </div>
                         {entry.sender === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 text-blue-300 mt-1" />}
                    </div>
                ))}
            </div>

            <div className="flex-shrink-0 text-center">
                <button
                    onClick={isConversationActive ? stopConversation : startConversation}
                    disabled={status === 'connecting'}
                    className={`px-8 py-4 rounded-full text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 mx-auto ${
                        isConversationActive 
                        ? 'bg-red-600 hover:bg-red-500' 
                        : 'bg-green-600 hover:bg-green-500'
                    } disabled:bg-gray-500`}
                >
                    {isConversationActive ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                    <span>{t(isConversationActive ? 'liveConversation.stop' : 'liveConversation.start')}</span>
                </button>
            </div>
        </div>
    );
};
