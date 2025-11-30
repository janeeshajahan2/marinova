import React from 'react';
import { useTranslation } from '../i18n';
import { 
    GlobeIcon, 
    LayersIcon, 
    DocumentReportIcon, 
    CodeIcon, 
    UsersIcon, 
    CloudIcon 
} from './icons';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-black/40 rounded-lg p-6 border border-blue-400/30 flex flex-col gap-4 h-full transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10 hover:scale-[1.02]">
            <div className="flex items-center gap-4">
                <div className="text-cyan-300 bg-cyan-900/50 p-3 rounded-full">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-white flex-1">{title}</h3>
            </div>
            <p className="text-gray-300 text-sm flex-grow">{description}</p>
        </div>
    );
};

export const ClimateAnalysisPage: React.FC = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <LayersIcon className="w-6 h-6" />,
            title: t('climateAnalysis.features.dataFusion.title'),
            description: t('climateAnalysis.features.dataFusion.description'),
        },
        {
            icon: <DocumentReportIcon className="w-6 h-6" />,
            title: t('climateAnalysis.features.customReports.title'),
            description: t('climateAnalysis.features.customReports.description'),
        },
        {
            icon: <CodeIcon className="w-6 h-6" />,
            title: t('climateAnalysis.features.api.title'),
            description: t('climateAnalysis.features.api.description'),
        },
        {
            icon: <UsersIcon className="w-6 h-6" />,
            title: t('climateAnalysis.features.collaboration.title'),
            description: t('climateAnalysis.features.collaboration.description'),
        },
        {
            icon: <CloudIcon className="w-6 h-6" />,
            title: t('climateAnalysis.features.cloud.title'),
            description: t('climateAnalysis.features.cloud.description'),
        },
    ];

    return (
        <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <GlobeIcon className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-cyan-200 mb-2">
                        {t('climateAnalysis.title')}
                    </h2>
                    <p className="max-w-3xl mx-auto text-gray-300">
                        {t('climateAnalysis.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </div>
    );
};