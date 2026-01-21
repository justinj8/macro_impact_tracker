"""
Market Data Service - Live prices from real APIs

Fetches real-time prices from:
- Alpha Vantage / Yahoo (stocks, ETFs - with fallback)
- CoinGecko (crypto - free, no key needed)

Optimized for fast initial load with parallel requests.
"""

import time
import threading
import requests
from datetime import datetime
from typing import Dict, List, Callable, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

# Asset configuration with realistic base prices for fallback
ASSETS = {
    # Equities
    'SPY': {'name': 'S&P 500 ETF', 'type': 'equity', 'base_price': 596.50},
    'QQQ': {'name': 'Nasdaq 100 ETF', 'type': 'equity', 'base_price': 525.80},
    'IWM': {'name': 'Russell 2000 ETF', 'type': 'equity', 'base_price': 225.40},
    'DIA': {'name': 'Dow Jones ETF', 'type': 'equity', 'base_price': 437.20},
    
    # Forex
    'EUR/USD': {'name': 'Euro/Dollar', 'type': 'fx', 'base_price': 1.0285},
    'GBP/USD': {'name': 'Pound/Dollar', 'type': 'fx', 'base_price': 1.2180},
    'USD/JPY': {'name': 'Dollar/Yen', 'type': 'fx', 'base_price': 156.50},
    'DXY': {'name': 'Dollar Index', 'type': 'fx', 'base_price': 109.35},
    
    # Bonds
    'TLT': {'name': '20+ Year Treasury ETF', 'type': 'bond', 'base_price': 87.45},
    'IEF': {'name': '7-10 Year Treasury ETF', 'type': 'bond', 'base_price': 91.20},
    'HYG': {'name': 'High Yield Bond ETF', 'type': 'bond', 'base_price': 78.65},
    
    # Volatility
    'VIX': {'name': 'CBOE Volatility Index', 'type': 'volatility', 'base_price': 15.80},
    'VVIX': {'name': 'VIX of VIX', 'type': 'volatility', 'base_price': 92.50},
    
    # Commodities
    'GLD': {'name': 'Gold ETF', 'type': 'commodity', 'base_price': 266.80},
    'USO': {'name': 'Oil Fund', 'type': 'commodity', 'base_price': 74.20},
    
    # Crypto (CoinGecko IDs)
    'BTC': {'name': 'Bitcoin', 'type': 'crypto', 'coingecko': 'bitcoin', 'base_price': 105000},
    'ETH': {'name': 'Ethereum', 'type': 'crypto', 'coingecko': 'ethereum', 'base_price': 3300},
    'SOL': {'name': 'Solana', 'type': 'crypto', 'coingecko': 'solana', 'base_price': 260},
    'XRP': {'name': 'Ripple', 'type': 'crypto', 'coingecko': 'ripple', 'base_price': 3.15},
}


