import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

const IMPORTANCE_CONFIG = {
  critical: { color: 'bg-accent-red', textColor: 'text-accent-red', label: 'Critical' },
  high: { color: 'bg-accent-yellow', textColor: 'text-accent-yellow', label: 'High' },
  medium: { color: 'bg-accent-blue', textColor: 'text-accent-blue', label: 'Medium' },
  low: { color: 'bg-gray-500', textColor: 'text-gray-400', label: 'Low' }
};

const INDICATOR_INFO = {
  CPI: { icon: BarChart3, description: 'Measures inflation through consumer prices' },
  NFP: { icon: TrendingUp, description: 'Employment change excluding farm workers' },
  PMI: { icon: Zap, description: 'Manufacturing sector health indicator' },
  FOMC: { icon: AlertCircle, description: 'Federal Reserve rate decision' },
  GDP: { icon: TrendingUp, description: 'Overall economic growth measure' },
  CLAIMS: { icon: BarChart3, description: 'Weekly unemployment claims' },
  RETAIL: { icon: BarChart3, description: 'Consumer spending measure' },
  PCE: { icon: BarChart3, description: 'Fed preferred inflation gauge' },
  PPI: { icon: BarChart3, description: 'Measures wholesale price changes' }
};

export default function Calendar() {
  const { upcomingEvents, impactHistory } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return upcomingEvents.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Economic Calendar</h2>
          <p className="text-gray-500 text-sm mt-1">
            Track upcoming macro economic data releases
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 card">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h3 className="text-lg font-semibold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month start */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-dark-900/30 rounded-lg" />
            ))}

            {/* Days of the month */}
            {daysInMonth.map(day => {
              const events = getEventsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-24 p-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-accent-blue/20 border border-accent-blue'
                      : isToday
                      ? 'bg-dark-700 border border-dark-500'
                      : 'bg-dark-900/50 hover:bg-dark-700 border border-transparent'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday ? 'text-accent-blue' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="mt-1 space-y-1">
                    {events.slice(0, 3).map((event, idx) => {
                      const importance = IMPORTANCE_CONFIG[event.importance];
                      return (
                        <div
                          key={idx}
                          className={`text-xs truncate px-1 py-0.5 rounded ${importance.color}/20 ${importance.textColor}`}
                        >
                          {event.indicator}
                        </div>
                      );
                    })}
                    {events.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{events.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Details Panel */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-accent-blue" />
            {selectedDate
              ? format(selectedDate, 'EEEE, MMMM d')
              : 'Select a Date'
            }
          </h3>

          {selectedDate && selectedEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events scheduled</p>
            </div>
          )}

          <div className="space-y-4">
            {selectedEvents.map((event, idx) => (
              <EventDetailCard key={idx} event={event} />
            ))}
          </div>

          {!selectedDate && (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click on a date to view events</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">All Upcoming Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-dark-600">
                <th className="pb-3 pr-4">Date & Time</th>
                <th className="pb-3 pr-4">Event</th>
                <th className="pb-3 pr-4">Importance</th>
                <th className="pb-3 pr-4">Forecast</th>
                <th className="pb-3 pr-4">Previous</th>
                <th className="pb-3">Affected Assets</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.map((event, idx) => {
                const importance = IMPORTANCE_CONFIG[event.importance];
                const info = INDICATOR_INFO[event.indicator];
                const Icon = info?.icon || BarChart3;

                return (
                  <tr key={idx} className="border-b border-dark-700 text-sm">
                    <td className="py-3 pr-4">
                      <div className="text-white">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(event.date), 'HH:mm')} ET
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-white">{event.name}</div>
                          <div className="text-xs text-gray-500">{info?.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded text-xs ${importance.color}/20 ${importance.textColor}`}>
                        {importance.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono">{event.forecast}</td>
                    <td className="py-3 pr-4 font-mono text-gray-400">{event.previous}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {['SPY', 'DXY', 'TLT', 'VIX'].map(asset => (
                          <span key={asset} className="px-1.5 py-0.5 bg-dark-600 rounded text-xs text-gray-400">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {upcomingEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No upcoming events scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventDetailCard({ event }) {
  const importance = IMPORTANCE_CONFIG[event.importance];
  const info = INDICATOR_INFO[event.indicator];
  const Icon = info?.icon || BarChart3;

  return (
    <div className="p-4 bg-dark-900/50 rounded-lg border-l-2 border-l-accent-blue">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-accent-blue" />
          <div>
            <h4 className="font-medium text-white">{event.name}</h4>
            <p className="text-xs text-gray-500">{info?.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${importance.color}/20 ${importance.textColor}`}>
          {importance.label}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <Clock className="w-4 h-4" />
        {format(new Date(event.date), 'HH:mm')} ET
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 bg-dark-800 rounded">
          <div className="text-xs text-gray-500">Forecast</div>
          <div className="font-mono font-bold text-white">{event.forecast}</div>
        </div>
        <div className="p-2 bg-dark-800 rounded">
          <div className="text-xs text-gray-500">Previous</div>
          <div className="font-mono font-bold text-gray-400">{event.previous}</div>
        </div>
      </div>
    </div>
  );
}
