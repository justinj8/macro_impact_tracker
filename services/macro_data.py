"""
Macro Data Service - Economic indicator definitions and historical data

Provides information about macro economic indicators like CPI, NFP, FOMC,
and their expected market impacts.
"""

from typing import Dict, List, Optional

# Macro economic indicators configuration
INDICATORS = {
    'CPI': {
        'name': 'Consumer Price Index',
        'full_name': 'CPI YoY',
        'frequency': 'monthly',
        'importance': 'high',
        'affected_assets': ['SPY', 'QQQ', 'TLT', 'DXY', 'GLD', 'VIX'],
        'description': 'Measures inflation by tracking price changes of consumer goods'
    },
    'NFP': {
        'name': 'Non-Farm Payrolls',
        'full_name': 'Non-Farm Payrolls',
        'frequency': 'monthly',
        'importance': 'high',
        'affected_assets': ['SPY', 'DXY', 'TLT', 'EUR/USD', 'VIX'],
        'description': 'Measures employment changes excluding farm workers'
    },
    'PMI': {
        'name': 'PMI Manufacturing',
        'full_name': 'ISM Manufacturing PMI',
        'frequency': 'monthly',
        'importance': 'medium',
        'affected_assets': ['SPY', 'IWM', 'DXY', 'USO'],
        'description': 'Measures manufacturing sector health'
    },
    'FOMC': {
        'name': 'Fed Rate Decision',
        'full_name': 'FOMC Interest Rate Decision',
        'frequency': 'variable',
        'importance': 'critical',
        'affected_assets': ['SPY', 'QQQ', 'TLT', 'DXY', 'GLD', 'VIX', 'EUR/USD'],
        'description': 'Federal Reserve interest rate decisions'
    },
    'GDP': {
        'name': 'GDP Growth Rate',
        'full_name': 'GDP QoQ Annualized',
        'frequency': 'quarterly',
        'importance': 'high',
        'affected_assets': ['SPY', 'DXY', 'TLT'],
        'description': 'Measures overall economic growth'
    },
    'CLAIMS': {
        'name': 'Jobless Claims',
        'full_name': 'Initial Jobless Claims',
        'frequency': 'weekly',
        'importance': 'medium',
        'affected_assets': ['SPY', 'TLT', 'DXY'],
        'description': 'Weekly unemployment insurance claims'
    },
    'RETAIL': {
        'name': 'Retail Sales',
        'full_name': 'Retail Sales MoM',
        'frequency': 'monthly',
        'importance': 'medium',
        'affected_assets': ['SPY', 'XRT', 'DXY'],
        'description': 'Measures consumer spending'
    },
    'PCE': {
        'name': 'PCE Price Index',
        'full_name': 'Core PCE Price Index YoY',
        'frequency': 'monthly',
        'importance': 'high',
        'affected_assets': ['SPY', 'TLT', 'DXY', 'GLD'],
        'description': "Fed's preferred inflation measure"
    },
    'PPI': {
        'name': 'Producer Price Index',
        'full_name': 'PPI MoM',
        'frequency': 'monthly',
        'importance': 'medium',
        'affected_assets': ['SPY', 'TLT', 'DXY', 'USO'],
        'description': 'Measures wholesale price changes'
    }
}

