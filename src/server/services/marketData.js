import { EventEmitter } from 'events';

// Market assets configuration
const ASSETS = {
  // Equities
  SPY: { name: 'S&P 500 ETF', type: 'equity', basePrice: 592.50, volatility: 0.008 },
  QQQ: { name: 'Nasdaq 100 ETF', type: 'equity', basePrice: 518.30, volatility: 0.012 },
  IWM: { name: 'Russell 2000 ETF', type: 'equity', basePrice: 225.40, volatility: 0.015 },
  DIA: { name: 'Dow Jones ETF', type: 'equity', basePrice: 432.80, volatility: 0.007 },

  // FX
  'EUR/USD': { name: 'Euro/Dollar', type: 'fx', basePrice: 1.0298, volatility: 0.002, decimals: 4 },
  'GBP/USD': { name: 'Pound/Dollar', type: 'fx', basePrice: 1.2198, volatility: 0.003, decimals: 4 },
  'USD/JPY': { name: 'Dollar/Yen', type: 'fx', basePrice: 157.85, volatility: 0.003, decimals: 2 },
  DXY: { name: 'Dollar Index', type: 'fx', basePrice: 109.65, volatility: 0.002 },

  // Bonds
  TLT: { name: '20+ Year Treasury ETF', type: 'bond', basePrice: 87.45, volatility: 0.008 },
  IEF: { name: '7-10 Year Treasury ETF', type: 'bond', basePrice: 93.20, volatility: 0.004 },
  HYG: { name: 'High Yield Corp Bond', type: 'bond', basePrice: 77.85, volatility: 0.005 },

  // Volatility
  VIX: { name: 'CBOE Volatility Index', type: 'volatility', basePrice: 16.80, volatility: 0.05 },
  VVIX: { name: 'VIX of VIX', type: 'volatility', basePrice: 92.50, volatility: 0.08 },

  // Commodities
  GLD: { name: 'Gold ETF', type: 'commodity', basePrice: 242.30, volatility: 0.006 },
  USO: { name: 'Oil Fund', type: 'commodity', basePrice: 73.45, volatility: 0.02 },
};

export class MarketDataService extends EventEmitter {
  constructor() {
    super();
    this.assets = ASSETS;
    this.currentPrices = {};
    this.priceHistory = {};
    this.intervalId = null;

    // Initialize prices
    Object.entries(ASSETS).forEach(([symbol, config]) => {
      this.currentPrices[symbol] = {
        symbol,
        name: config.name,
        type: config.type,
        price: config.basePrice,
        open: config.basePrice,
        high: config.basePrice,
        low: config.basePrice,
        change: 0,
        changePercent: 0,
        volume: Math.floor(Math.random() * 1000000),
        lastUpdate: new Date().toISOString()
      };
      this.priceHistory[symbol] = [{ time: Date.now(), price: config.basePrice }];
    });
  }

  startSimulation() {
    // Update prices every 500ms
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, 500);

    console.log('Market data simulation started');
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  updatePrices() {
    const updates = [];

    Object.entries(this.assets).forEach(([symbol, config]) => {
      const current = this.currentPrices[symbol];

      // Random walk with mean reversion
      const meanReversionStrength = 0.001;
      const randomComponent = (Math.random() - 0.5) * 2 * config.volatility;
      const meanReversion = (config.basePrice - current.price) / config.basePrice * meanReversionStrength;

      const priceChange = current.price * (randomComponent + meanReversion);
      const newPrice = Math.max(current.price + priceChange, 0.01);

      const decimals = config.decimals || 2;
      const roundedPrice = Math.round(newPrice * Math.pow(10, decimals)) / Math.pow(10, decimals);

      const change = roundedPrice - current.open;
      const changePercent = (change / current.open) * 100;

      this.currentPrices[symbol] = {
        ...current,
        price: roundedPrice,
        high: Math.max(current.high, roundedPrice),
        low: Math.min(current.low, roundedPrice),
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: current.volume + Math.floor(Math.random() * 1000),
        lastUpdate: new Date().toISOString()
      };

      // Store history (keep last 500 points)
      this.priceHistory[symbol].push({ time: Date.now(), price: roundedPrice });
      if (this.priceHistory[symbol].length > 500) {
        this.priceHistory[symbol].shift();
      }

      updates.push(this.currentPrices[symbol]);
    });

    // Emit updates
    updates.forEach(update => {
      this.emit('priceUpdate', update);
    });
  }

  getQuote(symbol) {
    return this.currentPrices[symbol] || null;
  }

  getSnapshot() {
    return { ...this.currentPrices };
  }

  getHistory(symbol, points = 100) {
    const history = this.priceHistory[symbol] || [];
    return history.slice(-points);
  }

  getAllByType(type) {
    return Object.entries(this.currentPrices)
      .filter(([_, data]) => data.type === type)
      .map(([symbol, data]) => data);
  }

  // Apply shock to prices (used when macro event releases)
  applyShock(shockConfig) {
    const { symbol, direction, magnitude } = shockConfig;

    if (!this.currentPrices[symbol]) return;

    const current = this.currentPrices[symbol];
    const shockMultiplier = direction === 'up' ? (1 + magnitude) : (1 - magnitude);
    const newPrice = current.price * shockMultiplier;

    const decimals = this.assets[symbol]?.decimals || 2;
    const roundedPrice = Math.round(newPrice * Math.pow(10, decimals)) / Math.pow(10, decimals);

    this.currentPrices[symbol] = {
      ...current,
      price: roundedPrice,
      high: Math.max(current.high, roundedPrice),
      low: Math.min(current.low, roundedPrice),
      change: roundedPrice - current.open,
      changePercent: ((roundedPrice - current.open) / current.open) * 100,
      lastUpdate: new Date().toISOString()
    };

    this.emit('priceUpdate', this.currentPrices[symbol]);
  }
}
