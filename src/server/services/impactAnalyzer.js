// Impact analysis engine for calculating market reactions to macro events

const ASSET_CATEGORIES = {
  equity: ['SPY', 'QQQ', 'IWM', 'DIA'],
  fx: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'DXY'],
  bond: ['TLT', 'IEF', 'HYG'],
  volatility: ['VIX', 'VVIX'],
  commodity: ['GLD', 'USO']
};

export class ImpactAnalyzer {
  constructor() {
    this.impactThresholds = {
      minimal: 0.1,
      moderate: 0.3,
      significant: 0.5,
      major: 1.0,
      extreme: 2.0
    };
  }

  calculateImpact(beforeSnapshot, afterSnapshot, event) {
    const impacts = {};

    // Calculate impact for each asset
    Object.entries(afterSnapshot).forEach(([symbol, afterData]) => {
      const beforeData = beforeSnapshot[symbol];
      if (!beforeData) return;

      const priceChange = afterData.price - beforeData.price;
      const percentChange = (priceChange / beforeData.price) * 100;

      impacts[symbol] = {
        symbol,
        name: afterData.name,
        type: afterData.type,
        beforePrice: beforeData.price,
        afterPrice: afterData.price,
        priceChange: Math.round(priceChange * 10000) / 10000,
        percentChange: Math.round(percentChange * 100) / 100,
        magnitude: this.classifyMagnitude(Math.abs(percentChange)),
        direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'unchanged'
      };
    });

    // Calculate category aggregates
    const categoryImpacts = {};
    Object.entries(ASSET_CATEGORIES).forEach(([category, symbols]) => {
      const categoryAssets = symbols
        .filter(s => impacts[s])
        .map(s => impacts[s]);

      if (categoryAssets.length === 0) return;

      const avgChange = categoryAssets.reduce((sum, a) => sum + a.percentChange, 0) / categoryAssets.length;

      categoryImpacts[category] = {
        category,
        avgPercentChange: Math.round(avgChange * 100) / 100,
        magnitude: this.classifyMagnitude(Math.abs(avgChange)),
        direction: avgChange > 0 ? 'up' : avgChange < 0 ? 'down' : 'unchanged',
        assets: categoryAssets
      };
    });

    // Calculate overall market stress
    const overallStress = this.calculateMarketStress(impacts);

    // Determine if reaction aligns with expectations
    const expectedImpact = this.getExpectedReaction(event);
    const alignment = this.checkAlignment(categoryImpacts, expectedImpact);

    return {
      timestamp: new Date().toISOString(),
      event: {
        indicator: event.indicator,
        actual: event.actual,
        forecast: event.forecast,
        surprise: event.surprise
      },
      assetImpacts: impacts,
      categoryImpacts,
      overallStress,
      expectedImpact,
      alignment,
      summary: this.generateSummary(categoryImpacts, event)
    };
  }

  classifyMagnitude(absPercentChange) {
    if (absPercentChange >= this.impactThresholds.extreme) return 'extreme';
    if (absPercentChange >= this.impactThresholds.major) return 'major';
    if (absPercentChange >= this.impactThresholds.significant) return 'significant';
    if (absPercentChange >= this.impactThresholds.moderate) return 'moderate';
    if (absPercentChange >= this.impactThresholds.minimal) return 'minimal';
    return 'negligible';
  }

  calculateMarketStress(impacts) {
    // Use VIX change as primary stress indicator
    const vixImpact = impacts['VIX'];
    if (!vixImpact) return 'unknown';

    const vixChange = vixImpact.percentChange;

    if (vixChange > 15) return 'extreme';
    if (vixChange > 10) return 'high';
    if (vixChange > 5) return 'elevated';
    if (vixChange > 0) return 'mild';
    if (vixChange > -5) return 'calm';
    return 'very_calm';
  }

