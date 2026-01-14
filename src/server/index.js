import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MacroDataService } from './services/macroData.js';
import { MarketDataService } from './services/marketData.js';
import { ImpactAnalyzer } from './services/impactAnalyzer.js';
import { EventScheduler } from './services/eventScheduler.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Initialize services
const macroService = new MacroDataService();
const marketService = new MarketDataService();
const impactAnalyzer = new ImpactAnalyzer();
const eventScheduler = new EventScheduler();

// Store for tracking active events and their impacts
const activeEvents = new Map();
const impactHistory = [];

// API Routes
app.get('/api/calendar', async (req, res) => {
  try {
    const events = await eventScheduler.getUpcomingEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/live', (req, res) => {
  res.json(Array.from(activeEvents.values()));
});

app.get('/api/history', (req, res) => {
  const { indicator, limit = 50 } = req.query;
  let filtered = impactHistory;
  if (indicator) {
    filtered = impactHistory.filter(h => h.indicator === indicator);
  }
  res.json(filtered.slice(-parseInt(limit)));
});

app.get('/api/indicators/:indicator', async (req, res) => {
  try {
    const data = await macroService.getIndicatorHistory(req.params.indicator);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/:symbol', async (req, res) => {
  try {
    const data = await marketService.getQuote(req.params.symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/impact/:eventId', (req, res) => {
  const event = activeEvents.get(req.params.eventId);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current state
  socket.emit('activeEvents', Array.from(activeEvents.values()));
  socket.emit('marketSnapshot', marketService.getSnapshot());

  // Subscribe to specific symbols
  socket.on('subscribe', (symbols) => {
    symbols.forEach(symbol => {
      socket.join(`market:${symbol}`);
    });
  });

  socket.on('unsubscribe', (symbols) => {
    symbols.forEach(symbol => {
      socket.leave(`market:${symbol}`);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Real-time market data broadcast
marketService.on('priceUpdate', (data) => {
  io.to(`market:${data.symbol}`).emit('priceUpdate', data);
  io.emit('marketTick', data);
});

// Event scheduler broadcasts
eventScheduler.on('eventUpcoming', (event) => {
  io.emit('eventUpcoming', event);
});

eventScheduler.on('eventReleased', async (event) => {
  console.log(`Event released: ${event.name}`);

  // Capture market state at release
  const marketSnapshot = marketService.getSnapshot();

  const activeEvent = {
    ...event,
    id: `${event.indicator}-${Date.now()}`,
    releasedAt: new Date().toISOString(),
    marketStateAtRelease: marketSnapshot,
    impacts: {},
    tracking: true
  };

  activeEvents.set(activeEvent.id, activeEvent);
  io.emit('eventReleased', activeEvent);

  // Start tracking impact
  trackEventImpact(activeEvent);
});

async function trackEventImpact(event) {
  const intervals = [1, 5, 15, 30, 60]; // minutes

  for (const minutes of intervals) {
    setTimeout(async () => {
      if (!activeEvents.has(event.id)) return;

      const currentSnapshot = marketService.getSnapshot();
      const impact = impactAnalyzer.calculateImpact(
        event.marketStateAtRelease,
        currentSnapshot,
        event
      );

      const activeEvent = activeEvents.get(event.id);
      activeEvent.impacts[`${minutes}m`] = impact;

      io.emit('impactUpdate', {
        eventId: event.id,
        interval: `${minutes}m`,
        impact
      });

      // Archive after 60 minutes
      if (minutes === 60) {
        activeEvent.tracking = false;
        impactHistory.push(activeEvent);
        activeEvents.delete(event.id);
        io.emit('eventArchived', event.id);
      }
    }, minutes * 60 * 1000);
  }
}

// Start services
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Macro Impact Tracker server running on port ${PORT}`);

  // Start market data simulation
  marketService.startSimulation();

  // Start event scheduler
  eventScheduler.start();

  console.log('📊 Market data streaming...');
  console.log('📅 Event scheduler active...');
});
