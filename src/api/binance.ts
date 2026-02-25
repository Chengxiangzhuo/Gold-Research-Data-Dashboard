import axios from 'axios';
import type { GoldPrice, SilverPrice } from '../types';

const BINANCE_FAPI = '/api/binance/fapi/v1';

// --- 24hr Ticker (real-time price with change info) ---

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

interface TickerPrice {
  symbol: string;
  price: string;
  time: number;
}

function parseTicker24hr(data: Ticker24hr): GoldPrice {
  return {
    price: parseFloat(data.lastPrice),
    currency: 'USD',
    timestamp: data.closeTime,
    change: parseFloat(data.priceChange),
    changePercent: parseFloat(data.priceChangePercent),
    high24h: parseFloat(data.highPrice),
    low24h: parseFloat(data.lowPrice),
    open: parseFloat(data.openPrice),
  };
}

/** Full 24hr ticker — rich data (change, high, low, etc.) */
async function fetchTicker24hr(symbol: string): Promise<Ticker24hr> {
  const res = await axios.get<Ticker24hr>(`${BINANCE_FAPI}/ticker/24hr`, {
    params: { symbol },
    timeout: 10000,
  });
  return res.data;
}

/** Lightweight price ticker — fallback when 24hr is unavailable */
async function fetchTickerPrice(symbol: string): Promise<TickerPrice> {
  const res = await axios.get<TickerPrice>(`${BINANCE_FAPI}/ticker/price`, {
    params: { symbol },
    timeout: 10000,
  });
  return res.data;
}

export async function fetchBinanceGoldPrice(): Promise<{
  gold: GoldPrice;
  silver: SilverPrice;
}> {
  // Try 24hr ticker first (full data)
  let gold: GoldPrice;
  try {
    const ticker = await fetchTicker24hr('XAUUSDT');
    gold = parseTicker24hr(ticker);
  } catch (err24hr) {
    console.warn('[Binance] 24hr ticker failed, trying price ticker:', err24hr);
    // Fallback: lightweight price endpoint
    const priceTicker = await fetchTickerPrice('XAUUSDT');
    gold = {
      price: parseFloat(priceTicker.price),
      currency: 'USD',
      timestamp: priceTicker.time,
      change: 0,
      changePercent: 0,
    };
  }

  // Silver (best-effort)
  let silver: SilverPrice;
  try {
    const silverTicker = await fetchTicker24hr('XAGUSDT');
    silver = {
      price: parseFloat(silverTicker.lastPrice),
      currency: 'USD',
      timestamp: silverTicker.closeTime,
    };
  } catch {
    try {
      const silverPrice = await fetchTickerPrice('XAGUSDT');
      silver = {
        price: parseFloat(silverPrice.price),
        currency: 'USD',
        timestamp: silverPrice.time,
      };
    } catch {
      silver = { price: 0, currency: 'USD', timestamp: Date.now() };
    }
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
