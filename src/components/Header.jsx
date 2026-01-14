import React from 'react';
import { useStore } from '../store/useStore';
import {
  Activity,
  BarChart3,
  Calendar,
  TrendingUp,
  Bell,
  Settings
} from 'lucide-react';

export default function Header() {
  const { viewMode, setViewMode, connected, notifications } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analysis', label: 'Impact Analysis', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar }
  ];

  return (
    <header className="bg-gradient-to-r from-violet-50 via-sky-50 to-emerald-50 border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-semibold bg-gradient-to-r from-violet-600 to-sky-600 bg-clip-text text-transparent">
                Macro Impact
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Real-time Tracker</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === id
                    ? 'bg-white text-violet-700 shadow-sm border border-violet-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full border border-slate-200">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-emerald-500 live-pulse shadow-sm shadow-emerald-500/50' : 'bg-slate-400'
                }`}
              />
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                connected ? 'text-emerald-700' : 'text-slate-500'
              }`}>
                {connected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:text-violet-600 transition-colors hover:bg-white/60 rounded-lg">
              <Bell className="w-4 h-4" strokeWidth={2} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-rose rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 text-slate-600 hover:text-sky-600 transition-colors hover:bg-white/60 rounded-lg">
              <Settings className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
