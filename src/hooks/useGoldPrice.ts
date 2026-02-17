import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchGoldPrice } from '../api/goldPrice';
import type { GoldPrice, SilverPrice } from '../types';

interface UseGoldPriceReturn {
  goldPrice: GoldPrice | null;
  silverPrice: SilverPrice | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useGoldPrice(refreshInterval = 60000): UseGoldPriceReturn {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [silverPrice, setSilverPrice] = useState<SilverPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const { gold, silver } = await fetchGoldPrice();
      setGoldPrice(gold);
      setSilverPrice(silver);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gold price');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, refreshInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, refreshInterval]);

  return { goldPrice, silverPrice, loading, error, refresh };
}
