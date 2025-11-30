

import React from 'react';
import { BrainCircuitIcon, BinocularsIcon, AlertTriangleIcon, TrendingUpIcon } from './icons';
import type { OceanIntelligenceReport } from '../types';
import { useTranslation } from '../i18n';

interface IntelligencePageProps {
    intelligenceReport: OceanIntelligenceReport | null;
    isLoading: boolean;
}

const LoadingState: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full text-cyan-200 animate-pulse">
            <BrainCircuitIcon className="w-24 h-24 text-cyan-400/50 mb-4"/>
            <p className="text-lg">{t('intelligence.loading')}</p>
        </div>
    );
};

const EmptyState: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full text-cyan-200 text-center p-4">
            <BrainCircuitIcon className="w-24 h-24 text-cyan-400/50 mb-6" />
            <h2 className="text-3xl font-bold text-cyan-200 mb-2">
                {t('intelligence.empty.title')}
            </h2>
            <p className="max-w-lg text-gray-300">
                {t('intelligence.empty.description')}
            </p>
        </div>
    );
};

const severityColorMap = {
    Low: 'border-yellow-400 text-yellow-300',
    Medium: 'border-orange-400 text-orange-300',
    High: 'border-red-500 text-red-400',
};

export const InterpretationPage: React.FC<IntelligencePageProps> = ({ intelligenceReport, isLoading }) => {
    const { t } = useTranslation();
    
    const renderContent = () => {
        if (isLoading) return <LoadingState />;
        if (!intelligenceReport) {
            return <EmptyState />;
        }

        const { situationalBriefing, liveDetections, environmentalAnomalies, predictiveForecast } = intelligenceReport;

        return (
            <div className="max-w-7xl mx-auto text-white">
                {/* Situational Briefing */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-cyan-200 mb-3 flex items-center gap-3">
                        <BrainCircuitIcon className="w-8 h-8"/> {t('intelligence.briefing')}
                    </h2>
                    <p className="text-gray-300 leading-relaxed bg-black/20 p-4 rounded-lg">{situationalBriefing}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Live Detections */}
                    <div className="md:col-span-1 space-y-4">
                         <h3 className="text-xl font-semibold text-cyan-200 flex items-center gap-2">
                            <BinocularsIcon className="w-6 h-6"/> {t('intelligence.detections')}
                        </h3>
                        {Array.isArray(liveDetections) && liveDetections.map((detection, index) => (
                            <div key={index} className="bg-black/20 p-3 rounded-lg border-l-4 border-blue-400">
                                <p className="font-bold">{detection.name} <span className="text-xs text-gray-400">({detection.type})</span></p>
                                <p className="text-sm text-gray-300">{detection.details}</p>
                            </div>
                        ))}
                    </div>

                    {/* Environmental Anomalies */}
                    <div className="md:col-span-1 space-y-4">
                         <h3 className="text-xl font-semibold text-cyan-200 flex items-center gap-2">
                            <AlertTriangleIcon className="w-6 h-6"/> {t('intelligence.anomalies')}
                        </h3>
                        {Array.isArray(environmentalAnomalies) && environmentalAnomalies.map((anomaly, index) => (
                            <div key={index} className={`bg-black/20 p-3 rounded-lg border-l-4 ${severityColorMap[anomaly.severity]}`}>
                                <p className="font-bold">{anomaly.parameter}</p>
                                <p className="text-sm">{anomaly.status}</p>
                            </div>
                        ))}
                    </div>

                    {/* Predictive Forecast */}
                    <div className="md:col-span-1 space-y-4">
                         <h3 className="text-xl font-semibold text-cyan-200 flex items-center gap-2">
                            <TrendingUpIcon className="w-6 h-6"/> {t('intelligence.forecast')}
                        </h3>
                        {predictiveForecast && (
                            <div className="bg-black/20 p-3 rounded-lg border-l-4 border-purple-400">
                                <p className="font-bold">{predictiveForecast.topic}</p>
                                <p className="text-sm text-gray-300">{predictiveForecast.trend}</p>
                                <p className="text-xs text-gray-400 mt-1">{predictiveForecast.timeframe}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // FIX: The component was incomplete and not returning a value. It now returns JSX, resolving the type error.
    return (
        <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-4 md:p-6 overflow-y-auto">
            {renderContent()}
        </div>
    );
};
