
import React from 'react';
import { useTranslation } from '../i18n';
import { TemperatureIcon, ScienceIcon, GlobeIcon, SalinityIcon, CurrentIcon, WaveIcon } from './icons';

const oceanData = [
  {
    key: 'pacific',
    timestamp: '08:42 UTC',
    metrics: {
      temperature: '19.4°C',
      salinity: '34.5 PSU',
      current: '0.8 knots',
      acidity: '8.08 pH',
      waveHeight: '2.5 m'
    }
  },
  {
    key: 'atlantic',
    timestamp: '08:45 UTC',
    metrics: {
      temperature: '17.2°C',
      salinity: '35.2 PSU',
      current: '1.1 knots',
      acidity: '8.09 pH',
      waveHeight: '2.8 m'
    }
  },
  {
    key: 'indian',
    timestamp: '08:39 UTC',
    metrics: {
      temperature: '22.8°C',
      salinity: '34.8 PSU',
      current: '0.9 knots',
      acidity: '8.10 pH',
      waveHeight: '2.1 m'
    }
  },
  {
    key: 'southern',
    timestamp: '08:30 UTC',
    metrics: {
      temperature: '-0.5°C',
      salinity: '34.2 PSU',
      current: '1.5 knots',
      acidity: '8.12 pH',
      waveHeight: '4.5 m'
    }
  },
  {
    key: 'arctic',
    timestamp: '08:35 UTC',
    metrics: {
      temperature: '-1.2°C',
      salinity: '31.5 PSU',
      current: '0.5 knots',
      acidity: '8.15 pH',
      waveHeight: '1.5 m'
    }
  },
];

const metricIcons: { [key: string]: React.ReactNode } = {
  temperature: <TemperatureIcon className="w-6 h-6" />,
  salinity: <SalinityIcon className="w-6 h-6" />,
  current: <CurrentIcon className="w-6 h-6" />,
  acidity: <ScienceIcon className="w-6 h-6" />,
  waveHeight: <WaveIcon className="w-6 h-6" />,
};

interface MetricRowProps {
  metricKey: string;
  value: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ metricKey, value }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between py-2 border-b border-blue-400/20 last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="text-cyan-300">{metricIcons[metricKey]}</span>
        <span className="text-gray-300">{t(`dashboard.oceans.metrics.${metricKey}`)}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
};

interface OceanDataCardProps {
  ocean: typeof oceanData[0];
}

const OceanDataCard: React.FC<OceanDataCardProps> = ({ ocean }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 p-4 flex flex-col gap-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-cyan-200 flex items-center justify-center gap-2">
            <GlobeIcon className="w-6 h-6" />
            {t(`dashboard.oceans.${ocean.key}`)}
        </h3>
        <p className="text-xs text-cyan-400/60 mt-1 font-mono">
            Data taken at {ocean.timestamp}
        </p>
      </div>
      <div className="space-y-2">
        <MetricRow metricKey="temperature" value={ocean.metrics.temperature} />
        <MetricRow metricKey="salinity" value={ocean.metrics.salinity} />
        <MetricRow metricKey="current" value={ocean.metrics.current} />
        <MetricRow metricKey="acidity" value={ocean.metrics.acidity} />
        <MetricRow metricKey="waveHeight" value={ocean.metrics.waveHeight} />
      </div>
    </div>
  );
};

export const DashboardWidgets: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="h-full w-full overflow-y-auto p-2">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">{t('dashboard.oceans.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {oceanData.map(ocean => (
                 <OceanDataCard key={ocean.key} ocean={ocean} />
               ))}
            </div>
        </div>
    );
};
