import axios from 'axios';
import type { GoldPrice, SilverPrice } from '../types';

const BINANCE_FAPI = '/api/binance/fapi/v1';

// --- 24hr Ticker (real-time price) ---

interface Ticker24hr {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
  closeTime: number;
}

export async function fetchBinanceGoldPrice(): Promise<{
  gold: GoldPrice;
  silver: SilverPrice;
}> {
  const [goldRes, silverRes] = await Promise.all([
    axios.get<Ticker24hr>(`${BINANCE_FAPI}/ticker/24hr`, {
      params: { symbol: 'XAUUSDT' },
      timeout: 10000,
    }),
    axios
      .get<Ticker24hr>(`${BINANCE_FAPI}/ticker/24hr`, {
        params: { symbol: 'XAGUSDT' },
        timeout: 10000,
      })
      .catch(() => null),
  ]);

  const g = goldRes.data;

  const gold: GoldPrice = {
    price: parseFloat(g.lastPrice),
    currency: 'USD',
    timestamp: g.closeTime,
    change: parseFloat(g.priceChange),
    changePercent: parseFloat(g.priceChangePercent),
    high24h: parseFloat(g.highPrice),
    low24h: parseFloat(g.lowPrice),
    open: parseFloat(g.openPrice),
  };

  let silver: SilverPrice;
  if (silverRes) {
    const s = silverRes.data;
    silver = {
      price: parseFloat(s.lastPrice),
      currency: 'USD',
      timestamp: s.closeTime,
    };
  } else {
    silver = { price: 0, currency: 'USD', timestamp: Date.now() };
  }

  return { gold, silver };
}

// --- Klines (historical candlesticks) ---

export interface BinanceKline {
  openTime: number;
  close: number;
}

export async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  startTime?: number,
  endTime?: number,
  limit = 1000,
): Promise<BinanceKline[]> {
  const params: Record<string, string | number> = { symbol, interval, limit };
  if (startTime) params.startTime = startTime;
  if (endTime) params.endTime = endTime;

  const response = await axios.get(`${BINANCE_FAPI}/klines`, {
    params,
    timeout: 15000,
  });

  return (response.data as unknown[][]).map((k) => ({
    openTime: k[0] as number,
    close: parseFloat(k[4] as string),
  }));
}
