
import React from 'react';
import type { VisualizationData } from '../types';
import { VisualizationPanel } from './VisualizationPanel';

interface VisualizationPageProps {
  visualization: VisualizationData | null;
  isLoading: boolean;
}

export const VisualizationPage: React.FC<VisualizationPageProps> = (props) => {
  return (
    <div className="h-full w-full">
        <VisualizationPanel 
            visualization={props.visualization} 
            isLoading={props.isLoading} 
        />
    </div>
  );
};