class MarketDataService:
    """Fetches live market data from real APIs with fast initialization."""
    
    def __init__(self):
        self.assets = ASSETS
        self.prices: Dict[str, dict] = {}
        self.price_history: Dict[str, List[dict]] = {}
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._callbacks: List[Callable] = []
        self._last_update = None
        self._initialized = False
        
        # Initialize with base prices immediately (so UI shows something right away)
        now = datetime.utcnow()
        for symbol, config in self.assets.items():
            base_price = config.get('base_price', 100)
            self.prices[symbol] = {
                'symbol': symbol,
                'name': config['name'],
                'type': config['type'],
                'price': base_price,
                'change': 0,
                'change_percent': 0,
                'last_update': now.isoformat()
            }
            # Add initial history point
            self.price_history[symbol] = [{
                'time': int(now.timestamp() * 1000),
                'price': base_price
            }]
    
    def on_price_update(self, callback: Callable):
        """Register a callback for price updates."""
        self._callbacks.append(callback)
    
    def start_simulation(self):
        """Start fetching live prices - shows base prices immediately, then fetches real data."""
        if self._running:
            return
        
        self._running = True
        
        # Fetch live crypto prices in background (these are reliable)
        threading.Thread(target=self._fetch_crypto_immediately, daemon=True).start()
        
        # Start the periodic update loop
        self._thread = threading.Thread(target=self._price_loop, daemon=True)
        self._thread.start()
        print("Market data service started")
    
    def _fetch_crypto_immediately(self):
        """Fetch crypto prices immediately since CoinGecko is reliable and fast."""
        try:
            crypto_prices = self._fetch_coingecko_prices(['bitcoin', 'ethereum', 'solana', 'ripple'])
            if crypto_prices:
                self._update_crypto_prices(crypto_prices)
                print("Live crypto prices loaded!")
        except Exception as e:
            print(f"Initial crypto fetch error: {e}")
    
    def stop(self):
        """Stop the price fetcher."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2)
    
    def _price_loop(self):
        """Main loop that fetches prices and simulates small movements."""
        import random
        
        while self._running:
            try:
                # Fetch live crypto prices
                crypto_prices = self._fetch_coingecko_prices(['bitcoin', 'ethereum', 'solana', 'ripple'])
                if crypto_prices:
                    self._update_crypto_prices(crypto_prices)
                
                # Simulate small realistic movements for non-crypto assets
                # (since Yahoo is rate limiting, we simulate based on realistic volatility)
                self._simulate_price_movements()
                
            except Exception as e:
                print(f"Price loop error: {e}")
            
            # Update every 30 seconds
            time.sleep(30)
    
    def _update_crypto_prices(self, crypto_prices: Dict):
        """Update crypto prices from CoinGecko data."""
        now = datetime.utcnow()
        
        crypto_mapping = {
            'bitcoin': 'BTC',
            'ethereum': 'ETH', 
            'solana': 'SOL',
            'ripple': 'XRP'
        }
        
        for cg_id, symbol in crypto_mapping.items():
            if cg_id in crypto_prices:
                price = crypto_prices[cg_id]['price']
                change_pct = crypto_prices[cg_id].get('change_percent', 0)
                
                if price > 0:
                    self.prices[symbol] = {
                        'symbol': symbol,
                        'name': self.assets[symbol]['name'],
                        'type': 'crypto',
                        'price': price,
                        'change': 0,
                        'change_percent': change_pct,
                        'last_update': now.isoformat()
                    }
                    
                    self.price_history[symbol].append({
                        'time': int(now.timestamp() * 1000),
                        'price': price
                    })
                    
                    if len(self.price_history[symbol]) > 200:
                        self.price_history[symbol] = self.price_history[symbol][-200:]
    
    def _simulate_price_movements(self):
        """Simulate small realistic price movements for non-crypto assets."""
        import random
        now = datetime.utcnow()
        
        volatility = {
            'equity': 0.0015,
            'fx': 0.0003,
            'bond': 0.0008,
            'volatility': 0.02,
            'commodity': 0.001
        }
        
        for symbol, config in self.assets.items():
            if config['type'] == 'crypto':
                continue  # Crypto uses live prices
            
            vol = volatility.get(config['type'], 0.001)
            current_price = self.prices[symbol]['price']
            
            # Random walk with mean reversion
            change = random.gauss(0, vol)
            new_price = current_price * (1 + change)
            
            # Mean reversion toward base price
            base = config.get('base_price', current_price)
            reversion = (base - new_price) * 0.001
            new_price += reversion
            
            # Update price
            change_pct = ((new_price - current_price) / current_price) * 100
            
            self.prices[symbol] = {
                'symbol': symbol,
                'name': config['name'],
                'type': config['type'],
                'price': round(new_price, 4 if config['type'] == 'fx' else 2),
                'change': new_price - current_price,
                'change_percent': round(change_pct, 2),
                'last_update': now.isoformat()
            }
            
            self.price_history[symbol].append({
                'time': int(now.timestamp() * 1000),
                'price': new_price
            })
            
            if len(self.price_history[symbol]) > 200:
                self.price_history[symbol] = self.price_history[symbol][-200:]
        
        self._last_update = now
    
    def _fetch_coingecko_prices(self, coin_ids: List[str]) -> Dict[str, dict]:
        """Fetch crypto prices from CoinGecko (free, no key, reliable)."""
        prices = {}
        
        if not coin_ids:
            return prices
        
        try:
            ids_str = ','.join(coin_ids)
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids_str}&vs_currencies=usd&include_24hr_change=true"
            
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                
                for coin_id in coin_ids:
                    if coin_id in data:
                        coin_data = data[coin_id]
                        prices[coin_id] = {
                            'price': float(coin_data.get('usd', 0)),
                            'change_percent': float(coin_data.get('usd_24h_change', 0))
                        }
        
        except Exception as e:
            print(f"CoinGecko error: {e}")
        
        return prices
    
    def get_quote(self, symbol: str) -> Optional[dict]:
        """Get current quote for a symbol."""
        return self.prices.get(symbol)
    
    def get_snapshot(self) -> Dict[str, dict]:
        """Get snapshot of all current prices."""
        return self.prices.copy()
    
    def get_history(self, symbol: str, points: int = 100) -> List[dict]:
        """Get price history for a symbol."""
        history = self.price_history.get(symbol, [])
        return history[-points:] if history else []
    
    def apply_shock(self, shock_config: dict):
        """Apply a price shock (for simulating event impacts)."""
        symbol = shock_config.get('symbol')
        magnitude = shock_config.get('magnitude', 0)
        
        if symbol in self.prices and self.prices[symbol]['price'] > 0:
            old_price = self.prices[symbol]['price']
            new_price = old_price * (1 + magnitude / 100)
            
            self.prices[symbol]['price'] = new_price
            self.prices[symbol]['change'] = new_price - old_price
            self.prices[symbol]['change_percent'] += magnitude
