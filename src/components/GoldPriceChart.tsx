import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ChartDataPoint, TimeRange } from '../types';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import { movingAverage } from '../utils/calculations';

interface GoldPriceChartProps {
  data: ChartDataPoint[];
  loading: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1M', label: '1月' },
  { value: '3M', label: '3月' },
  { value: '6M', label: '6月' },
  { value: '1Y', label: '1年' },
  { value: '2Y', label: '2年' },
  { value: '5Y', label: '5年' },
  { value: '10Y', label: '10年' },
  { value: 'MAX', label: '全部' },
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.dataKey === 'value' ? '金价' : 'MA50'}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function GoldPriceChart({ data, loading, timeRange, onTimeRangeChange }: GoldPriceChartProps) {
  const [showMA, setShowMA] = useState(true);

  const ma50 = useMemo(() => movingAverage(data, 50), [data]);

  const mergedData = useMemo(() => {
    if (!showMA) return data;
    const maMap = new Map(ma50.map((p) => [p.date, p.value]));
    return data.map((p) => ({
      ...p,
      ma50: maMap.get(p.date) ?? null,
    }));
  }, [data, ma50, showMA]);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const values = data.map((d) => d.value);
    const current = values[values.length - 1];
    const first = values[0];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const change = current - first;
    const changePct = (change / first) * 100;
    return { current, first, min, max, avg, change, changePct };
  }, [data]);

  if (loading && data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-[350px] bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">黄金价格走势 (XAU/USD)</h3>
          {stats && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
              <span>最高: {formatCurrency(stats.max)}</span>
              <span>最低: {formatCurrency(stats.min)}</span>
              <span>均值: {formatCurrency(stats.avg)}</span>
              <span className={stats.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                区间涨跌: {stats.change >= 0 ? '+' : ''}{stats.changePct.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={showMA}
              onChange={(e) => setShowMA(e.target.checked)}
              className="w-3 h-3 rounded accent-amber-600"
            />
            MA50
          </label>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.value}
                onClick={() => onTimeRangeChange(tr.value)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  timeRange === tr.value
                    ? 'bg-yellow-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mergedData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              minTickGap={40}
            />
            <YAxis
              tickFormatter={(v) => `$${v.toLocaleString()}`}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              width={70}
            />
            <Tooltip content={<ChartTooltip />} />
            {stats && (
              <ReferenceLine
                y={stats.avg}
                stroke="#9ca3af"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#d97706"
              fill="url(#goldGradient)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: '#d97706' }}
            />
            {showMA && (
              <Area
                type="monotone"
                dataKey="ma50"
                stroke="#6366f1"
                fill="none"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                connectNulls={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
