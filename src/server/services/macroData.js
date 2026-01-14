import axios from 'axios';

// Macro economic indicators configuration
const INDICATORS = {
  CPI: {
    name: 'Consumer Price Index',
    fullName: 'CPI YoY',
    frequency: 'monthly',
    importance: 'high',
    affectedAssets: ['SPY', 'QQQ', 'TLT', 'DXY', 'GLD', 'VIX'],
    description: 'Measures inflation by tracking price changes of consumer goods'
  },
  NFP: {
    name: 'Non-Farm Payrolls',
    fullName: 'Non-Farm Payrolls',
    frequency: 'monthly',
    importance: 'high',
    affectedAssets: ['SPY', 'DXY', 'TLT', 'EUR/USD', 'VIX'],
    description: 'Measures employment changes excluding farm workers'
  },
  PMI: {
    name: 'PMI Manufacturing',
    fullName: 'ISM Manufacturing PMI',
    frequency: 'monthly',
    importance: 'medium',
    affectedAssets: ['SPY', 'IWM', 'DXY', 'USO'],
    description: 'Measures manufacturing sector health'
  },
  FOMC: {
    name: 'Fed Rate Decision',
    fullName: 'FOMC Interest Rate Decision',
    frequency: 'variable',
    importance: 'critical',
    affectedAssets: ['SPY', 'QQQ', 'TLT', 'DXY', 'GLD', 'VIX', 'EUR/USD'],
    description: 'Federal Reserve interest rate decisions'
  },
  GDP: {
    name: 'GDP Growth Rate',
    fullName: 'GDP QoQ Annualized',
    frequency: 'quarterly',
    importance: 'high',
    affectedAssets: ['SPY', 'DXY', 'TLT'],
    description: 'Measures overall economic growth'
  },
  CLAIMS: {
    name: 'Jobless Claims',
    fullName: 'Initial Jobless Claims',
    frequency: 'weekly',
    importance: 'medium',
    affectedAssets: ['SPY', 'TLT', 'DXY'],
    description: 'Weekly unemployment insurance claims'
  },
  RETAIL: {
    name: 'Retail Sales',
    fullName: 'Retail Sales MoM',
    frequency: 'monthly',
    importance: 'medium',
    affectedAssets: ['SPY', 'XRT', 'DXY'],
    description: 'Measures consumer spending'
  },
  PCE: {
    name: 'PCE Price Index',
    fullName: 'Core PCE Price Index YoY',
    frequency: 'monthly',
    importance: 'high',
    affectedAssets: ['SPY', 'TLT', 'DXY', 'GLD'],
    description: 'Fed\'s preferred inflation measure'
  },
  PPI: {
    name: 'Producer Price Index',
    fullName: 'PPI MoM',
    frequency: 'monthly',
    importance: 'medium',
    affectedAssets: ['SPY', 'TLT', 'DXY', 'USO'],
    description: 'Measures wholesale price changes'
  }
};

// Historical data for indicators (simulated)
const historicalData = {
  CPI: [
    { date: '2024-12-11', actual: 2.7, forecast: 2.7, previous: 2.6 },
    { date: '2024-11-13', actual: 2.6, forecast: 2.6, previous: 2.4 },
    { date: '2024-10-10', actual: 2.4, forecast: 2.3, previous: 2.5 },
    { date: '2024-09-11', actual: 2.5, forecast: 2.6, previous: 2.9 },
    { date: '2024-08-14', actual: 2.9, forecast: 3.0, previous: 3.0 },
  ],
  NFP: [
    { date: '2025-01-10', actual: 256, forecast: 164, previous: 212 },
    { date: '2024-12-06', actual: 227, forecast: 200, previous: 36 },
    { date: '2024-11-01', actual: 12, forecast: 100, previous: 223 },
    { date: '2024-10-04', actual: 254, forecast: 147, previous: 159 },
    { date: '2024-09-06', actual: 142, forecast: 160, previous: 89 },
  ],
  PMI: [
    { date: '2025-01-03', actual: 49.3, forecast: 48.2, previous: 48.4 },
    { date: '2024-12-02', actual: 48.4, forecast: 47.5, previous: 46.5 },
    { date: '2024-11-01', actual: 46.5, forecast: 47.5, previous: 47.2 },
    { date: '2024-10-01', actual: 47.2, forecast: 47.0, previous: 47.2 },
  ],
  FOMC: [
    { date: '2024-12-18', actual: 4.50, forecast: 4.50, previous: 4.75 },
    { date: '2024-11-07', actual: 4.75, forecast: 4.75, previous: 5.00 },
    { date: '2024-09-18', actual: 5.00, forecast: 5.25, previous: 5.50 },
  ]
};

export class MacroDataService {
  constructor() {
    this.indicators = INDICATORS;
    this.cache = new Map();
  }

  getIndicatorInfo(indicator) {
    return this.indicators[indicator] || null;
  }

  getAllIndicators() {
    return Object.entries(this.indicators).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  async getIndicatorHistory(indicator, limit = 12) {
    const data = historicalData[indicator] || [];
    return {
      indicator,
      info: this.indicators[indicator],
      history: data.slice(0, limit)
    };
  }

  // Calculate surprise factor
  calculateSurprise(actual, forecast) {
    if (!forecast || forecast === 0) return 0;
    return ((actual - forecast) / Math.abs(forecast)) * 100;
  }

  // Get impact direction based on indicator and surprise
  getExpectedImpact(indicator, surprise) {
    const impacts = {
      CPI: {
        // Higher CPI = hawkish = bearish for equities, bullish for USD
        equity: surprise > 0 ? 'bearish' : 'bullish',
        fx: surprise > 0 ? 'bullish' : 'bearish',
        bonds: surprise > 0 ? 'bearish' : 'bullish',
        volatility: surprise > 0 ? 'bullish' : 'bearish'
      },
      NFP: {
        // Strong NFP = hawkish = mixed for equities, bullish for USD
        equity: surprise > 0 ? 'bullish' : 'bearish',
        fx: surprise > 0 ? 'bullish' : 'bearish',
        bonds: surprise > 0 ? 'bearish' : 'bullish',
        volatility: surprise > 0 ? 'bearish' : 'bullish'
      },
      PMI: {
        // Higher PMI = expansionary = bullish
        equity: surprise > 0 ? 'bullish' : 'bearish',
        fx: surprise > 0 ? 'bullish' : 'bearish',
        bonds: surprise > 0 ? 'bearish' : 'bullish',
        volatility: surprise > 0 ? 'bearish' : 'bullish'
      },
      FOMC: {
        // Rate cut = dovish = bullish for equities
        equity: surprise < 0 ? 'bullish' : 'bearish',
        fx: surprise < 0 ? 'bearish' : 'bullish',
        bonds: surprise < 0 ? 'bullish' : 'bearish',
        volatility: 'mixed'
      }
    };

    return impacts[indicator] || null;
  }

  // Fetch from FRED API (if API key available)
  async fetchFromFRED(seriesId) {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
      console.log('FRED API key not configured, using simulated data');
      return null;
    }

    try {
      const response = await axios.get(
        `https://api.stlouisfed.org/fred/series/observations`,
        {
          params: {
            series_id: seriesId,
            api_key: apiKey,
            file_type: 'json',
            sort_order: 'desc',
            limit: 12
          }
        }
      );
      return response.data.observations;
    } catch (error) {
      console.error(`FRED API error: ${error.message}`);
      return null;
    }
  }
}
