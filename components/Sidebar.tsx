import React from 'react';
import type { Page } from '../types';
import { DashboardIcon } from './icons';
import { useTranslation } from '../i18n';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
      isActive
        ? 'bg-cyan-400/20 text-cyan-200'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { t } = useTranslation();

  return (
    <nav className="relative z-20 w-64 bg-black/30 backdrop-blur-lg border-r border-blue-400/30 p-4 flex-flex-col gap-8 hidden md:flex md:flex-col">
      <div>
        {/* Placeholder for logo or app name if needed */}
        <h2 className="text-2xl font-bold text-white text-center tracking-widest">
          MARINOVA
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        <NavItem
          icon={<DashboardIcon className="w-6 h-6" />}
          label={t('sidebar.dashboard')}
          isActive={currentPage === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
      </div>
      <div className="mt-auto text-center text-xs text-gray-500">
        <p>MARINOVA v1.0</p>
        <p>Ocean Data Initiative</p>
      </div>
    </nav>
  );
};