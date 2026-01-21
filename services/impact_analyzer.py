"""
Impact Analyzer - Calculate market reactions to macro events

Analyzes price changes across asset classes and determines 
the market's reaction to economic data releases.
"""

from datetime import datetime
from typing import Dict, List, Optional

# Asset categories for grouping analysis
ASSET_CATEGORIES = {
    'equity': ['SPY', 'QQQ', 'IWM', 'DIA'],
    'fx': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'DXY'],
    'bond': ['TLT', 'IEF', 'HYG'],
    'volatility': ['VIX', 'VVIX'],
    'commodity': ['GLD', 'USO'],
    'crypto': ['BTC', 'ETH', 'SOL', 'XRP']
}


class ImpactAnalyzer:
    """Analyzes market impact of macro economic events."""
    
    def __init__(self):
        self.impact_thresholds = {
            'minimal': 0.1,
            'moderate': 0.3,
            'significant': 0.5,
            'major': 1.0,
            'extreme': 2.0
        }
    
    def calculate_impact(self, before_snapshot: dict, after_snapshot: dict, event: dict) -> dict:
        """Calculate the market impact between two price snapshots."""
        impacts = {}
        
        # Calculate impact for each asset
        for symbol, after_data in after_snapshot.items():
            before_data = before_snapshot.get(symbol)
            if not before_data:
                continue
            
            price_change = after_data['price'] - before_data['price']
            percent_change = (price_change / before_data['price']) * 100 if before_data['price'] else 0
            
            impacts[symbol] = {
                'symbol': symbol,
                'name': after_data['name'],
                'type': after_data['type'],
                'before_price': before_data['price'],
                'after_price': after_data['price'],
                'price_change': round(price_change, 4),
                'percent_change': round(percent_change, 2),
                'magnitude': self._classify_magnitude(abs(percent_change)),
                'direction': 'up' if percent_change > 0 else ('down' if percent_change < 0 else 'unchanged')
            }
        
        # Calculate category aggregates
        category_impacts = {}
        for category, symbols in ASSET_CATEGORIES.items():
            category_assets = [impacts[s] for s in symbols if s in impacts]
            
            if not category_assets:
                continue
            
            avg_change = sum(a['percent_change'] for a in category_assets) / len(category_assets)
            
            category_impacts[category] = {
                'category': category,
                'avg_percent_change': round(avg_change, 2),
                'magnitude': self._classify_magnitude(abs(avg_change)),
                'direction': 'up' if avg_change > 0 else ('down' if avg_change < 0 else 'unchanged'),
                'assets': category_assets
            }
        
        # Calculate overall market stress
        overall_stress = self._calculate_market_stress(impacts)
        
        # Determine if reaction aligns with expectations
        expected_impact = self._get_expected_reaction(event)
        alignment = self._check_alignment(category_impacts, expected_impact)
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'event': {
                'indicator': event.get('indicator'),
                'actual': event.get('actual'),
                'forecast': event.get('forecast'),
                'surprise': event.get('surprise')
            },
            'asset_impacts': impacts,
            'category_impacts': category_impacts,
            'overall_stress': overall_stress,
            'expected_impact': expected_impact,
            'alignment': alignment,
            'summary': self._generate_summary(category_impacts, event)
        }
    
    def _classify_magnitude(self, abs_percent_change: float) -> str:
        """Classify the magnitude of a price change."""
        if abs_percent_change >= self.impact_thresholds['extreme']:
            return 'extreme'
        if abs_percent_change >= self.impact_thresholds['major']:
            return 'major'
        if abs_percent_change >= self.impact_thresholds['significant']:
            return 'significant'
        if abs_percent_change >= self.impact_thresholds['moderate']:
            return 'moderate'
        if abs_percent_change >= self.impact_thresholds['minimal']:
            return 'minimal'
        return 'negligible'
    
    def _calculate_market_stress(self, impacts: dict) -> str:
        """Calculate overall market stress using VIX as primary indicator."""
        vix_impact = impacts.get('VIX')
        if not vix_impact:
            return 'unknown'
        
        vix_change = vix_impact['percent_change']
        
        if vix_change > 15:
            return 'extreme'
        if vix_change > 10:
            return 'high'
        if vix_change > 5:
            return 'elevated'
        if vix_change > 0:
            return 'mild'
        if vix_change > -5:
            return 'calm'
        return 'very_calm'
    
    def _get_expected_reaction(self, event: dict) -> Optional[dict]:
        """Get expected market reaction based on indicator and surprise."""
        indicator = event.get('indicator')
        surprise = event.get('surprise', 0)
        
        expectations = {
            'CPI': {
                'equity': 'down' if surprise > 0 else 'up',
                'fx': 'up' if surprise > 0 else 'down',
                'bond': 'down' if surprise > 0 else 'up',
                'volatility': 'up' if surprise > 0 else 'down',
                'reasoning': 'Hot CPI suggests Fed stays hawkish, pressuring risk assets' if surprise > 0
                            else 'Cool CPI suggests Fed can ease, supporting risk assets'
            },
            'NFP': {
                'equity': 'neutral' if surprise > 0 else 'down',
                'fx': 'up' if surprise > 0 else 'down',
                'bond': 'down' if surprise > 0 else 'up',
                'volatility': 'up' if abs(surprise) > 20 else 'neutral',
                'reasoning': 'Strong jobs support growth but keep Fed hawkish' if surprise > 0
                            else 'Weak jobs raise recession concerns'
            },
            'PMI': {
                'equity': 'up' if surprise > 0 else 'down',
                'fx': 'up' if surprise > 0 else 'down',
                'bond': 'down' if surprise > 0 else 'up',
                'volatility': 'up' if surprise < -5 else 'down',
                'reasoning': 'Expanding manufacturing supports growth outlook' if surprise > 0
                            else 'Contracting manufacturing signals economic weakness'
            },
            'FOMC': {
                'equity': 'up' if surprise < 0 else 'down',
                'fx': 'down' if surprise < 0 else 'up',
                'bond': 'up' if surprise < 0 else 'down',
                'volatility': 'up',
                'reasoning': 'Dovish Fed supports risk assets' if surprise < 0
                            else 'Hawkish Fed pressures valuations'
            },
            'GDP': {
                'equity': 'up' if surprise > 0 else 'down',
                'fx': 'up' if surprise > 0 else 'down',
                'bond': 'down' if surprise > 0 else 'up',
                'volatility': 'up' if surprise < 0 else 'down',
                'reasoning': 'Stronger growth supports corporate earnings' if surprise > 0
                            else 'Weaker growth raises recession concerns'
            }
        }
        
        return expectations.get(indicator)
    
    def _check_alignment(self, category_impacts: dict, expected_impact: Optional[dict]) -> dict:
        """Check if actual reaction aligns with expected reaction."""
        if not expected_impact:
            return {'aligned': 'unknown', 'score': 0}
        
        aligned_count = 0
        total_checked = 0
        details = {}
        
        for category, expected in expected_impact.items():
            if category == 'reasoning' or category not in category_impacts:
                continue
            
            actual = category_impacts[category]['direction']
            total_checked += 1
            
            is_aligned = expected == 'neutral' or actual == expected or actual == 'unchanged'
            if is_aligned:
                aligned_count += 1
            
            details[category] = {
                'expected': expected,
                'actual': actual,
                'aligned': is_aligned
            }
        
        score = round((aligned_count / total_checked) * 100) if total_checked > 0 else 0
        
        return {
            'aligned': 'yes' if score >= 75 else ('partial' if score >= 50 else 'no'),
            'score': score,
            'details': details,
            'reasoning': expected_impact.get('reasoning', '')
        }
    
    def _generate_summary(self, category_impacts: dict, event: dict) -> str:
        """Generate a human-readable summary of the impact."""
        parts = []
        
        if 'equity' in category_impacts:
            eq = category_impacts['equity']
            parts.append(f"Equities {eq['direction']} {abs(eq['avg_percent_change']):.2f}%")
        
        if 'fx' in category_impacts:
            fx = category_impacts['fx']
            verb = 'strengthened' if fx['direction'] == 'up' else 'weakened'
            parts.append(f"USD {verb} (DXY {fx['direction']} {abs(fx['avg_percent_change']):.2f}%)")
        
        if 'bond' in category_impacts:
            bond = category_impacts['bond']
            parts.append(f"Treasuries {bond['direction']} {abs(bond['avg_percent_change']):.2f}%")
        
        if 'volatility' in category_impacts:
            vol = category_impacts['volatility']
            verb = 'spiked' if vol['direction'] == 'up' else 'dropped'
            parts.append(f"VIX {verb} {abs(vol['avg_percent_change']):.2f}%")
        
        return ' | '.join(parts)
    
    def analyze_historical_impacts(self, events: List[dict]) -> dict:
        """Analyze patterns from historical impact data."""
        analysis = {
            'avg_equity_move': 0,
            'avg_fx_move': 0,
            'avg_bond_move': 0,
            'avg_vol_move': 0,
            'surprise_correlation': 0,
            'best_predictors': [],
            'patterns': []
        }
        
        if not events:
            return analysis
        
        moves = {'equity': [], 'fx': [], 'bond': [], 'vol': []}
        
        for event in events:
            impacts = event.get('impacts', {}).get('60m', {}).get('category_impacts', {})
            if not impacts:
                continue
            
            if 'equity' in impacts:
                moves['equity'].append(impacts['equity']['avg_percent_change'])
            if 'fx' in impacts:
                moves['fx'].append(impacts['fx']['avg_percent_change'])
            if 'bond' in impacts:
                moves['bond'].append(impacts['bond']['avg_percent_change'])
            if 'volatility' in impacts:
                moves['vol'].append(impacts['volatility']['avg_percent_change'])
        
        def avg(arr):
            return sum(arr) / len(arr) if arr else 0
        
        analysis['avg_equity_move'] = round(avg(moves['equity']), 2)
        analysis['avg_fx_move'] = round(avg(moves['fx']), 2)
        analysis['avg_bond_move'] = round(avg(moves['bond']), 2)
        analysis['avg_vol_move'] = round(avg(moves['vol']), 2)
        
        return analysis
