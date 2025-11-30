import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import type { UserRole } from '../types';
import { BotIcon, UserIcon, AdminIcon } from './icons';

interface LoginPageProps {
    onLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<UserRole>('user');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (view === 'login') {
            // Mock login: if email is admin@marinov.ai, login as admin
            if (email.toLowerCase() === 'admin@marinov.ai') {
                onLogin('admin');
            } else {
                onLogin('user');
            }
        } else {
            // Mock signup
            onLogin(role);
        }
    };

    return (
        <div
            className="h-screen w-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('https://picsum.photos/seed/oceanlogin/1920/1080')" }}
        >
            <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm"></div>
            <div className="relative z-10 text-white p-8 max-w-md w-full bg-black/30 rounded-2xl border border-blue-400/30 shadow-2xl">
                <BotIcon className="w-20 h-20 mx-auto mb-4 text-cyan-300" />
                <h1 className="text-3xl font-bold mb-2 tracking-tight text-center">
                    {view === 'login' ? t('login.titleLogin') : t('login.titleSignup')}
                </h1>
                <p className="text-cyan-100/80 mb-8 text-center">
                    {t('login.description')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('login.emailPlaceholder')}
                        required
                        className="w-full p-3 bg-gray-800/70 border border-blue-400/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                    />
                    {view === 'signup' && (
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t('login.usernamePlaceholder')}
                            required
                            className="w-full p-3 bg-gray-800/70 border border-blue-400/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                        />
                    )}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('login.passwordPlaceholder')}
                        required
                        className="w-full p-3 bg-gray-800/70 border border-blue-400/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                    />

                    {view === 'signup' && (
                        <div>
                            <p className="text-sm text-gray-300 mb-2">{t('login.roleLabel')}</p>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setRole('user')} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-colors ${role === 'user' ? 'bg-blue-600/50 border-blue-400' : 'bg-gray-700/50 border-transparent hover:border-gray-500'}`}>
                                    <UserIcon className="w-5 h-5" />
                                    <span>{t('login.roleUser')}</span>
                                </button>
                                <button type="button" onClick={() => setRole('admin')} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-colors ${role === 'admin' ? 'bg-cyan-600/50 border-cyan-400' : 'bg-gray-700/50 border-transparent hover:border-gray-500'}`}>
                                    <AdminIcon className="w-5 h-5" />
                                    <span>{t('login.roleAdmin')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 duration-300"
                    >
                        {view === 'login' ? t('login.loginButton') : t('login.signupButton')}
                    </button>
                </form>
                
                <p className="text-center mt-6 text-sm">
                    {view === 'login' ? t('login.switchToSignup') : t('login.switchToLogin')}
                    {' '}
                    <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="font-semibold text-cyan-300 hover:underline">
                        {view === 'login' ? t('login.signupButton') : t('login.loginButton')}
                    </button>
                </p>
            </div>
        </div>
    );
};