  getExpectedReaction(event) {
    const { indicator, surprise } = event;

    const expectations = {
      CPI: {
        // Higher than expected CPI = hawkish
        equity: surprise > 0 ? 'down' : 'up',
        fx: surprise > 0 ? 'up' : 'down', // USD strength
        bond: surprise > 0 ? 'down' : 'up',
        volatility: surprise > 0 ? 'up' : 'down',
        reasoning: surprise > 0
          ? 'Hot CPI suggests Fed stays hawkish, pressuring risk assets'
          : 'Cool CPI suggests Fed can ease, supporting risk assets'
      },
      NFP: {
        // Strong NFP = mixed, depends on context
        equity: surprise > 0 ? 'neutral' : 'down',
        fx: surprise > 0 ? 'up' : 'down',
        bond: surprise > 0 ? 'down' : 'up',
        volatility: Math.abs(surprise) > 20 ? 'up' : 'neutral',
        reasoning: surprise > 0
          ? 'Strong jobs support growth but keep Fed hawkish'
          : 'Weak jobs raise recession concerns'
      },
      PMI: {
        equity: surprise > 0 ? 'up' : 'down',
        fx: surprise > 0 ? 'up' : 'down',
        bond: surprise > 0 ? 'down' : 'up',
        volatility: surprise < -5 ? 'up' : 'down',
        reasoning: surprise > 0
          ? 'Expanding manufacturing supports growth outlook'
          : 'Contracting manufacturing signals economic weakness'
      },
      FOMC: {
        // For rates, negative surprise = rate cut = dovish
        equity: surprise < 0 ? 'up' : 'down',
        fx: surprise < 0 ? 'down' : 'up',
        bond: surprise < 0 ? 'up' : 'down',
        volatility: 'up', // FOMC always increases vol
        reasoning: surprise < 0
          ? 'Dovish Fed supports risk assets'
          : 'Hawkish Fed pressures valuations'
      },
      GDP: {
        equity: surprise > 0 ? 'up' : 'down',
        fx: surprise > 0 ? 'up' : 'down',
        bond: surprise > 0 ? 'down' : 'up',
        volatility: surprise < 0 ? 'up' : 'down',
        reasoning: surprise > 0
          ? 'Stronger growth supports corporate earnings'
          : 'Weaker growth raises recession concerns'
      }
    };

    return expectations[indicator] || null;
  }

  checkAlignment(categoryImpacts, expectedImpact) {
    if (!expectedImpact) return { aligned: 'unknown', score: 0 };

    let alignedCount = 0;
    let totalChecked = 0;
    const details = {};

    Object.entries(expectedImpact).forEach(([category, expected]) => {
      if (category === 'reasoning' || !categoryImpacts[category]) return;

      const actual = categoryImpacts[category].direction;
      totalChecked++;

      const isAligned = expected === 'neutral' || actual === expected || actual === 'unchanged';
      if (isAligned) alignedCount++;

      details[category] = {
        expected,
        actual,
        aligned: isAligned
      };
    });

    const score = totalChecked > 0 ? Math.round((alignedCount / totalChecked) * 100) : 0;

    return {
      aligned: score >= 75 ? 'yes' : score >= 50 ? 'partial' : 'no',
      score,
      details,
      reasoning: expectedImpact.reasoning
    };
  }

  generateSummary(categoryImpacts, event) {
    const parts = [];

    // Equity summary
    if (categoryImpacts.equity) {
      const eq = categoryImpacts.equity;
      parts.push(`Equities ${eq.direction} ${Math.abs(eq.avgPercentChange).toFixed(2)}%`);
    }

    // FX summary
    if (categoryImpacts.fx) {
      const fx = categoryImpacts.fx;
      parts.push(`USD ${fx.direction === 'up' ? 'strengthened' : 'weakened'} (DXY ${fx.direction} ${Math.abs(fx.avgPercentChange).toFixed(2)}%)`);
    }

    // Bond summary
    if (categoryImpacts.bond) {
      const bond = categoryImpacts.bond;
      parts.push(`Treasuries ${bond.direction} ${Math.abs(bond.avgPercentChange).toFixed(2)}%`);
    }

    // Volatility summary
    if (categoryImpacts.volatility) {
      const vol = categoryImpacts.volatility;
      parts.push(`VIX ${vol.direction === 'up' ? 'spiked' : 'dropped'} ${Math.abs(vol.avgPercentChange).toFixed(2)}%`);
    }

    return parts.join(' | ');
  }

  // Historical impact analysis
  analyzeHistoricalImpacts(events) {
    const analysis = {
      avgEquityMove: 0,
      avgFxMove: 0,
      avgBondMove: 0,
      avgVolMove: 0,
      surpriseCorrelation: 0,
      bestPredictors: [],
      patterns: []
    };

    if (events.length === 0) return analysis;

    // Calculate averages
    let equityMoves = [];
    let fxMoves = [];
    let bondMoves = [];
    let volMoves = [];

    events.forEach(event => {
      if (event.impacts?.['60m']?.categoryImpacts) {
        const impacts = event.impacts['60m'].categoryImpacts;
        if (impacts.equity) equityMoves.push(impacts.equity.avgPercentChange);
        if (impacts.fx) fxMoves.push(impacts.fx.avgPercentChange);
        if (impacts.bond) bondMoves.push(impacts.bond.avgPercentChange);
        if (impacts.volatility) volMoves.push(impacts.volatility.avgPercentChange);
      }
    });

    const avg = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    analysis.avgEquityMove = Math.round(avg(equityMoves) * 100) / 100;
    analysis.avgFxMove = Math.round(avg(fxMoves) * 100) / 100;
    analysis.avgBondMove = Math.round(avg(bondMoves) * 100) / 100;
    analysis.avgVolMove = Math.round(avg(volMoves) * 100) / 100;

    return analysis;
  }
}
