import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { formatNumber, formatDate } from '../utils/formatters';
import type { EconomicIndicator } from '../types';
import { useState } from 'react';

interface IndicatorCardProps {
  indicator: EconomicIndicator;
}

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  const TrendIcon =
    indicator.trend === 'up'
      ? TrendingUp
      : indicator.trend === 'down'
        ? TrendingDown
        : Minus;

  const trendColor =
    indicator.trend === 'up'
      ? 'text-green-600'
      : indicator.trend === 'down'
        ? 'text-red-600'
        : 'text-gray-500';

  const impactBadge =
    indicator.impact === 'positive'
      ? { text: '利多黄金', bg: 'bg-green-100 text-green-700' }
      : indicator.impact === 'negative'
        ? { text: '利空黄金', bg: 'bg-red-100 text-red-700' }
        : { text: '中性', bg: 'bg-gray-100 text-gray-700' };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{indicator.nameZh}</h4>
          <p className="text-xs text-gray-400 truncate">{indicator.name}</p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors ml-1 flex-shrink-0"
        >
          <Info className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-800 leading-relaxed">
          {indicator.descriptionZh}
        </div>
      )}

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {indicator.value !== null ? formatNumber(indicator.value) : 'N/A'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {indicator.unit} &middot; {indicator.date ? formatDate(indicator.date) : ''}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {indicator.change !== null && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {indicator.change >= 0 ? '+' : ''}
                {formatNumber(indicator.change)}
              </span>
            </div>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${impactBadge.bg}`}>
            {impactBadge.text}
          </span>
        </div>
      </div>
    </div>
  );
}
