

import React, { useState } from 'react';
import type { MapVisualization, MapDataPoint } from '../types';

interface OceanMapProps {
  title: string;
  data: MapVisualization;
}

const MapPoint: React.FC<{ point: MapDataPoint; mapSize: { width: number; height: number } }> = ({ point }) => {
  const [isHovered, setIsHovered] = useState(false);
  // A simple pseudo-mercator projection for demonstration
  const x = (point.lon + 180) * (512 / 360);
  const y = (512 / 2) - (256 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (point.lat * Math.PI / 180) / 2));

  // Scale to component size (assuming the map image covers common world longitudes)
  const left = `${(x / 512) * 100}%`;
  const top = `${(y / 512) * 100}%`;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ top, left }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-3 h-3 bg-cyan-400 rounded-full cursor-pointer animate-pulse"></div>
      <div className="w-5 h-5 border-2 border-cyan-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
      {isHovered && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800/80 backdrop-blur-sm text-white p-2 rounded-md shadow-lg text-sm z-10">
          <p className="font-bold">{point.label}</p>
          <p>{point.value}</p>
        </div>
      )}
    </div>
  );
};

export const OceanMap: React.FC<OceanMapProps> = ({ title, data }) => {
  if (!data || !data.points) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-cyan-200">
        <p>Map data is unavailable for this query.</p>
      </div>
    );
  }

  const { center, points, dataType } = data;

  return (
    <div className="w-full h-full flex flex-col text-white p-4 items-center justify-center">
      <h3 className="text-xl font-semibold text-cyan-200 mb-2 text-center">{title}</h3>
      <p className="text-sm text-gray-300 mb-4 text-center">Data Type: {dataType}</p>
      <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden border-2 border-blue-500/50 shadow-lg">
        <img 
          src={`https://picsum.photos/seed/${(center.lat + center.lon)}/1280/720`} 
          alt={`Map centered at ${center.lat}, ${center.lon}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/40"></div>
        {points.map((point, index) => (
          <MapPoint key={index} point={point} mapSize={{ width: 800, height: 450 }} />
        ))}
      </div>
       <p className="mt-4 text-gray-300 text-center italic text-sm">Note: This is a representative visualization. Hover over points for details.</p>
    </div>
  );
};