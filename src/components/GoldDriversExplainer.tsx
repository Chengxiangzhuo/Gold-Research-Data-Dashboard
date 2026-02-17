import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Driver {
  title: string;
  description: string;
  relationship: string;
  direction: 'positive' | 'negative' | 'complex';
}

const DRIVERS: Driver[] = [
  {
    title: '实际利率 (Real Interest Rate)',
    description:
      '实际利率 = 名义利率 - 通胀率。黄金不产生利息收入，当实际利率低甚至为负时，持有黄金的机会成本降低。这是影响金价最核心的因素之一。',
    relationship: '实际利率 ↓ → 金价 ↑',
    direction: 'negative',
  },
  {
    title: '美元指数 (US Dollar Index)',
    description:
      '黄金以美元计价，美元走强意味着购买黄金需要更少的美元，因此金价往往下跌。反之亦然。美元与黄金长期呈负相关关系。',
    relationship: '美元 ↓ → 金价 ↑',
    direction: 'negative',
  },
  {
    title: '通货膨胀 / CPI',
    description:
      '黄金被视为对冲通胀的资产。当CPI上升，货币购买力下降时，投资者倾向于买入黄金保值。但如果央行大幅加息抑制通胀，可能短期利空黄金。',
    relationship: '通胀 ↑ → 金价 ↑ (长期)',
    direction: 'positive',
  },
  {
    title: '联邦基金利率 (Fed Funds Rate)',
    description:
      '美联储加息提高了债券等生息资产的回报，增加了持有黄金的机会成本。降息周期则有利于黄金。市场预期比实际利率变化更重要。',
    relationship: '利率 ↑ → 金价 ↓ (短期)',
    direction: 'negative',
  },
  {
    title: '地缘政治风险 / VIX',
    description:
      '黄金是传统的避险资产。地缘政治紧张、金融危机或市场恐慌（VIX上升）时，资金流入黄金等避险资产。',
    relationship: '恐慌 ↑ → 金价 ↑',
    direction: 'positive',
  },
  {
    title: 'M2 货币供应量',
    description:
      '宽松的货币政策（量化宽松、大规模印钞）增加流通中的货币，稀释货币价值。黄金作为有限供应的资产，在货币超发时更具吸引力。',
    relationship: 'M2 ↑ → 金价 ↑ (长期)',
    direction: 'positive',
  },
];

export function GoldDriversExplainer() {
  const [expanded, setExpanded] = useState(false);

  const directionColor = {
    positive: 'border-l-green-500 bg-green-50/50',
    negative: 'border-l-red-500 bg-red-50/50',
    complex: 'border-l-amber-500 bg-amber-50/50',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900 text-left">
            黄金价格驱动因素解析
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 text-left">
            理解各宏观指标如何影响黄金价格
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {DRIVERS.map((driver) => (
            <div
              key={driver.title}
              className={`border-l-3 pl-3 py-2 rounded-r-lg ${directionColor[driver.direction]}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-800">{driver.title}</h4>
                <span className="text-[10px] font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded">
                  {driver.relationship}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{driver.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
