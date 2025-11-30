import React from 'react';
import { LightbulbIcon, CoralIcon, PlasticIcon, TrendingUpIcon } from './icons';
import { useTranslation } from '../i18n';

interface InsightCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    confidence: number;
    timeframe: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ icon, title, description, confidence, timeframe }) => {
    // FIX: `t` function was out of scope. `useTranslation` must be called inside the component.
    const { t } = useTranslation();
    const confidenceColor = confidence > 75 ? 'text-green-400' : confidence > 50 ? 'text-yellow-400' : 'text-red-400';
    
    return (
        <div className="bg-black/40 rounded-lg p-6 border border-blue-400/30 flex flex-col gap-4 h-full transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10 hover:scale-[1.02]">
            <div className="flex items-center gap-4">
                <div className="text-cyan-300 bg-cyan-900/50 p-3 rounded-full">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-white flex-1">{title}</h3>
            </div>
            <p className="text-gray-300 text-sm flex-grow">{description}</p>
            <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                <div>
                    <span className="text-gray-400">{t('intelligence.confidence') || 'Confidence'}: </span>
                    <span className={`font-bold ${confidenceColor}`}>{confidence}%</span>
                </div>
                <span className="text-gray-400">{timeframe}</span>
            </div>
        </div>
    );
};


export const InsightPredictionPage: React.FC = () => {
    const { t } = useTranslation();

    const insights = [
        {
            icon: <CoralIcon className="w-6 h-6" />,
            title: t('insightPrediction.cards.coralBleaching.title'),
            description: t('insightPrediction.cards.coralBleaching.description'),
            confidence: 85,
            timeframe: t('insightPrediction.cards.coralBleaching.timeframe'),
        },
        {
            icon: <PlasticIcon className="w-6 h-6" />,
            title: t('insightPrediction.cards.plasticDrift.title'),
            description: t('insightPrediction.cards.plasticDrift.description'),
            confidence: 92,
            timeframe: t('insightPrediction.cards.plasticDrift.timeframe'),
        },
        {
            icon: <TrendingUpIcon className="w-6 h-6" />,
            title: t('insightPrediction.cards.algalBloom.title'),
            description: t('insightPrediction.cards.algalBloom.description'),
            confidence: 70,
            timeframe: t('insightPrediction.cards.algalBloom.timeframe'),
        },
    ];

    return (
        <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <LightbulbIcon className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-cyan-200 mb-2">
                        {t('insightPrediction.title')}
                    </h2>
                    <p className="max-w-3xl mx-auto text-gray-300">
                        {t('insightPrediction.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insights.map((insight, index) => (
                        <InsightCard key={index} {...insight} />
                    ))}
                </div>
            </div>
        </div>
    );
};
