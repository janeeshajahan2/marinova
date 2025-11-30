import React from 'react';
import type { VisualizationData } from '../types';
import { VisualizationType } from '../types';
import { TimeSeriesChart } from './TimeSeriesChart';
import { OceanMap } from './OceanMap';
import { OceanLayers } from './OceanLayers';
import { Model3DViewer } from './Model3DViewer';
import { ChartIcon, GlobeIcon, LayersIcon, InfoIcon, CubeIcon } from './icons';
import { useTranslation } from '../i18n';

interface VisualizationPanelProps {
  visualization: VisualizationData | null;
  isLoading: boolean;
}

const LoadingState: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full text-cyan-200 animate-pulse">
            <ChartIcon className="w-24 h-24 text-cyan-400/50 mb-4"/>
            <p className="text-lg">{t('visualization.loading')}</p>
        </div>
    );
}

const EmptyState: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full text-cyan-200 text-center p-4">
            <div className="flex items-center justify-center gap-4 mb-4">
                <GlobeIcon className="w-16 h-16 text-cyan-400/50"/>
                <ChartIcon className="w-16 h-16 text-cyan-400/50"/>
                <CubeIcon className="w-16 h-16 text-cyan-400/50"/>
            </div>
            <h3 className="text-2xl font-bold mb-2">{t('visualization.empty.title')}</h3>
            <p className="max-w-md text-gray-300">
                {t('visualization.empty.description')}
            </p>
        </div>
    );
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ visualization, isLoading }) => {
    const { t } = useTranslation();
    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }

        if (!visualization) {
            return <EmptyState />;
        }

        switch (visualization.type) {
            case VisualizationType.CHART:
                return <TimeSeriesChart title={visualization.title} data={visualization.data.chart} />;
            case VisualizationType.MAP:
                return <OceanMap title={visualization.title} data={visualization.data.map} />;
            case VisualizationType.LAYERS:
                return <OceanLayers title={visualization.title} data={visualization.data.layers} />;
            case VisualizationType.THREE_D_MODEL:
                return <Model3DViewer title={visualization.title} data={visualization.data.threeDModel} />;
            default:
                return (
                     <div className="flex flex-col items-center justify-center h-full text-cyan-200 text-center p-4">
                        <InfoIcon className="w-24 h-24 text-cyan-400/50 mb-4"/>
                        <h3 className="text-2xl font-bold mb-2">{t('visualization.awaiting.title')}</h3>
                        <p className="max-w-md text-gray-300">{visualization.title}</p>
                    </div>
                );
        }
    };

    return (
        <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-4 overflow-hidden">
            {renderContent()}
        </div>
    );
};
