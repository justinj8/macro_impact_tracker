import React from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MarketTicker() {
  const { marketData } = useStore();

  const assets = Object.values(marketData).slice(0, 12);

  if (assets.length === 0) {
    return (
      <div className="bg-white border-b border-neutral-200 py-2">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-neutral-500 text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-neutral-200 overflow-hidden">
      <div className="flex items-center py-2.5 gap-8 ticker-animation whitespace-nowrap">
        {[...assets, ...assets].map((asset, idx) => (
          <TickerItem key={`${asset.symbol}-${idx}`} asset={asset} />
        ))}
      </div>
    </div>
  );
}

function TickerItem({ asset }) {
  const isUp = asset.changePercent > 0;
  const isDown = asset.changePercent < 0;

  return (
    <div className="flex items-center gap-2.5 px-4">
      <span className="text-neutral-500 font-medium text-xs uppercase tracking-wider">{asset.symbol}</span>
      <span className="text-neutral-900 font-mono tabular-nums text-sm font-light">
        {asset.price?.toFixed(asset.symbol.includes('/') ? 4 : 2)}
      </span>
      <span className={`font-mono tabular-nums text-xs ${
        isUp ? 'price-up' : isDown ? 'price-down' : 'price-neutral'
      }`}>
        {isUp ? '+' : ''}{asset.changePercent?.toFixed(2)}%
      </span>
    </div>
  );
}