# Historical data for indicators (simulated)
HISTORICAL_DATA = {
    'CPI': [
        {'date': '2024-12-11', 'actual': 2.7, 'forecast': 2.7, 'previous': 2.6},
        {'date': '2024-11-13', 'actual': 2.6, 'forecast': 2.6, 'previous': 2.4},
        {'date': '2024-10-10', 'actual': 2.4, 'forecast': 2.3, 'previous': 2.5},
        {'date': '2024-09-11', 'actual': 2.5, 'forecast': 2.6, 'previous': 2.9},
        {'date': '2024-08-14', 'actual': 2.9, 'forecast': 3.0, 'previous': 3.0},
    ],
    'NFP': [
        {'date': '2025-01-10', 'actual': 256, 'forecast': 164, 'previous': 212},
        {'date': '2024-12-06', 'actual': 227, 'forecast': 200, 'previous': 36},
        {'date': '2024-11-01', 'actual': 12, 'forecast': 100, 'previous': 223},
        {'date': '2024-10-04', 'actual': 254, 'forecast': 147, 'previous': 159},
        {'date': '2024-09-06', 'actual': 142, 'forecast': 160, 'previous': 89},
    ],
    'PMI': [
        {'date': '2025-01-03', 'actual': 49.3, 'forecast': 48.2, 'previous': 48.4},
        {'date': '2024-12-02', 'actual': 48.4, 'forecast': 47.5, 'previous': 46.5},
        {'date': '2024-11-01', 'actual': 46.5, 'forecast': 47.5, 'previous': 47.2},
        {'date': '2024-10-01', 'actual': 47.2, 'forecast': 47.0, 'previous': 47.2},
    ],
    'FOMC': [
        {'date': '2024-12-18', 'actual': 4.50, 'forecast': 4.50, 'previous': 4.75},
        {'date': '2024-11-07', 'actual': 4.75, 'forecast': 4.75, 'previous': 5.00},
        {'date': '2024-09-18', 'actual': 5.00, 'forecast': 5.25, 'previous': 5.50},
    ]
}


class MacroDataService:
    """Service for managing macro economic indicator data."""
    
    def __init__(self):
        self.indicators = INDICATORS
        self.cache: Dict[str, dict] = {}
    
    def get_indicator_info(self, indicator: str) -> Optional[dict]:
        """Get configuration info for an indicator."""
        return self.indicators.get(indicator)
    
    def get_all_indicators(self) -> List[dict]:
        """Get list of all indicators with their info."""
        return [
            {'id': key, **value}
            for key, value in self.indicators.items()
        ]
    
    def get_indicator_history(self, indicator: str, limit: int = 12) -> dict:
        """Get historical data for an indicator."""
        data = HISTORICAL_DATA.get(indicator, [])
        return {
            'indicator': indicator,
            'info': self.indicators.get(indicator),
            'history': data[:limit]
        }
    
    def calculate_surprise(self, actual: float, forecast: float) -> float:
        """Calculate the surprise factor as a percentage."""
        if not forecast or forecast == 0:
            return 0
        return ((actual - forecast) / abs(forecast)) * 100
    
    def get_expected_impact(self, indicator: str, surprise: float) -> Optional[dict]:
        """Get expected market impact based on indicator and surprise direction."""
        impacts = {
            'CPI': {
                # Higher CPI = hawkish = bearish for equities, bullish for USD
                'equity': 'bearish' if surprise > 0 else 'bullish',
                'fx': 'bullish' if surprise > 0 else 'bearish',
                'bonds': 'bearish' if surprise > 0 else 'bullish',
                'volatility': 'bullish' if surprise > 0 else 'bearish'
            },
            'NFP': {
                # Strong NFP = hawkish = mixed for equities, bullish for USD
                'equity': 'bullish' if surprise > 0 else 'bearish',
                'fx': 'bullish' if surprise > 0 else 'bearish',
                'bonds': 'bearish' if surprise > 0 else 'bullish',
                'volatility': 'bearish' if surprise > 0 else 'bullish'
            },
            'PMI': {
                # Higher PMI = expansionary = bullish
                'equity': 'bullish' if surprise > 0 else 'bearish',
                'fx': 'bullish' if surprise > 0 else 'bearish',
                'bonds': 'bearish' if surprise > 0 else 'bullish',
                'volatility': 'bearish' if surprise > 0 else 'bullish'
            },
            'FOMC': {
                # Rate cut = dovish = bullish for equities
                'equity': 'bullish' if surprise < 0 else 'bearish',
                'fx': 'bearish' if surprise < 0 else 'bullish',
                'bonds': 'bullish' if surprise < 0 else 'bearish',
                'volatility': 'mixed'
            },
            'GDP': {
                'equity': 'bullish' if surprise > 0 else 'bearish',
                'fx': 'bullish' if surprise > 0 else 'bearish',
                'bonds': 'bearish' if surprise > 0 else 'bullish',
                'volatility': 'bullish' if surprise < 0 else 'bearish'
            }
        }
        
        return impacts.get(indicator)
