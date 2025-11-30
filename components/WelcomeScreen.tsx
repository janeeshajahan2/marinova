
import React from 'react';
import { BotIcon } from './icons';
import { useTranslation } from '../i18n';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <div 
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://picsum.photos/seed/oceanwelcome/1920/1080')" }}
    >
      <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-md"></div>
      <div className="relative z-10 text-center text-white p-8 max-w-3xl">
        <BotIcon className="w-24 h-24 mx-auto mb-6 text-cyan-300" />
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          {t('welcome.title')}
        </h1>
        <p className="text-lg md:text-xl text-cyan-100/90 mb-8 leading-relaxed">
          {t('welcome.subtitle')}
        </p>
        <button
          onClick={onStart}
          className="bg-cyan-500 hover:bg-cyan-400 text-blue-900 font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-cyan-500/30"
        >
          {t('welcome.button')}
        </button>
      </div>
    </div>
  );
};