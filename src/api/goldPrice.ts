import axios from 'axios';
import { fetchBinanceGoldPrice } from './binance';
import type { GoldPrice, SilverPrice } from '../types';

// --- Fallback: GoldPrice.org ---

interface GoldPriceOrgResponse {
  items: Array<{
    xauPrice: number;
    xagPrice: number;
    chgXau: number;
    chgXag: number;
    pcXau: number;
    pcXag: number;
    xauClose: number;
    xagClose: number;
    curr: string;
    ts: number;
  }>;
}

async function fetchGoldPriceOrg(): Promise<{ gold: GoldPrice; silver: SilverPrice }> {
  const response = await axios.get<GoldPriceOrgResponse>(
    '/api/goldprice/dbXRates/USD',
    { timeout: 10000 },
  );

  const item = response.data.items[0];

  return {
    gold: {
      price: item.xauPrice,
      currency: 'USD',
      timestamp: item.ts * 1000,
      change: item.chgXau,
      changePercent: item.pcXau,
      open: item.xauClose,
    },
    silver: {
      price: item.xagPrice,
      currency: 'USD',
      timestamp: item.ts * 1000,
    },
  };
}

// --- Public: Binance primary, GoldPrice.org fallback ---

export async function fetchGoldPrice(): Promise<{ gold: GoldPrice; silver: SilverPrice }> {
  try {
    return await fetchBinanceGoldPrice();
  } catch (binanceErr) {
    console.warn('Binance gold price failed, falling back to GoldPrice.org:', binanceErr);
    try {
      return await fetchGoldPriceOrg();
    } catch (fallbackErr) {
      console.error('All gold price sources failed:', fallbackErr);
      throw new Error('无法获取黄金实时价格，请检查网络连接。');
    }
  }
}
