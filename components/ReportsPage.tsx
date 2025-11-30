

import React, { useState } from 'react';
import { SearchIcon, BotIcon, DocumentReportIcon } from './icons';
import { useTranslation } from '../i18n';
import { getDetailedReport } from '../services/geminiService';
import type { DetailedReport } from '../types';
import { VisualizationPanel } from './VisualizationPanel';

const ReportView: React.FC<{ report: DetailedReport }> = ({ report }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">{report.title}</h1>
                <p className="text-lg text-cyan-200">{report.introduction}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <main className="lg:col-span-2 space-y-6 text-gray-300 leading-relaxed">
                    {report.sections?.map((section, index) => (
                        <section key={index}>
                            <h2 className="text-2xl font-semibold text-cyan-100 mb-3 border-b-2 border-blue-400/30 pb-2">{section.heading}</h2>
                            <p className="whitespace-pre-wrap">{section.content}</p>
                        </section>
                    ))}
                </main>
                <aside className="space-y-6">
                    {report.visualization && (
                        <div className="h-80">
                            <VisualizationPanel visualization={report.visualization} isLoading={false} />
                        </div>
                    )}
                    {report.images?.map((image, index) => (
                        <figure key={index} className="bg-black/20 p-2 rounded-lg border border-blue-400/20">
                            <img 
                                src={`https://picsum.photos/seed/${image.prompt.replace(/\s+/g, '')}/800/600`}
                                alt={image.caption}
                                className="w-full h-auto object-cover rounded-md"
                            />
                            <figcaption className="text-xs text-center text-gray-400 mt-2 italic">{image.caption}</figcaption>
                        </figure>
                    ))}
                </aside>
            </div>
        </div>
    );
};

const InitialState: React.FC<{ onQuery: (query: string) => void }> = ({ onQuery }) => {
    const { t } = useTranslation();
    const suggestions = [
        "What are hydrothermal vents?",
        "Explain the impact of plastic pollution on marine turtles.",
        "Show a map of salinity in the Atlantic Ocean.",
        "Detailed report on the Great Barrier Reef's health."
    ];
    return (
        <div className="text-center">
            <DocumentReportIcon className="w-24 h-24 text-cyan-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-cyan-200 mb-2">
                {t('reports.title')}
            </h2>
            <p className="max-w-2xl mx-auto text-gray-300">
                {t('reports.description')}
            </p>
            <div className="mt-8">
                <h3 className="text-lg text-white mb-4">Try asking:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map(s => (
                        <button key={s} onClick={() => onQuery(s)} className="bg-gray-700/50 hover:bg-gray-600/50 text-cyan-200 text-sm py-1 px-3 rounded-full transition-colors">
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LoadingState: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full text-cyan-200">
            <BotIcon className="w-16 h-16 animate-pulse mb-4" />
            <p className="text-lg">{t('reports.loading')}</p>
        </div>
    );
};

export const ReportsPage: React.FC = () => {
    const { t, language } = useTranslation();
    const [query, setQuery] = useState('');
    const [report, setReport] = useState<DetailedReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setError(null);
        setReport(null);
        try {
            const result = await getDetailedReport(searchQuery, language);
            setReport(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(t('error.prefix') + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };
    
    return (
        <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-4 md:p-6 flex flex-col">
            <div className="max-w-3xl mx-auto w-full mb-6 flex-shrink-0">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('reports.searchPlaceholder')}
                        className="w-full p-4 ps-12 bg-gray-800/70 border-2 border-blue-400/50 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white text-lg"
                        disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                        <SearchIcon className="w-6 h-6 text-gray-400" />
                    </div>
                </form>
            </div>
            
            <div className="flex-grow overflow-y-auto">
                 {isLoading && <LoadingState />}
                 {error && <p className="text-center text-red-400">{error}</p>}
                 {!isLoading && !error && report && <ReportView report={report} />}
                 {!isLoading && !error && !report && <InitialState onQuery={(q) => { setQuery(q); handleSearch(q); }} />}
            </div>
        </div>
    );
};