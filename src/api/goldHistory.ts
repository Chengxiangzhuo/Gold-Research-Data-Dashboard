import axios from 'axios';
import { fetchBinanceKlines } from './binance';
import type { ChartDataPoint } from '../types';

/**
 * Cutoff date: FreeGoldAPI provides data up to this date,
 * Binance XAUUSDT klines cover from this date onward.
 */
const BINANCE_CUTOFF = '2025-12-11';
const BINANCE_CUTOFF_MS = new Date(BINANCE_CUTOFF).getTime();

// --- FreeGoldAPI.com (CORS-enabled, no proxy needed) ---

interface FreeGoldRecord {
  date: string;
  price: number;
  source?: string;
}

async function fetchFreeGoldHistory(
  startDate?: string,
): Promise<ChartDataPoint[]> {
  const response = await axios.get<FreeGoldRecord[]>(
    'https://freegoldapi.com/data/latest.json',
    { timeout: 30000 },
  );

  return response.data
    .filter((d) => {
      if (!d.price || d.price <= 0) return false;
      if (startDate && d.date < startDate) return false;
      if (d.date > BINANCE_CUTOFF) return false;
      return true;
    })
    .map((d) => ({ date: d.date, value: d.price }));
}

// --- Binance XAUUSDT daily klines ---

async function fetchBinanceGoldHistory(
  startDate?: string,
): Promise<ChartDataPoint[]> {
  const startMs = startDate
    ? Math.max(new Date(startDate).getTime(), BINANCE_CUTOFF_MS)
    : BINANCE_CUTOFF_MS;
  const endMs = Date.now();
  const results: ChartDataPoint[] = [];

  let cursor = startMs;
  while (cursor < endMs) {
    const klines = await fetchBinanceKlines(
      'XAUUSDT',
      '1d',
      cursor,
      endMs,
      1000,
    );
    if (klines.length === 0) break;

    for (const k of klines) {
      results.push({
        date: new Date(k.openTime).toISOString().split('T')[0],
        value: k.close,
      });
    }

    cursor = klines[klines.length - 1].openTime + 86400000;
  }

  return results;
}

// --- Public: merged gold history ---

export async function fetchGoldHistory(
  startDate?: string,
): Promise<ChartDataPoint[]> {
  const needFreeGold = !startDate || startDate < BINANCE_CUTOFF;

  const [freeData, binanceData] = await Promise.all([
    needFreeGold
      ? fetchFreeGoldHistory(startDate).catch((err) => {
          console.error('FreeGoldAPI fetch failed:', err);
          return [] as ChartDataPoint[];
        })
      : Promise.resolve([]),
    fetchBinanceGoldHistory(startDate).catch((err) => {
      console.error('Binance gold history fetch failed:', err);
      return [] as ChartDataPoint[];
    }),
  ]);

  // Merge — Binance overwrites overlapping dates
  const map = new Map<string, number>();
  for (const d of freeData) map.set(d.date, d.value);
  for (const d of binanceData) map.set(d.date, d.value);

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}
