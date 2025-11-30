import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { UserIcon, BotIcon, SendIcon, VolumeUpIcon, PaperclipIcon, XCircleIcon, DocumentIcon } from './icons';
import { useTranslation } from '../i18n';
import { getTextToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';

// Singleton AudioContext
let audioContext: AudioContext | null = null;
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

type AttachedFile = {
    name: string;
    type: string;
    data: string; // data URL
};

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, file?: AttachedFile) => void;
  isLoading: boolean;
  error: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || attachedFile) {
      onSendMessage(inputText, attachedFile);
      setInputText('');
      setAttachedFile(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            setAttachedFile({
                name: file.name,
                type: file.type,
                data: e.target?.result as string,
            });
        };
        reader.readAsDataURL(file);
    }
     // Reset file input value to allow re-selection of the same file
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePlayAudio = async (text: string, index: number) => {
    if (audioPlaying === index) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setAudioPlaying(null);
      return;
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
    }
    
    setAudioLoading(index);
    setAudioPlaying(null);

    try {
      const base64Audio = await getTextToSpeech(text);
      const ctx = getAudioContext();
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      
      audioSourceRef.current = source;
      setAudioPlaying(index);

      source.onended = () => {
        if (audioPlaying === index) {
          setAudioPlaying(null);
          audioSourceRef.current = null;
        }
      };

    } catch (error) {
      console.error("Failed to play audio", error);
    } finally {
      setAudioLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && <BotIcon className="w-8 h-8 flex-shrink-0 text-cyan-300 mt-1" />}
            <div className={`max-w-md p-3 rounded-lg flex flex-col ${msg.sender === 'user' ? 'bg-blue-600/80' : 'bg-gray-700/60'}`}>
              <div className="flex items-start gap-2">
                <p className="text-white whitespace-pre-wrap flex-1">{msg.text}</p>
                {msg.sender === 'bot' && (
                   <button 
                    onClick={() => handlePlayAudio(msg.text, index)}
                    disabled={!!audioLoading}
                    title={t('chat.playAudio')}
                    className="p-1 text-cyan-200 hover:text-white disabled:text-gray-500 transition-colors"
                  >
                     {audioLoading === index ? (
                       <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                       <VolumeUpIcon className={`w-5 h-5 ${audioPlaying === index ? 'text-green-400 animate-pulse' : ''}`} />
                     )}
                   </button>
                )}
              </div>
              {msg.file && (
                 <div className="mt-2 rounded-lg overflow-hidden">
                    {msg.file.type.startsWith('image/') && (
                      <img src={msg.file.data} alt={msg.file.name} className="max-w-xs max-h-48 rounded-lg" />
                    )}
                    {msg.file.type.startsWith('video/') && (
                      <video src={msg.file.data} controls className="max-w-xs max-h-48 rounded-lg" />
                    )}
                    {msg.file.type === 'application/pdf' && (
                      <div className="p-2 bg-black/30 rounded-lg flex items-center gap-2 border border-gray-500">
                        <DocumentIcon className="w-6 h-6 text-cyan-200 flex-shrink-0" />
                        <span className="text-sm text-white truncate">{msg.file.name}</span>
                      </div>
                    )}
                  </div>
              )}
            </div>
             {msg.sender === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 text-blue-300 mt-1" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <BotIcon className="w-8 h-8 flex-shrink-0 text-cyan-300 mt-1 animate-pulse" />
            <div className="max-w-md p-3 rounded-lg bg-gray-700/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-blue-400/30">
        {attachedFile && (
            <div className="mb-2 p-2 bg-gray-700/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    {attachedFile.type.startsWith('image/') ? (
                        <img src={attachedFile.data} alt="preview" className="w-10 h-10 object-cover rounded"/>
                    ) : (
                         <DocumentIcon className="w-8 h-8 text-cyan-200 flex-shrink-0"/>
                    )}
                    <span className="text-sm text-white truncate">{attachedFile.name}</span>
                </div>
                <button onClick={() => setAttachedFile(null)} className="p-1 text-gray-400 hover:text-white">
                    <XCircleIcon className="w-6 h-6"/>
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,application/pdf"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <PaperclipIcon className="w-6 h-6 text-white" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1 p-3 bg-gray-800/70 border border-blue-400/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !attachedFile)}
            className="p-3 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <SendIcon className="w-6 h-6 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};