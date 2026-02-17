import { useEffect, useState } from 'react';
import { fetchExchangeRates } from '../api/exchangeRate';
import type { ExchangeRates } from '../types';
import { formatNumber, formatDate } from '../utils/formatters';
import { DollarSign, AlertCircle } from 'lucide-react';

const CURRENCY_INFO: Record<string, { name: string; nameZh: string; flag: string }> = {
  EUR: { name: 'Euro', nameZh: '欧元', flag: '🇪🇺' },
  GBP: { name: 'British Pound', nameZh: '英镑', flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen', nameZh: '日元', flag: '🇯🇵' },
  CNY: { name: 'Chinese Yuan', nameZh: '人民币', flag: '🇨🇳' },
  CHF: { name: 'Swiss Franc', nameZh: '瑞士法郎', flag: '🇨🇭' },
  CAD: { name: 'Canadian Dollar', nameZh: '加元', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', nameZh: '澳元', flag: '🇦🇺' },
};

export function ExchangeRatePanel() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchExchangeRates();
        setRates(data);
      } catch {
        setError('无法获取汇率数据');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-green-600" />
        <h3 className="text-sm font-semibold text-gray-900">美元汇率</h3>
        {rates && (
          <span className="text-xs text-gray-400 ml-auto">
            {formatDate(rates.date)}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-3">
        美元强弱直接影响以美元计价的黄金价格
      </p>

      <div className="space-y-1.5">
        {rates &&
          Object.entries(rates.rates).map(([currency, rate]) => {
            const info = CURRENCY_INFO[currency];
            if (!info) return null;
            return (
              <div
                key={currency}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{info.flag}</span>
                  <div>
                    <span className="text-xs font-medium text-gray-800">{currency}</span>
                    <span className="text-xs text-gray-400 ml-1">{info.nameZh}</span>
                  </div>
                </div>
                <span className="text-sm font-mono font-medium text-gray-900">
                  {formatNumber(rate, currency === 'JPY' ? 2 : 4)}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
