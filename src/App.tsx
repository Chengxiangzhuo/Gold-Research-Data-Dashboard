import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { GoldPriceChart } from './components/GoldPriceChart';
import { IndicatorCard } from './components/IndicatorCard';
import { MacroChart } from './components/MacroChart';
import { CorrelationMatrix } from './components/CorrelationMatrix';
import { ExchangeRatePanel } from './components/ExchangeRatePanel';
import { GoldDriversExplainer } from './components/GoldDriversExplainer';
import { SettingsModal } from './components/SettingsModal';
import { useGoldPrice } from './hooks/useGoldPrice';
import { useFredData } from './hooks/useFredData';
import type { TimeRange } from './types';
import { AlertCircle, Key } from 'lucide-react';

const STORAGE_KEY = 'gold-dashboard-fred-key';

function getStoredKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? import.meta.env.VITE_FRED_API_KEY ?? '';
  } catch {
    return import.meta.env.VITE_FRED_API_KEY ?? '';
  }
}

export default function App() {
  const [fredApiKey, setFredApiKey] = useState<string>(getStoredKey);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('2Y');

  const {
    goldPrice,
    silverPrice,
    loading: goldLoading,
    error: goldError,
    refresh: refreshGold,
  } = useGoldPrice(60000);

  const {
    seriesData,
    indicators,
    historicalGold,
    loading: fredLoading,
    error: fredError,
    refresh: refreshFred,
  } = useFredData(fredApiKey, timeRange);

  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = useCallback(() => {
    refreshGold();
    refreshFred();
    setLastRefresh(new Date());
  }, [refreshGold, refreshFred]);

  const handleSaveFredApiKey = useCallback((key: string) => {
    setFredApiKey(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch { /* ignore */ }
  }, []);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  const keyIndicatorIds = [
    'FEDFUNDS', 'CPIAUCSL', 'DGS10', 'DGS2',
    'DFII10', 'T10YIE', 'DTWEXBGS', 'M2SL',
    'UNRATE', 'DCOILWTICO', 'VIXCLS',
  ];

  const filteredIndicators = indicators.filter((ind) =>
    keyIndicatorIds.includes(ind.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
        onOpenSettings={() => setSettingsOpen(true)}
        loading={goldLoading || fredLoading}
      />

      <main className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        {/* Errors */}
        {goldError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>黄金价格数据: {goldError}</span>
          </div>
        )}

        {/* API Key Prompt */}
        {!fredApiKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800">请配置 FRED API Key</h3>
                <p className="text-xs text-amber-700 mt-1">
                  需要 FRED API Key 来获取 CPI、联邦利率、国债收益率等宏观经济数据。
                  FRED API Key 完全免费，
                  <a
                    href="https://fred.stlouisfed.org/docs/api/api_key.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    点此申请
                  </a>
                  ，然后点击右上角设置按钮填入即可。
                </p>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="mt-2 px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  前往设置
                </button>
              </div>
            </div>
          </div>
        )}

        {fredError && fredApiKey && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>FRED 数据: {fredError}</span>
          </div>
        )}

        {/* Section 1: Real-time Prices */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            实时贵金属价格
          </h2>
          <PriceCard goldPrice={goldPrice} silverPrice={silverPrice} loading={goldLoading} />
        </section>

        {/* Section 2: Gold Price Chart */}
        {fredApiKey && (
          <section>
            <GoldPriceChart
              data={historicalGold}
              loading={fredLoading}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </section>
        )}

        {/* Section 3: Key Economic Indicators */}
        {fredApiKey && filteredIndicators.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              关键宏观经济指标
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredIndicators.map((indicator) => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Charts Grid */}
        {fredApiKey && seriesData.size > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              宏观指标走势图
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MacroChart
                seriesData={seriesData}
                seriesIds={['XAUUSD', 'DFII10']}
                title="金价 vs 实际利率"
                colors={['#d97706', '#dc2626']}
              />
              <MacroChart
                seriesData={seriesData}
                seriesIds={['XAUUSD', 'DTWEXBGS']}
                title="金价 vs 美元指数"
                colors={['#d97706', '#2563eb']}
              />
              <MacroChart
                seriesData={seriesData}
                seriesIds={['FEDFUNDS', 'DGS10', 'DGS2']}
                title="利率环境: 联邦利率 / 10年期 / 2年期国债"
                colors={['#dc2626', '#2563eb', '#16a34a']}
              />
              <MacroChart
                seriesData={seriesData}
                seriesIds={['CPIAUCSL', 'T10YIE']}
                title="通胀: CPI vs 通胀预期"
                colors={['#dc2626', '#f59e0b']}
              />
              <MacroChart
                seriesData={seriesData}
                seriesIds={['M2SL']}
                title="M2 货币供应量"
                colors={['#7c3aed']}
              />
              <MacroChart
                seriesData={seriesData}
                seriesIds={['VIXCLS']}
                title="VIX 恐慌指数"
                colors={['#dc2626']}
              />
            </div>
          </section>
        )}

        {/* Section 5: Correlation + Exchange Rates + Education */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {fredApiKey && (
            <div className="lg:col-span-2">
              <CorrelationMatrix seriesData={seriesData} goldData={historicalGold} />
            </div>
          )}
          <div className={fredApiKey ? '' : 'lg:col-span-3'}>
            <div className="space-y-4">
              <ExchangeRatePanel />
              <GoldDriversExplainer />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Gold Research Dashboard &middot; 数据来源: Binance (XAUUSDT), FreeGoldAPI, FRED, ECB (Frankfurter API)
          </p>
          <p className="text-xs text-gray-300 mt-1">
            免责声明：本仪表盘仅供研究参考，不构成任何投资建议。投资有风险，决策需谨慎。
          </p>
        </footer>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fredApiKey={fredApiKey}
        onSaveFredApiKey={handleSaveFredApiKey}
      />
    </div>
  );
}
