import axios from 'axios';
import type { GoldPrice, SilverPrice } from '../types';

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

export async function fetchGoldPriceOrg(): Promise<{ gold: GoldPrice; silver: SilverPrice }> {
  const response = await axios.get<GoldPriceOrgResponse>(
    '/api/goldprice/dbXRates/USD',
    { timeout: 10000 }
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

export async function fetchGoldPrice(): Promise<{ gold: GoldPrice; silver: SilverPrice }> {
  try {
    return await fetchGoldPriceOrg();
  } catch (error) {
    console.error('Gold price fetch failed:', error);
    throw new Error('Unable to fetch gold price data. Please check your network connection.');
  }
}
