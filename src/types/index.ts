export interface GoldPrice {
  price: number;
  currency: string;
  timestamp: number;
  change: number;
  changePercent: number;
  high24h?: number;
  low24h?: number;
  open?: number;
}

export interface SilverPrice {
  price: number;
  currency: string;
  timestamp: number;
}

export interface FredObservation {
  date: string;
  value: string;
}

export interface FredSeriesData {
  seriesId: string;
  title: string;
  observations: FredObservation[];
  units: string;
  frequency: string;
  lastUpdated: string;
}

export interface EconomicIndicator {
  id: string;
  name: string;
  nameZh: string;
  value: number | null;
  previousValue: number | null;
  change: number | null;
  unit: string;
  date: string;
  description: string;
  descriptionZh: string;
  trend: 'up' | 'down' | 'flat';
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface CorrelationData {
  indicator: string;
  indicatorZh: string;
  correlation: number;
  period: string;
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface DashboardState {
  goldPrice: GoldPrice | null;
  silverPrice: SilverPrice | null;
  indicators: EconomicIndicator[];
  historicalGold: ChartDataPoint[];
  correlations: CorrelationData[];
  loading: boolean;
  errors: string[];
  lastRefresh: Date | null;
  fredApiKey: string;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | '10Y' | 'MAX';

export interface FredSeriesConfig {
  id: string;
  name: string;
  nameZh: string;
  unit: string;
  description: string;
  descriptionZh: string;
  impactOnGold: 'positive' | 'negative' | 'neutral';
}
