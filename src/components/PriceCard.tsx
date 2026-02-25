import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { calculateGoldSilverRatio } from '../utils/calculations';
import type { GoldPrice, SilverPrice } from '../types';

interface PriceCardProps {
  goldPrice: GoldPrice | null;
  silverPrice: SilverPrice | null;
  loading: boolean;
}

function PriceSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-8 bg-gray-200 rounded w-40" />
      <div className="h-4 bg-gray-200 rounded w-32" />
    </div>
  );
}

export function PriceCard({ goldPrice, silverPrice, loading }: PriceCardProps) {
  if (loading && !goldPrice) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <PriceSkeleton />
          </div>
        ))}
      </div>
    );
  }

  const TrendIcon = goldPrice
    ? goldPrice.change > 0
      ? TrendingUp
      : goldPrice.change < 0
        ? TrendingDown
        : Minus
    : Minus;

  const trendColor = goldPrice
    ? goldPrice.change > 0
      ? 'text-green-600'
      : goldPrice.change < 0
        ? 'text-red-600'
        : 'text-gray-500'
    : 'text-gray-500';

  const trendBg = goldPrice
    ? goldPrice.change > 0
      ? 'bg-green-50'
      : goldPrice.change < 0
        ? 'bg-red-50'
        : 'bg-gray-50'
    : 'bg-gray-50';

  const gsRatio =
    goldPrice && silverPrice
      ? calculateGoldSilverRatio(goldPrice.price, silverPrice.price)
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Gold Price */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-sm border border-yellow-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-yellow-800">XAU/USD 黄金</span>
          <span className="text-xs text-yellow-600/70">Binance XAUUSDT</span>
        </div>
        <div className="text-3xl font-bold text-yellow-900 mb-2">
          {goldPrice ? formatCurrency(goldPrice.price) : '--'}
        </div>
        {goldPrice && (
          <div className={`flex items-center gap-1.5 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className={`text-sm font-medium px-1.5 py-0.5 rounded ${trendBg}`}>
              {goldPrice.change >= 0 ? '+' : ''}
              {formatNumber(goldPrice.change)} ({formatPercent(goldPrice.changePercent)})
            </span>
          </div>
        )}
      </div>

      {/* Silver Price */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">XAG/USD 现货白银</span>
          <span className="text-xs text-gray-500">Troy Ounce</span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {silverPrice ? formatCurrency(silverPrice.price) : '--'}
        </div>
        {silverPrice && (
          <div className="text-sm text-gray-500">
            白银现货价格
          </div>
        )}
      </div>

      {/* Gold/Silver Ratio */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-blue-800">金银比</span>
          <span className="text-xs text-blue-600/70">Gold/Silver Ratio</span>
        </div>
        <div className="text-3xl font-bold text-blue-900 mb-2">
          {gsRatio ? formatNumber(gsRatio, 1) : '--'}
        </div>
        <div className="text-xs text-blue-600/70">
          历史均值约 60-70，高于 80 可能表明白银被低估
        </div>
      </div>
    </div>
  );
}
