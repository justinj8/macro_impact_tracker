import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Filter,
  Download
} from 'lucide-react';

const INDICATORS = ['CPI', 'NFP', 'PMI', 'FOMC', 'GDP', 'CLAIMS', 'RETAIL', 'PCE'];

export default function ImpactAnalysis() {
  const { impactHistory } = useStore();
  const [selectedIndicator, setSelectedIndicator] = useState('all');
  const [timeframe, setTimeframe] = useState('60m');

  // Filter history by indicator
  const filteredHistory = selectedIndicator === 'all'
    ? impactHistory
    : impactHistory.filter(e => e.indicator === selectedIndicator);

  // Calculate aggregate statistics
  const stats = calculateStats(filteredHistory, timeframe);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Impact Analysis</h2>
          <p className="text-slate-600 text-sm mt-1">
            Analyze how macro events affect different asset classes
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-all border border-violet-200 font-medium">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="all">All Indicators</option>
            {INDICATORS.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {['1m', '5m', '15m', '30m', '60m'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                timeframe === tf
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in-delay-1">
        <StatCard
          title="Avg Equity Move"
          value={`${stats.avgEquityMove > 0 ? '+' : ''}${stats.avgEquityMove.toFixed(2)}%`}
          icon={TrendingUp}
          color={stats.avgEquityMove > 0 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Avg FX Move"
          value={`${stats.avgFxMove > 0 ? '+' : ''}${stats.avgFxMove.toFixed(2)}%`}
          icon={Activity}
          color={stats.avgFxMove > 0 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Avg Bond Move"
          value={`${stats.avgBondMove > 0 ? '+' : ''}${stats.avgBondMove.toFixed(2)}%`}
          icon={BarChart3}
          color={stats.avgBondMove > 0 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Avg VIX Move"
          value={`${stats.avgVolMove > 0 ? '+' : ''}${stats.avgVolMove.toFixed(2)}%`}
          icon={Zap}
          color={stats.avgVolMove > 0 ? 'amber' : 'sky'}
        />
      </div>

      {/* Impact Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in-delay-2">
        {/* Surprise vs Move Analysis */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Surprise Direction Analysis
          </h3>
          <div className="space-y-4">
            <SurpriseAnalysis
              label="Positive Surprises"
              data={stats.positiveSurprises}
              color="emerald"
            />
            <SurpriseAnalysis
              label="Negative Surprises"
              data={stats.negativeSurprises}
              color="rose"
            />
          </div>
        </div>

        {/* Asset Class Correlation */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            Asset Class Reactions
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.assetReactions).map(([asset, data]) => (
              <AssetReactionBar key={asset} asset={asset} data={data} />
            ))}
          </div>
        </div>
      </div>

      {/* Historical Events Table */}
      <div className="card p-6 fade-in-delay-3">
        <h3 className="font-semibold text-slate-900 mb-4">
          Historical Events ({filteredHistory.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-600 border-b border-slate-200">
                <th className="pb-3 pr-4">Event</th>
                <th className="pb-3 pr-4">Actual</th>
                <th className="pb-3 pr-4">Forecast</th>
                <th className="pb-3 pr-4">Surprise</th>
                <th className="pb-3 pr-4">Equity</th>
                <th className="pb-3 pr-4">FX</th>
                <th className="pb-3 pr-4">Bonds</th>
                <th className="pb-3">VIX</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.slice(-20).reverse().map((event, idx) => {
                const impact = event.impacts?.[timeframe]?.categoryImpacts;
                return (
                  <tr key={idx} className="border-b border-slate-100 text-sm hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900">{event.indicator}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(event.releasedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-slate-900">{event.actual}</td>
                    <td className="py-3 pr-4 font-mono text-slate-500">{event.forecast}</td>
                    <td className={`py-3 pr-4 font-mono font-medium ${
                      event.surprise > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {event.surprise > 0 ? '+' : ''}{event.surprise?.toFixed(1)}%
                    </td>
                    <ImpactCell value={impact?.equity?.avgPercentChange} />
                    <ImpactCell value={impact?.fx?.avgPercentChange} />
                    <ImpactCell value={impact?.bond?.avgPercentChange} />
                    <ImpactCell value={impact?.volatility?.avgPercentChange} />
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No historical data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    emerald: {
      bg: 'gradient-emerald',
      text: 'text-white',
      border: 'border-emerald-500'
    },
    rose: {
      bg: 'gradient-rose',
      text: 'text-white',
      border: 'border-rose-500'
    },
    sky: {
      bg: 'gradient-sky',
      text: 'text-white',
      border: 'border-sky-500'
    },
    amber: {
      bg: 'gradient-amber',
      text: 'text-white',
      border: 'border-amber-500'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`card p-5 ${colors.border} border-l-4 hover:shadow-medium`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{title}</span>
        <div className={`p-2.5 rounded-lg ${colors.bg}`}>
          <Icon className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
      </div>
      <div className={`text-2xl font-bold font-mono ${
        color === 'emerald' ? 'text-emerald-600' :
        color === 'rose' ? 'text-rose-600' :
        color === 'amber' ? 'text-amber-600' :
        'text-sky-600'
      }`}>
        {value}
      </div>
    </div>
  );
}

function SurpriseAnalysis({ label, data, color }) {
  const bgColor = color === 'emerald' ? 'bg-emerald-50' : 'bg-rose-50';
  const borderColor = color === 'emerald' ? 'border-emerald-200' : 'border-rose-200';

  return (
    <div className={`p-4 ${bgColor} rounded-lg border ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-900">{label}</span>
        <span className="text-xs text-slate-600 bg-white px-2 py-1 rounded-full">{data.count} events</span>
      </div>
      <div className="grid grid-cols-4 gap-3 text-xs">
        <div>
          <div className="text-slate-600 mb-1">Equity</div>
          <div className={`font-mono font-medium ${data.equity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {data.equity > 0 ? '+' : ''}{data.equity.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-slate-600 mb-1">FX</div>
          <div className={`font-mono font-medium ${data.fx > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {data.fx > 0 ? '+' : ''}{data.fx.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-slate-600 mb-1">Bonds</div>
          <div className={`font-mono font-medium ${data.bonds > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {data.bonds > 0 ? '+' : ''}{data.bonds.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-slate-600 mb-1">VIX</div>
          <div className={`font-mono font-medium ${data.vix > 0 ? 'text-amber-600' : 'text-sky-600'}`}>
            {data.vix > 0 ? '+' : ''}{data.vix.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetReactionBar({ asset, data }) {
  const maxWidth = Math.max(Math.abs(data.positive), Math.abs(data.negative));
  const scale = maxWidth > 0 ? 100 / maxWidth : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700 capitalize">{asset}</span>
        <span className="text-xs text-slate-600 font-mono">
          Avg: {data.average > 0 ? '+' : ''}{data.average.toFixed(2)}%
        </span>
      </div>
      <div className="flex h-4 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-rose-500 to-rose-400"
          style={{ width: `${Math.abs(data.negative) * scale / 2}%` }}
        />
        <div className="flex-1" />
        <div
          className="bg-gradient-to-r from-emerald-400 to-emerald-500"
          style={{ width: `${data.positive * scale / 2}%` }}
        />
      </div>
    </div>
  );
}

function ImpactCell({ value }) {
  if (value === undefined || value === null) {
    return <td className="py-3 pr-4 text-slate-400">—</td>;
  }

  return (
    <td className={`py-3 pr-4 font-mono font-medium ${
      value > 0 ? 'text-emerald-600' : value < 0 ? 'text-rose-600' : 'text-slate-500'
    }`}>
      {value > 0 ? '+' : ''}{value.toFixed(2)}%
    </td>
  );
}

function calculateStats(history, timeframe) {
  const stats = {
    avgEquityMove: 0,
    avgFxMove: 0,
    avgBondMove: 0,
    avgVolMove: 0,
    positiveSurprises: { count: 0, equity: 0, fx: 0, bonds: 0, vix: 0 },
    negativeSurprises: { count: 0, equity: 0, fx: 0, bonds: 0, vix: 0 },
    assetReactions: {
      equity: { positive: 0, negative: 0, average: 0 },
      fx: { positive: 0, negative: 0, average: 0 },
      bond: { positive: 0, negative: 0, average: 0 },
      volatility: { positive: 0, negative: 0, average: 0 }
    }
  };

  if (history.length === 0) return stats;

  const moves = { equity: [], fx: [], bond: [], vol: [] };
  const positiveMoves = { equity: [], fx: [], bond: [], vol: [] };
  const negativeMoves = { equity: [], fx: [], bond: [], vol: [] };

  history.forEach(event => {
    const impact = event.impacts?.[timeframe]?.categoryImpacts;
    if (!impact) return;

    const isPositiveSurprise = event.surprise > 0;

    if (impact.equity) {
      moves.equity.push(impact.equity.avgPercentChange);
      if (isPositiveSurprise) {
        positiveMoves.equity.push(impact.equity.avgPercentChange);
      } else {
        negativeMoves.equity.push(impact.equity.avgPercentChange);
      }
    }

    if (impact.fx) {
      moves.fx.push(impact.fx.avgPercentChange);
      if (isPositiveSurprise) {
        positiveMoves.fx.push(impact.fx.avgPercentChange);
      } else {
        negativeMoves.fx.push(impact.fx.avgPercentChange);
      }
    }

    if (impact.bond) {
      moves.bond.push(impact.bond.avgPercentChange);
      if (isPositiveSurprise) {
        positiveMoves.bond.push(impact.bond.avgPercentChange);
      } else {
        negativeMoves.bond.push(impact.bond.avgPercentChange);
      }
    }

    if (impact.volatility) {
      moves.vol.push(impact.volatility.avgPercentChange);
      if (isPositiveSurprise) {
        positiveMoves.vol.push(impact.volatility.avgPercentChange);
      } else {
        negativeMoves.vol.push(impact.volatility.avgPercentChange);
      }
    }
  });

  const avg = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const max = arr => arr.length > 0 ? Math.max(...arr) : 0;
  const min = arr => arr.length > 0 ? Math.min(...arr) : 0;

  stats.avgEquityMove = avg(moves.equity);
  stats.avgFxMove = avg(moves.fx);
  stats.avgBondMove = avg(moves.bond);
  stats.avgVolMove = avg(moves.vol);

  stats.positiveSurprises = {
    count: positiveMoves.equity.length,
    equity: avg(positiveMoves.equity),
    fx: avg(positiveMoves.fx),
    bonds: avg(positiveMoves.bond),
    vix: avg(positiveMoves.vol)
  };

  stats.negativeSurprises = {
    count: negativeMoves.equity.length,
    equity: avg(negativeMoves.equity),
    fx: avg(negativeMoves.fx),
    bonds: avg(negativeMoves.bond),
    vix: avg(negativeMoves.vol)
  };

  stats.assetReactions = {
    equity: {
      positive: max(moves.equity.filter(m => m > 0)),
      negative: min(moves.equity.filter(m => m < 0)),
      average: avg(moves.equity)
    },
    fx: {
      positive: max(moves.fx.filter(m => m > 0)),
      negative: min(moves.fx.filter(m => m < 0)),
      average: avg(moves.fx)
    },
    bond: {
      positive: max(moves.bond.filter(m => m > 0)),
      negative: min(moves.bond.filter(m => m < 0)),
      average: avg(moves.bond)
    },
    volatility: {
      positive: max(moves.vol.filter(m => m > 0)),
      negative: min(moves.vol.filter(m => m < 0)),
      average: avg(moves.vol)
    }
  };

  return stats;
}
