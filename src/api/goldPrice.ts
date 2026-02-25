import { fetchBinanceGoldPrice } from './binance';
import type { GoldPrice, SilverPrice } from '../types';

export async function fetchGoldPrice(): Promise<{ gold: GoldPrice; silver: SilverPrice }> {
  try {
    return await fetchBinanceGoldPrice();
  } catch (err: unknown) {
    // Build a detailed diagnostic message for the user
    let detail = '';
    if (err && typeof err === 'object' && 'isAxiosError' in err) {
      const axiosErr = err as {
        code?: string;
        message?: string;
        response?: { status?: number; statusText?: string };
      };
      if (axiosErr.response) {
        detail = `HTTP ${axiosErr.response.status} ${axiosErr.response.statusText}`;
      } else if (axiosErr.code === 'ECONNABORTED') {
        detail = '请求超时（10s），请检查网络';
      } else if (axiosErr.code === 'ERR_NETWORK') {
        detail = '网络不可达，请确认能访问 fapi.binance.com';
      } else {
        detail = axiosErr.message ?? '未知网络错误';
      }
    } else {
      detail = err instanceof Error ? err.message : String(err);
    }

    console.error(
      `[GoldPrice] Binance 实时价格请求失败:\n` +
        `  → 代理路径: /api/binance/fapi/v1/ticker/24hr?symbol=XAUUSDT\n` +
        `  → 目标地址: https://fapi.binance.com/fapi/v1/ticker/24hr\n` +
        `  → 错误详情: ${detail}\n` +
        `  → 排查建议: 1) 确认 dev server 已重启  2) 浏览器打开 https://fapi.binance.com/fapi/v1/ticker/price?symbol=XAUUSDT 检查能否访问  3) 如在中国大陆，可能需要 VPN`,
      err,
    );

    throw new Error(`无法获取黄金实时价格 (${detail})`);
  }
}
