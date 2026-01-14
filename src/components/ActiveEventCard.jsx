import React from 'react';
import { Zap, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const INDICATOR_COLORS = {
  CPI: 'from-orange-500 to-red-500',
  NFP: 'from-blue-500 to-purple-500',
  PMI: 'from-green-500 to-teal-500',
  FOMC: 'from-yellow-500 to-orange-500',
  GDP: 'from-indigo-500 to-blue-500',
  CLAIMS: 'from-gray-400 to-gray-600',
  RETAIL: 'from-pink-500 to-rose-500',
  PCE: 'from-violet-500 to-purple-500',
  PPI: 'from-cyan-500 to-blue-500'
};

export default function ActiveEventCard({ event }) {
  const latestImpact = event.impacts?.['60m'] ||
    event.impacts?.['30m'] ||
    event.impacts?.['15m'] ||
    event.impacts?.['5m'] ||
    event.impacts?.['1m'];

  const intervals = ['1m', '5m', '15m', '30m', '60m'];
  const completedIntervals = intervals.filter(i => event.impacts?.[i]);

  return (
    <div className="card p-5 border-l-4 border-l-emerald-500 hover:shadow-medium transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">{event.name}</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            {new Date(event.releasedAt).toLocaleTimeString()}
          </p>
        </div>
        {event.isDemo && (
          <span className="px-2 py-1 bg-violet-100 text-violet-700 text-[10px] font-semibold rounded-full">
            DEMO
          </span>
        )}
      </div>

      {/* Release Data */}
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">Actual</div>
          <div className="text-lg font-mono font-semibold text-slate-900">{event.actual}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">Forecast</div>
          <div className="text-lg font-mono font-light text-slate-600">{event.forecast}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">Surprise</div>
          <div className={`text-lg font-mono font-bold ${
            event.surprise > 0 ? 'price-up' : 'price-down'
          }`}>
            {event.surprise > 0 ? '+' : ''}{event.surprise?.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Impact Timeline */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Timeline</span>
          <span className="text-[10px] text-slate-600 font-mono font-semibold">
            {completedIntervals.length}/{intervals.length}
          </span>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {intervals.map(interval => {
            const hasData = event.impacts?.[interval];
            return (
              <div
                key={interval}
                className={`flex-1 h-2 rounded transition-all ${
                  hasData ? 'gradient-emerald' : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1 px-1">
          {intervals.map(interval => (
            <span key={interval} className="text-[9px] text-slate-500 font-mono font-medium">
              {interval}
            </span>
          ))}
        </div>
      </div>

      {/* Latest Impact Summary */}
      {latestImpact && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Reaction</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              latestImpact.alignment?.aligned === 'yes'
                ? 'bg-emerald-100 text-emerald-700'
                : latestImpact.alignment?.aligned === 'partial'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-100 text-rose-700'
            }`}>
              {latestImpact.alignment?.aligned === 'yes' ? (
                'Expected'
              ) : latestImpact.alignment?.aligned === 'partial' ? (
                'Mixed'
              ) : (
                'Unexpected'
              )}
            </span>
          </div>

          {latestImpact.summary && (
            <p className="text-xs text-slate-600 leading-relaxed">
              {latestImpact.summary}
            </p>
          )}

          {/* Category Impacts */}
          {latestImpact.categoryImpacts && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(latestImpact.categoryImpacts).slice(0, 4).map(([cat, data]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="text-[10px] text-slate-600 capitalize font-semibold">{cat}</span>
                  <span className={`text-xs font-mono font-bold ${
                    data.avgPercentChange > 0 ? 'price-up' : 'price-down'
                  }`}>
                    {data.avgPercentChange > 0 ? '+' : ''}{data.avgPercentChange?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
