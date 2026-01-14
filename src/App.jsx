import React, { useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useStore } from './store/useStore';
import Header from './components/Header';
import MarketTicker from './components/MarketTicker';
import Dashboard from './components/Dashboard';
import EventFeed from './components/EventFeed';
import ImpactAnalysis from './components/ImpactAnalysis';
import Calendar from './components/Calendar';
import NotificationCenter from './components/NotificationCenter';

export default function App() {
  useSocket();

  const { viewMode, connected } = useStore();

  useEffect(() => {
    // Fetch initial data
    fetch('/api/calendar')
      .then(res => res.json())
      .then(data => {
        useStore.getState().setUpcomingEvents(data);
      })
      .catch(console.error);

    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        useStore.getState().setImpactHistory(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <MarketTicker />

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {viewMode === 'dashboard' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <Dashboard />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <EventFeed />
            </div>
          </div>
        )}

        {viewMode === 'analysis' && <ImpactAnalysis />}
        {viewMode === 'calendar' && <Calendar />}
      </main>

      <NotificationCenter />

      {!connected && (
        <div className="fixed bottom-6 left-6 bg-rose-50 border border-rose-300 px-4 py-3 text-rose-900 text-sm shadow-medium rounded-lg">
          <span className="font-medium">Reconnecting...</span>
        </div>
      )}
    </div>
  );
}
