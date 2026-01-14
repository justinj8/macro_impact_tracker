import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function AssetCard({ symbol, data, isSelected, onClick }) {
  if (!data) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="h-3 bg-neutral-200 w-1/2 mb-3" />
        <div className="h-5 bg-neutral-200 w-3/4" />
      </div>
    );
  }

  const isUp = data.changePercent > 0;
  const isDown = data.changePercent < 0;

  return (
    <button
      onClick={onClick}
      className={`card p-4 text-left transition-all hover:shadow-medium ${
        isSelected
          ? 'border-violet-500 bg-violet-50 shadow-sm'
          : 'hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">{symbol}</span>
        {isSelected && (
          <div className="w-2 h-2 rounded-full gradient-violet"></div>
        )}
      </div>

      <div className="font-mono tabular-nums">
        <div className="text-xl font-light text-slate-900 tracking-tight mb-1">
          {data.price?.toFixed(symbol.includes('/') ? 4 : 2)}
        </div>
        <div className={`text-sm font-semibold ${
          isUp ? 'price-up' : isDown ? 'price-down' : 'price-neutral'
        }`}>
          {isUp ? '+' : ''}{data.changePercent?.toFixed(2)}%
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200">
        <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
          <span>H {data.high?.toFixed(2)}</span>
          <span>L {data.low?.toFixed(2)}</span>
        </div>
      </div>
    </button>
  );
}
