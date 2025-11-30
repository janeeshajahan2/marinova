
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area, TooltipProps } from 'recharts';
import { ChartIcon } from './icons';
import type { ChartVisualization } from '../types';

interface TimeSeriesChartProps {
  title: string;
  data: ChartVisualization;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm border border-cyan-400/50 p-3 rounded-lg shadow-lg text-white">
        <p className="label font-bold text-cyan-200">{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};


export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ title, data: chartData }) => {
  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-cyan-200">
        <ChartIcon className="w-16 h-16 text-cyan-400/50 mb-4" />
        <p>No chart data available.</p>
      </div>
    );
  }

  const { data, yAxisLabel, series1Name, series2Name } = chartData;
  const isComparison = data[0]?.value2 !== undefined;
  const useAreaChart = data.length > 2;

  return (
    <div className="w-full h-full flex flex-col text-white p-2">
      <h3 className="text-lg font-semibold text-cyan-200 mb-4 text-center">{title}</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          {useAreaChart ? (
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
                {isComparison && (
                  <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2563eb30" />
              <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#9ca3af', style: {textAnchor: 'middle'} }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#ffffff', paddingTop: '20px' }} />
              <Area type="monotone" dataKey="value1" name={series1Name} stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorValue1)" />
              {isComparison && <Area type="monotone" dataKey="value2" name={series2Name} stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorValue2)" />}
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2563eb30" />
              <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#ffffff', paddingTop: '20px' }} />
              <Bar dataKey="value1" fill="#34d399" name={series1Name} />
              {isComparison && <Bar dataKey="value2" fill="#f87171" name={series2Name} />}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
