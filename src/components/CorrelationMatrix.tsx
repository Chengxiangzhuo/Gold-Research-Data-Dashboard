import { useMemo } from 'react';
import type { FredSeriesData } from '../types';
import { FRED_SERIES } from '../api/fred';
import { calculateCorrelation, alignTimeSeries } from '../utils/calculations';
import type { ChartDataPoint } from '../types';

interface CorrelationMatrixProps {
  seriesData: Map<string, FredSeriesData>;
  goldData: ChartDataPoint[];
}

interface CorrelationItem {
  id: string;
  nameZh: string;
  correlation: number;
  impactOnGold: 'positive' | 'negative' | 'neutral';
}

function getCorrelationColor(value: number): string {
  if (value >= 0.7) return 'bg-green-600 text-white';
  if (value >= 0.4) return 'bg-green-400 text-white';
  if (value >= 0.2) return 'bg-green-200 text-green-900';
  if (value > -0.2) return 'bg-gray-100 text-gray-700';
  if (value > -0.4) return 'bg-red-200 text-red-900';
  if (value > -0.7) return 'bg-red-400 text-white';
  return 'bg-red-600 text-white';
}

function getCorrelationLabel(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 0.7) return '强';
  if (abs >= 0.4) return '中等';
  if (abs >= 0.2) return '弱';
  return '极弱';
}

export function CorrelationMatrix({ seriesData, goldData }: CorrelationMatrixProps) {
  const correlations = useMemo<CorrelationItem[]>(() => {
    if (goldData.length === 0) return [];

    const excludeIds = new Set(['GOLDAMGBD228NLBM']);
    const items: CorrelationItem[] = [];

    for (const [id, data] of seriesData) {
      if (excludeIds.has(id)) continue;

      const config = FRED_SERIES.find((s) => s.id === id);
      if (!config) continue;

      const indicatorPoints: ChartDataPoint[] = data.observations
        .filter((o) => o.value !== '.')
        .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

      const { values1, values2 } = alignTimeSeries(goldData, indicatorPoints);

      if (values1.length < 10) continue;

      const corr = calculateCorrelation(values1, values2);
      items.push({
        id,
        nameZh: config.nameZh,
        correlation: corr,
        impactOnGold: config.impactOnGold,
      });
    }

    return items.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [seriesData, goldData]);

  if (correlations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          黄金价格与宏观指标相关性分析
        </h3>
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          暂无足够数据计算相关性
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          黄金价格与宏观指标相关性分析
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          基于选定时间范围内的皮尔逊相关系数计算 (Pearson Correlation)
        </p>
      </div>

      <div className="space-y-2">
        {correlations.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-44 text-xs text-gray-700 truncate flex-shrink-0">
              {item.nameZh}
            </div>
            <div className="flex-1 relative h-6 bg-gray-50 rounded overflow-hidden">
              <div
                className={`absolute top-0 h-full rounded transition-all ${
                  item.correlation >= 0
                    ? 'left-1/2 bg-green-400/70'
                    : 'right-1/2 bg-red-400/70'
                }`}
                style={{
                  width: `${Math.abs(item.correlation) * 50}%`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-full bg-gray-300" style={{ left: '50%' }} />
              </div>
            </div>
            <div className={`w-20 text-center text-xs font-mono font-medium rounded px-2 py-1 ${getCorrelationColor(item.correlation)}`}>
              {item.correlation >= 0 ? '+' : ''}
              {item.correlation.toFixed(3)}
            </div>
            <div className="w-10 text-[10px] text-gray-400 text-center">
              {getCorrelationLabel(item.correlation)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-green-400 rounded" /> 正相关
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-red-400 rounded" /> 负相关
          </span>
          <span>范围: -1 (完全负相关) 到 +1 (完全正相关)</span>
        </div>
      </div>
    </div>
  );
}
