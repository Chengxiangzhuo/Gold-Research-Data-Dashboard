import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { FredSeriesData } from '../types';
import { FRED_SERIES } from '../api/fred';
import { formatDateShort, formatNumber } from '../utils/formatters';

interface MacroChartProps {
  seriesData: Map<string, FredSeriesData>;
  seriesIds: string[];
  title: string;
  colors?: string[];
  height?: number;
  yAxisDomain?: [string | number, string | number];
}

interface MacroTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string; name: string }>;
  label?: string;
}

function MacroTooltip({ active, payload, label }: MacroTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          <span className="font-medium">{entry.name}: </span>
          {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

const DEFAULT_COLORS = ['#d97706', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#0891b2'];

export function MacroChart({
  seriesData,
  seriesIds,
  title,
  colors = DEFAULT_COLORS,
  height = 280,
  yAxisDomain,
}: MacroChartProps) {
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();

    for (const id of seriesIds) {
      const series = seriesData.get(id);
      if (!series) continue;

      for (const obs of series.observations) {
        if (obs.value === '.') continue;
        const existing = dateMap.get(obs.date) ?? {};
        existing[id] = parseFloat(obs.value);
        dateMap.set(obs.date, existing);
      }
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));
  }, [seriesData, seriesIds]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              minTickGap={30}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              domain={yAxisDomain ?? ['auto', 'auto']}
              width={55}
              tickFormatter={(v) => formatNumber(v, 1)}
            />
            <Tooltip content={<MacroTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              iconType="line"
              iconSize={10}
            />
            {seriesIds.map((id, i) => {
              const config = FRED_SERIES.find((s) => s.id === id);
              return (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  name={config?.nameZh ?? id}
                  stroke={colors[i % colors.length]}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
