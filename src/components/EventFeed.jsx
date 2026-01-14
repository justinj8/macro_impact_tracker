import React from 'react';
import { useStore } from '../store/useStore';
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  Zap
} from 'lucide-react';

const IMPORTANCE_COLORS = {
  critical: 'bg-neutral-900',
  high: 'bg-neutral-700',
  medium: 'bg-neutral-500',
  low: 'bg-neutral-300'
};

const INDICATOR_EMOJI = {
  CPI: '📊',
  NFP: '👷',
  PMI: '🏭',
  FOMC: '🏦',
  GDP: '📈',
  CLAIMS: '📋',
  RETAIL: '🛒',
  PCE: '💰',
  PPI: '🏷️'
};

export default function EventFeed() {
  const { upcomingEvents, impactHistory } = useStore();

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      <div className="card p-5 fade-in-delay-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Upcoming Events
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            {upcomingEvents.length}
          </span>
        </div>

        <div className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Calendar className="w-6 h-6 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
              <p className="text-xs">No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.slice(0, 5).map((event, idx) => (
              <EventItem key={idx} event={event} />
            ))
          )}
        </div>

        {upcomingEvents.length > 5 && (
          <button className="w-full mt-3 py-2 text-neutral-600 text-xs hover:text-neutral-900 transition-colors flex items-center justify-center gap-1">
            View all {upcomingEvents.length}
            <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Recent Impact History */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Recent Impacts
          </h3>
        </div>

        <div className="space-y-2">
          {impactHistory.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Zap className="w-6 h-6 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
              <p className="text-xs">No recent impacts</p>
            </div>
          ) : (
            impactHistory.slice(-5).reverse().map((event, idx) => (
              <HistoryItem key={idx} event={event} />
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card p-5">
        <h4 className="text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wide">Importance</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(IMPORTANCE_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 ${color}`} />
              <span className="text-xs text-neutral-500 capitalize">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventItem({ event }) {
  const importanceColor = IMPORTANCE_COLORS[event.importance] || IMPORTANCE_COLORS.low;

  return (
    <div className="flex items-start gap-2.5 p-3 border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer">
      <div className={`w-0.5 h-full min-h-[40px] ${importanceColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-neutral-900 truncate">{event.name}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-500 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
            {event.timeUntil}
          </span>
          <span>
            F {event.forecast} / P {event.previous}
          </span>
        </div>
      </div>
      {event.importance === 'critical' && (
        <AlertCircle className="w-3 h-3 text-neutral-900 flex-shrink-0" strokeWidth={1.5} />
      )}
    </div>
  );
}

function HistoryItem({ event }) {
  const surprise = event.surprise || 0;

  const latestImpact = event.impacts?.['60m'] || event.impacts?.['30m'];
  const equityMove = latestImpact?.categoryImpacts?.equity?.avgPercentChange;

  return (
    <div className="flex items-start gap-2.5 p-3 border border-neutral-200">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-neutral-900 truncate">
          {event.name || event.indicator}
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono">
          <span className={surprise > 0 ? 'price-up' : surprise < 0 ? 'price-down' : 'price-neutral'}>
            {surprise > 0 ? '+' : ''}{surprise.toFixed(1)}%
          </span>
          {equityMove !== undefined && (
            <span className={equityMove > 0 ? 'price-up' : 'price-down'}>
              Eq {equityMove > 0 ? '+' : ''}{equityMove.toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
