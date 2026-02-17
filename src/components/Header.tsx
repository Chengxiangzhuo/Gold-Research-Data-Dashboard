import { RefreshCw, Settings, TrendingUp } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';

interface HeaderProps {
  lastRefresh: Date | null;
  onRefresh: () => void;
  onOpenSettings: () => void;
  loading: boolean;
}

export function Header({ lastRefresh, onRefresh, onOpenSettings, loading }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-yellow-900 via-yellow-800 to-amber-900 text-white shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gold Research Dashboard</h1>
              <p className="text-yellow-200/70 text-xs">黄金投资研究仪表盘 - 实时数据驱动</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-yellow-200/60 text-xs hidden sm:block">
                更新: {formatTimestamp(lastRefresh.getTime())}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              title="刷新数据"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="设置"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
