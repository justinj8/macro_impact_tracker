import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import PriceChart from './PriceChart';
import AssetCard from './AssetCard';
import ActiveEventCard from './ActiveEventCard';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

const ASSET_GROUPS = {
  equities: ['SPY', 'QQQ', 'IWM', 'DIA'],
  fx: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'DXY'],
  bonds: ['TLT', 'IEF', 'HYG'],
  volatility: ['VIX', 'VVIX'],
  commodities: ['GLD', 'USO']
};

export default function Dashboard() {
  const { marketData, activeEvents, selectedAsset, setSelectedAsset } = useStore();
  const [activeGroup, setActiveGroup] = useState('equities');

  const groupIcons = {
    equities: TrendingUp,
    fx: Activity,
    bonds: BarChart3,
    volatility: Zap,
    commodities: Activity
  };

  const groupColors = {
    equities: { text: 'text-violet-700', bg: 'bg-violet-100', border: 'border-violet-500' },
    fx: { text: 'text-sky-700', bg: 'bg-sky-100', border: 'border-sky-500' },
    bonds: { text: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-500' },
    volatility: { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-500' },
    commodities: { text: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-500' }
  };

  return (
    <div className="space-y-8">
      {/* Active Events Section */}
      {activeEvents.length > 0 && (
        <section className="fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Active Events
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {activeEvents.map(event => (
              <ActiveEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Main Chart */}
      <section className="card p-6 fade-in-delay-1 border-l-4 border-l-violet-500">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h3 className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">
              {marketData[selectedAsset]?.name || selectedAsset}
            </h3>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-mono font-light text-slate-900 tabular-nums tracking-tight">
                {marketData[selectedAsset]?.price?.toFixed(
                  selectedAsset.includes('/') ? 4 : 2
                )}
              </span>
              <span
                className={`text-lg font-mono font-semibold tabular-nums ${
                  marketData[selectedAsset]?.changePercent > 0
                    ? 'price-up'
                    : marketData[selectedAsset]?.changePercent < 0
                    ? 'price-down'
                    : 'price-neutral'
                }`}
              >
                {marketData[selectedAsset]?.changePercent > 0 ? '+' : ''}
                {marketData[selectedAsset]?.changePercent?.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="h-80 border-t border-slate-200 pt-4">
          <PriceChart symbol={selectedAsset} />
        </div>
      </section>

      {/* Asset Groups */}
      <section className="fade-in-delay-2">
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2">
          {Object.entries(ASSET_GROUPS).map(([group]) => {
            const Icon = groupIcons[group];
            const colors = groupColors[group];
            return (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeGroup === group
                    ? `${colors.bg} ${colors.text} shadow-sm border-2 ${colors.border}`
                    : 'bg-white text-slate-600 hover:text-slate-900 border-2 border-transparent hover:border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ASSET_GROUPS[activeGroup].map(symbol => (
            <AssetCard
              key={symbol}
              symbol={symbol}
              data={marketData[symbol]}
              isSelected={selectedAsset === symbol}
              onClick={() => setSelectedAsset(symbol)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
