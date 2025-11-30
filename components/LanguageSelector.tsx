
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n';
import type { Language } from '../types';
import { LanguageIcon } from './icons';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const currentLanguage = languages.find(l => l.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-md hover:bg-white/10 transition-colors"
      >
        <LanguageIcon className="w-5 h-5 text-cyan-300" />
        <span className="text-white font-medium hidden sm:block">{currentLanguage?.name}</span>
        <span className="text-white font-medium sm:hidden">{currentLanguage?.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 end-0 w-40 bg-gray-800/90 backdrop-blur-md border border-blue-400/30 rounded-lg shadow-lg z-50">
          <ul className="py-1">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${
                    language === lang.code
                      ? 'bg-cyan-500/20 text-cyan-200'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
