import { useState, useEffect, useCallback } from 'react';
import { fetchMultipleFredSeries, FRED_SERIES } from '../api/fred';
import type { FredSeriesData, EconomicIndicator, ChartDataPoint } from '../types';
import { getTimeRangeStartDate } from '../utils/formatters';
import type { TimeRange } from '../types';

interface UseFredDataReturn {
  seriesData: Map<string, FredSeriesData>;
  indicators: EconomicIndicator[];
  historicalGold: ChartDataPoint[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function getLatestValues(observations: { date: string; value: string }[]): {
  latest: number | null;
  previous: number | null;
  date: string;
} {
  const valid = observations.filter((o) => o.value !== '.');
  if (valid.length === 0) return { latest: null, previous: null, date: '' };

  const latest = parseFloat(valid[valid.length - 1].value);
  const previous = valid.length > 1 ? parseFloat(valid[valid.length - 2].value) : null;
  return { latest, previous, date: valid[valid.length - 1].date };
}

function buildIndicator(seriesId: string, data: FredSeriesData): EconomicIndicator {
  const config = FRED_SERIES.find((s) => s.id === seriesId);
  const { latest, previous, date } = getLatestValues(data.observations);

  let change: number | null = null;
  let trend: 'up' | 'down' | 'flat' = 'flat';

  if (latest !== null && previous !== null) {
    change = latest - previous;
    trend = change > 0.001 ? 'up' : change < -0.001 ? 'down' : 'flat';
  }

  return {
    id: seriesId,
    name: config?.name ?? seriesId,
    nameZh: config?.nameZh ?? seriesId,
    value: latest,
    previousValue: previous,
    change,
    unit: config?.unit ?? '',
    date,
    description: config?.description ?? '',
    descriptionZh: config?.descriptionZh ?? '',
    trend,
    impact: config?.impactOnGold ?? 'neutral',
  };
}

export function useFredData(apiKey: string, timeRange: TimeRange = '2Y'): UseFredDataReturn {
  const [seriesData, setSeriesData] = useState<Map<string, FredSeriesData>>(new Map());
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [historicalGold, setHistoricalGold] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!apiKey) {
      setLoading(false);
      setError('Please configure your FRED API key');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startDate = getTimeRangeStartDate(timeRange);
      const seriesIds = FRED_SERIES.map((s) => s.id);
      const data = await fetchMultipleFredSeries(seriesIds, apiKey, startDate);

      setSeriesData(data);

      const indicatorList: EconomicIndicator[] = [];
      for (const [id, seriesD] of data) {
        indicatorList.push(buildIndicator(id, seriesD));
      }
      setIndicators(indicatorList);

      const goldData = data.get('GOLDAMGBD228NLBM');
      if (goldData) {
        setHistoricalGold(
          goldData.observations
            .filter((o) => o.value !== '.')
            .map((o) => ({
              date: o.date,
              value: parseFloat(o.value),
            }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch FRED data');
    } finally {
      setLoading(false);
    }
  }, [apiKey, timeRange]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { seriesData, indicators, historicalGold, loading, error, refresh };
}
