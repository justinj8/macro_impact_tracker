import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Connection state
  connected: false,
  setConnected: (connected) => set({ connected }),

  // Market data
  marketData: {},
  updateMarketData: (data) => set((state) => ({
    marketData: {
      ...state.marketData,
      [data.symbol]: data
    }
  })),
  setMarketSnapshot: (snapshot) => set({ marketData: snapshot }),

  // Active events being tracked
  activeEvents: [],
  addActiveEvent: (event) => set((state) => ({
    activeEvents: [...state.activeEvents, event]
  })),
  updateEventImpact: (eventId, interval, impact) => set((state) => ({
    activeEvents: state.activeEvents.map(e =>
      e.id === eventId
        ? { ...e, impacts: { ...e.impacts, [interval]: impact } }
        : e
    )
  })),
  removeActiveEvent: (eventId) => set((state) => ({
    activeEvents: state.activeEvents.filter(e => e.id !== eventId)
  })),
  setActiveEvents: (events) => set({ activeEvents: events }),

  // Upcoming events calendar
  upcomingEvents: [],
  setUpcomingEvents: (events) => set({ upcomingEvents: events }),

  // Impact history
  impactHistory: [],
  addToHistory: (event) => set((state) => ({
    impactHistory: [...state.impactHistory, event].slice(-100)
  })),
  setImpactHistory: (history) => set({ impactHistory: history }),

  // Price history for charts
  priceHistory: {},
  addPricePoint: (symbol, point) => set((state) => {
    const history = state.priceHistory[symbol] || [];
    const newHistory = [...history, point].slice(-200);
    return {
      priceHistory: {
        ...state.priceHistory,
        [symbol]: newHistory
      }
    };
  }),

  // Selected view
  selectedIndicator: null,
  setSelectedIndicator: (indicator) => set({ selectedIndicator: indicator }),

  selectedAsset: 'SPY',
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  // View mode
  viewMode: 'dashboard', // dashboard, analysis, calendar
  setViewMode: (mode) => set({ viewMode: mode }),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [
      { id: Date.now(), ...notification },
      ...state.notifications
    ].slice(0, 10)
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),
}));
