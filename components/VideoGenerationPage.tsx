
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useTranslation } from '../i18n';
import { UploadIcon, VideoIcon } from './icons';

// FIX: Removed the conflicting global declaration for `window.aistudio`.
// The error "All declarations of 'aistudio' must have identical modifiers" and "Subsequent property declarations must have the same type"
// indicates that `window.aistudio` is already typed in another file, likely a global `.d.ts` file.
// Removing this redeclaration resolves the conflict.

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to convert blob to base64"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const VideoGenerationPage: React.FC = () => {
    const { t } = useTranslation();
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const loadingIntervalRef = useRef<number | null>(null);
    
    useEffect(() => {
        window.aistudio.hasSelectedApiKey().then(setApiKeySelected);
    }, []);

    const handleSelectKey = async () => {
        await window.aistudio.openSelectKey();
        // Assume success after opening dialog to avoid race condition
        setApiKeySelected(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const base64 = await blobToBase64(file);
            setImageBase64(base64);
            setVideoUrl(null);
            setError(null);
        }
    };

    const startLoadingMessages = () => {
        const messages = t('videoGeneration.generatingMessages', {}).split('\n');
        let index = 0;
        setLoadingMessage(messages[index]);
        loadingIntervalRef.current = window.setInterval(() => {
            index = (index + 1) % messages.length;
            setLoadingMessage(messages[index]);
        }, 5000);
    };

    const stopLoadingMessages = () => {
        if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageBase64) return;
        
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        startLoadingMessages();

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: {
                    imageBytes: imageBase64,
                    mimeType: imageFile!.type,
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio,
                }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                 const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                 const blob = await response.blob();
                 const objectURL = URL.createObjectURL(blob);
                 setVideoUrl(objectURL);
            } else {
                throw new Error("Video generation completed but no download link was found.");
            }

        } catch (err: any) {
            console.error(err);
            if(err.message?.includes("Requested entity was not found.")){
                 setError("API Key error. Please re-select your API key and try again.");
                 setApiKeySelected(false);
            } else {
                 setError(err.message || t('videoGeneration.error'));
            }
        } finally {
            setIsLoading(false);
            stopLoadingMessages();
        }
    };

    if (apiKeySelected === null) {
        return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div></div>
    }
    
    if (!apiKeySelected) {
        return (
            <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-6 flex flex-col items-center justify-center text-center">
                <VideoIcon className="w-16 h-16 text-cyan-300 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">{t('videoGeneration.selectKey.title')}</h2>
                <p className="text-gray-300 max-w-lg mb-6">{t('videoGeneration.selectKey.description')}</p>
                <p className="text-sm text-gray-400 mb-4"><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-300">{t('videoGeneration.selectKey.billing')}</a></p>
                <button onClick={handleSelectKey} className="bg-cyan-500 hover:bg-cyan-400 text-blue-900 font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300">
                    {t('videoGeneration.selectKey.button')}
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
             <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-6 flex flex-col items-center justify-center text-center">
                 <h2 className="text-3xl font-bold text-cyan-200 mb-4">{t('videoGeneration.generatingTitle')}</h2>
                 <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-300">{loadingMessage}</p>
             </div>
        );
    }
    
    return (
        <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-4 md:p-6 flex flex-col overflow-hidden">
             <div className="text-center mb-4 flex-shrink-0">
                <VideoIcon className="w-12 h-12 text-cyan-300 mx-auto mb-2" />
                <h2 className="text-3xl font-bold text-cyan-200">{t('videoGeneration.title')}</h2>
                <p className="max-w-2xl mx-auto text-gray-300 mt-2">{t('videoGeneration.description')}</p>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Form Column */}
                    <div className="bg-black/20 p-6 rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-cyan-200 mb-2" htmlFor="image-upload">{t('videoGeneration.upload')}</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-600 rounded-md">
                                    <div className="space-y-1 text-center">
                                        {imageFile ? (
                                             <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mx-auto h-24 rounded-md" />
                                        ) : (
                                             <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        )}
                                        <div className="flex text-sm text-gray-400">
                                            <label htmlFor="image-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-cyan-300 hover:text-cyan-200 p-1">
                                                <span>{imageFile ? imageFile.name : 'Select a file'}</span>
                                                <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-cyan-200">{t('videoGeneration.promptPlaceholder')}</label>
                                <textarea id="prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                                className="mt-1 block w-full bg-gray-800/70 border border-blue-400/50 rounded-lg shadow-sm focus:ring-cyan-400 focus:border-cyan-400 text-white p-2"></textarea>
                            </div>
                            
                             <div>
                                <label className="block text-sm font-medium text-cyan-200">{t('videoGeneration.aspectRatio')}</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center">
                                        <input type="radio" value="16:9" checked={aspectRatio === '16:9'} onChange={() => setAspectRatio('16:9')} className="form-radio h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                                        <span className="ml-2 text-white">16:9 (Landscape)</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" value="9:16" checked={aspectRatio === '9:16'} onChange={() => setAspectRatio('9:16')} className="form-radio h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                                        <span className="ml-2 text-white">9:16 (Portrait)</span>
                                    </label>
                                </div>
                            </div>
                            
                            <button type="submit" disabled={!imageBase64 || isLoading}
                            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                                {t('videoGeneration.generate')}
                            </button>
                        </form>
                    </div>

                    {/* Result Column */}
                    <div className="bg-black/20 p-6 rounded-lg min-h-[300px] flex items-center justify-center">
                         {videoUrl ? (
                            <video src={videoUrl} controls autoPlay loop className="w-full rounded-md" style={{aspectRatio: aspectRatio.replace(':', '/')}}></video>
                         ) : error ? (
                             <p className="text-red-400 text-center">{error}</p>
                         ) : (
                             <p className="text-gray-400 text-center">Your generated video will appear here.</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};