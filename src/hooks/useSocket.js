import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useStore } from '../store/useStore';

export function useSocket() {
  const socketRef = useRef(null);
  const {
    setConnected,
    updateMarketData,
    setMarketSnapshot,
    addActiveEvent,
    updateEventImpact,
    removeActiveEvent,
    setActiveEvents,
    addNotification,
    addPricePoint
  } = useStore();

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);

      // Subscribe to all major assets
      socket.emit('subscribe', [
        'SPY', 'QQQ', 'IWM', 'DIA',
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'DXY',
        'TLT', 'IEF', 'HYG',
        'VIX', 'VVIX',
        'GLD', 'USO'
      ]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Market data updates
    socket.on('marketSnapshot', (snapshot) => {
      setMarketSnapshot(snapshot);
    });

    socket.on('priceUpdate', (data) => {
      updateMarketData(data);
      addPricePoint(data.symbol, {
        time: Date.now(),
        price: data.price
      });
    });

    socket.on('marketTick', (data) => {
      // Batch update handled by priceUpdate
    });

    // Event updates
    socket.on('activeEvents', (events) => {
      setActiveEvents(events);
    });

    socket.on('eventUpcoming', (event) => {
      addNotification({
        type: 'warning',
        title: 'Event Upcoming',
        message: `${event.name} releasing in ${event.minutesUntil} minutes`,
        indicator: event.indicator
      });
    });

    socket.on('eventReleased', (event) => {
      addActiveEvent(event);

      const surpriseText = event.surprise > 0 ? `+${event.surprise.toFixed(1)}%` : `${event.surprise.toFixed(1)}%`;
      const surpriseType = Math.abs(event.surprise) > 5 ? 'error' : 'info';

      addNotification({
        type: surpriseType,
        title: `${event.name} Released`,
        message: `Actual: ${event.actual} | Forecast: ${event.forecast} | Surprise: ${surpriseText}`,
        indicator: event.indicator
      });
    });

    socket.on('impactUpdate', ({ eventId, interval, impact }) => {
      updateEventImpact(eventId, interval, impact);
    });

    socket.on('eventArchived', (eventId) => {
      removeActiveEvent(eventId);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
}
