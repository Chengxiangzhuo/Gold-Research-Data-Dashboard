export function formatCurrency(value: number, currency = 'USD', decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getTimeRangeStartDate(range: string): string {
  const now = new Date();
  switch (range) {
    case '1M': now.setMonth(now.getMonth() - 1); break;
    case '3M': now.setMonth(now.getMonth() - 3); break;
    case '6M': now.setMonth(now.getMonth() - 6); break;
    case '1Y': now.setFullYear(now.getFullYear() - 1); break;
    case '2Y': now.setFullYear(now.getFullYear() - 2); break;
    case '5Y': now.setFullYear(now.getFullYear() - 5); break;
    case '10Y': now.setFullYear(now.getFullYear() - 10); break;
    case 'MAX': return '1970-01-01';
    default: now.setFullYear(now.getFullYear() - 1);
  }
  return now.toISOString().split('T')[0];
}
