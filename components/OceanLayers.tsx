import React from 'react';
import { LayersIcon } from './icons';

interface OceanLayersData {
  surface: string;
  mid: string;
  deep: string;
}

interface OceanLayersProps {
  title: string;
  data: OceanLayersData;
}

const Layer: React.FC<{ name: string; depth: string; description: string; className: string }> = ({ name, depth, description, className }) => (
    <div className={`relative flex-1 flex items-center justify-start p-4 md:p-6 transition-all duration-300 hover:flex-grow-[1.2] ${className}`}>
        <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-baseline">
                <h4 className="text-lg font-bold text-white">{name}</h4>
                <span className="text-sm text-gray-300 font-mono">{depth}</span>
            </div>
            <p className="mt-2 text-gray-200 text-sm">{description}</p>
        </div>
    </div>
);


export const OceanLayers: React.FC<OceanLayersProps> = ({ title, data }) => {
  return (
    <div className="w-full h-full flex flex-col text-white">
      <div className="text-center mb-4 flex-shrink-0">
          <LayersIcon className="w-10 h-10 text-cyan-300 mx-auto mb-2"/>
          <h3 className="text-xl font-semibold text-cyan-200">{title}</h3>
      </div>
      <div className="flex-grow flex flex-col rounded-lg overflow-hidden border border-blue-500/30">
        <Layer
            name="Surface Layer (Epipelagic)"
            depth="0 - 200m"
            description={data.surface}
            className="bg-cyan-500/50"
        />
        <Layer
            name="Twilight Zone (Mesopelagic)"
            depth="200m - 1000m"
            description={data.mid}
            className="bg-blue-600/60"
        />
        <Layer
            name="Midnight Zone (Bathypelagic)"
            depth="> 1000m"
            description={data.deep}
            className="bg-indigo-800/70"
        />
      </div>
    </div>
  );
};