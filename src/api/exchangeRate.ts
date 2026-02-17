import axios from 'axios';
import type { ExchangeRates } from '../types';

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const response = await axios.get('/api/frankfurter/latest', {
    params: {
      from: 'USD',
      to: 'EUR,GBP,JPY,CNY,CHF,CAD,AUD',
    },
    timeout: 10000,
  });

  return {
    base: response.data.base,
    date: response.data.date,
    rates: response.data.rates,
  };
}

export async function fetchHistoricalExchangeRates(
  startDate: string,
  endDate: string,
  currency = 'EUR'
): Promise<Array<{ date: string; rate: number }>> {
  const response = await axios.get(`/api/frankfurter/${startDate}..${endDate}`, {
    params: {
      from: 'USD',
      to: currency,
    },
    timeout: 15000,
  });

  return Object.entries(response.data.rates).map(([date, rates]) => ({
    date,
    rate: (rates as Record<string, number>)[currency],
  }));
}
