import { useState } from 'react';
import { X, Key, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fredApiKey: string;
  onSaveFredApiKey: (key: string) => void;
}

export function SettingsModal({ isOpen, onClose, fredApiKey, onSaveFredApiKey }: SettingsModalProps) {
  const [key, setKey] = useState(fredApiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveFredApiKey(key.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">设置</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4" />
              FRED API Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="输入您的 FRED API Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors font-mono"
            />
            <p className="mt-2 text-xs text-gray-500">
              FRED API Key 用于获取 CPI、联邦利率、国债收益率等宏观经济数据。
            </p>
            <a
              href="https://fred.stlouisfed.org/docs/api/api_key.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-700"
            >
              免费申请 FRED API Key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-amber-800 mb-1">数据源说明</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>
                <strong>黄金/白银现货价格:</strong> 来自 GoldPrice.org 实时数据源
              </li>
              <li>
                <strong>宏观经济指标:</strong> 来自美联储 FRED 数据库 (需要 API Key)
              </li>
              <li>
                <strong>汇率数据:</strong> 来自 Frankfurter API (欧洲央行数据)
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
