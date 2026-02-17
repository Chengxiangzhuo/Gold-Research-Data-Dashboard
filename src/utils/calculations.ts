import type { ChartDataPoint } from '../types';

export function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);

  const meanX = xSlice.reduce((a, b) => a + b, 0) / n;
  const meanY = ySlice.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xSlice[i] - meanX;
    const dy = ySlice[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  if (denom === 0) return 0;

  return numerator / denom;
}

export function calculateChange(current: number, previous: number): { change: number; percent: number } {
  const change = current - previous;
  const percent = previous !== 0 ? (change / previous) * 100 : 0;
  return { change, percent };
}

export function alignTimeSeries(
  series1: ChartDataPoint[],
  series2: ChartDataPoint[]
): { values1: number[]; values2: number[] } {
  const map2 = new Map(series2.map((p) => [p.date, p.value]));
  const values1: number[] = [];
  const values2: number[] = [];

  for (const point of series1) {
    const val2 = map2.get(point.date);
    if (val2 !== undefined) {
      values1.push(point.value);
      values2.push(val2);
    }
  }

  return { values1, values2 };
}

export function calculateRealRate(nominalRate: number, inflationRate: number): number {
  return nominalRate - inflationRate;
}

export function calculateGoldSilverRatio(goldPrice: number, silverPrice: number): number {
  if (silverPrice === 0) return 0;
  return goldPrice / silverPrice;
}

export function movingAverage(data: ChartDataPoint[], window: number): ChartDataPoint[] {
  if (data.length < window) return data;
  const result: ChartDataPoint[] = [];
  for (let i = window - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < window; j++) {
      sum += data[i - j].value;
    }
    result.push({ date: data[i].date, value: sum / window });
  }
  return result;
}
