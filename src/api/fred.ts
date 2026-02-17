import axios from 'axios';
import type { FredObservation, FredSeriesConfig, FredSeriesData } from '../types';

const FRED_BASE = '/api/fred/fred/series/observations';

export const FRED_SERIES: FredSeriesConfig[] = [
  {
    id: 'CPIAUCSL',
    name: 'CPI (All Urban Consumers)',
    nameZh: '消费者价格指数 (CPI)',
    unit: 'Index 1982-84=100',
    description: 'Consumer Price Index for All Urban Consumers: All Items',
    descriptionZh: '衡量城市消费者购买一篮子商品和服务的价格变化，是通胀的核心指标',
    impactOnGold: 'positive',
  },
  {
    id: 'FEDFUNDS',
    name: 'Federal Funds Rate',
    nameZh: '联邦基金利率',
    unit: '%',
    description: 'Effective Federal Funds Rate',
    descriptionZh: '美联储设定的银行间隔夜拆借利率，是美国货币政策的核心工具',
    impactOnGold: 'negative',
  },
  {
    id: 'DGS10',
    name: '10-Year Treasury Yield',
    nameZh: '10年期美国国债收益率',
    unit: '%',
    description: '10-Year Treasury Constant Maturity Rate',
    descriptionZh: '美国10年期国债收益率，反映市场对经济前景和通胀的预期',
    impactOnGold: 'negative',
  },
  {
    id: 'DGS2',
    name: '2-Year Treasury Yield',
    nameZh: '2年期美国国债收益率',
    unit: '%',
    description: '2-Year Treasury Constant Maturity Rate',
    descriptionZh: '短期国债收益率，对美联储政策变化更敏感',
    impactOnGold: 'negative',
  },
  {
    id: 'T10YIE',
    name: '10-Year Breakeven Inflation',
    nameZh: '10年期通胀预期',
    unit: '%',
    description: '10-Year Breakeven Inflation Rate',
    descriptionZh: '市场隐含的未来10年年均通胀率预期，由TIPS与名义国债利差计算',
    impactOnGold: 'positive',
  },
  {
    id: 'DFII10',
    name: '10-Year Real Interest Rate',
    nameZh: '10年期实际利率',
    unit: '%',
    description: '10-Year Treasury Inflation-Indexed Security, Constant Maturity',
    descriptionZh: '扣除通胀后的实际回报率，与黄金价格高度负相关',
    impactOnGold: 'negative',
  },
  {
    id: 'DTWEXBGS',
    name: 'US Dollar Index (Trade Weighted)',
    nameZh: '美元指数（贸易加权）',
    unit: 'Index Jan 2006=100',
    description: 'Nominal Broad U.S. Dollar Index',
    descriptionZh: '贸易加权美元指数，衡量美元相对于主要贸易伙伴货币的强弱',
    impactOnGold: 'negative',
  },
  {
    id: 'M2SL',
    name: 'M2 Money Supply',
    nameZh: 'M2货币供应量',
    unit: 'Billions USD',
    description: 'M2 Money Stock',
    descriptionZh: '广义货币供应量，包括现金、活期存款、储蓄存款等，反映货币宽松程度',
    impactOnGold: 'positive',
  },
  {
    id: 'UNRATE',
    name: 'Unemployment Rate',
    nameZh: '失业率',
    unit: '%',
    description: 'Unemployment Rate',
    descriptionZh: '劳动力市场健康程度的关键指标，高失业率可能推动宽松政策利好黄金',
    impactOnGold: 'positive',
  },
  {
    id: 'GOLDAMGBD228NLBM',
    name: 'Gold Fixing Price (London AM)',
    nameZh: '伦敦金早盘定盘价',
    unit: 'USD/Troy Ounce',
    description: 'Gold Fixing Price in London Bullion Market (AM Fix)',
    descriptionZh: '伦敦金银市场协会(LBMA)每日上午定盘价，全球黄金定价基准',
    impactOnGold: 'positive',
  },
  {
    id: 'DCOILWTICO',
    name: 'WTI Crude Oil Price',
    nameZh: 'WTI原油价格',
    unit: 'USD/Barrel',
    description: 'Crude Oil Prices: West Texas Intermediate',
    descriptionZh: '西德克萨斯中质原油价格，能源价格影响通胀预期，间接影响黄金',
    impactOnGold: 'positive',
  },
  {
    id: 'VIXCLS',
    name: 'VIX Volatility Index',
    nameZh: 'VIX恐慌指数',
    unit: 'Index',
    description: 'CBOE Volatility Index: VIX',
    descriptionZh: '市场恐慌与不确定性指标，恐慌上升时资金倾向流入黄金等避险资产',
    impactOnGold: 'positive',
  },
];

export async function fetchFredSeries(
  seriesId: string,
  apiKey: string,
  startDate?: string,
  endDate?: string,
  frequency?: string
): Promise<FredObservation[]> {
  const params: Record<string, string> = {
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    sort_order: 'asc',
  };

  if (startDate) params.observation_start = startDate;
  if (endDate) params.observation_end = endDate;
  if (frequency) params.frequency = frequency;

  const response = await axios.get(FRED_BASE, { params });
  return response.data.observations.filter(
    (obs: FredObservation) => obs.value !== '.'
  );
}

export async function fetchFredSeriesFull(
  seriesId: string,
  apiKey: string,
  startDate?: string
): Promise<FredSeriesData> {
  const config = FRED_SERIES.find((s) => s.id === seriesId);
  const observations = await fetchFredSeries(seriesId, apiKey, startDate);

  return {
    seriesId,
    title: config?.name ?? seriesId,
    observations,
    units: config?.unit ?? '',
    frequency: '',
    lastUpdated: observations.length > 0 ? observations[observations.length - 1].date : '',
  };
}

export async function fetchMultipleFredSeries(
  seriesIds: string[],
  apiKey: string,
  startDate?: string
): Promise<Map<string, FredSeriesData>> {
  const results = new Map<string, FredSeriesData>();

  const promises = seriesIds.map(async (id) => {
    try {
      const data = await fetchFredSeriesFull(id, apiKey, startDate);
      return { id, data };
    } catch (error) {
      console.error(`Failed to fetch FRED series ${id}:`, error);
      return { id, data: null };
    }
  });

  const settled = await Promise.all(promises);
  for (const result of settled) {
    if (result.data) {
      results.set(result.id, result.data);
    }
  }

  return results;
}
