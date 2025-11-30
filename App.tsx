import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { LanguageSelector } from './components/LanguageSelector';
import type { Page } from './types';
import { useTranslation } from './i18n';

const App: React.FC = () => {
  const { t, language } = useTranslation();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="h-screen w-screen flex bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://picsum.photos/seed/oceanbg/1920/1080')" }}>
      <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm"></div>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <header className="flex justify-between items-center relative z-30">
          <div className="text-white">
            <h1 className="text-2xl font-bold tracking-wider">MARINOVA</h1>
            <p className="text-sm text-cyan-200">{t('app.subHeader')}</p>
          </div>
          <LanguageSelector />
        </header>
        <div className="flex-1 overflow-hidden">
          <Dashboard />
        </div>
      </main>
    </div>
  );
};

export default App;