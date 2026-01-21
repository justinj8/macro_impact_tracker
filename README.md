# Macro Impact Tracker

A real-time Streamlit dashboard that monitors and analyzes how major economic data releases (like CPI, NFP, and FOMC decisions) immediately impact prices across equities, forex, bonds, commodities, crypto, and volatility indices.

## Features

- **Real-time market monitoring** across 20 assets (equities, FX, bonds, commodities, crypto, volatility)
- **Economic event tracking** for scheduled economic releases
- **Impact analysis** measuring market reactions at 1, 5, 15, 30, and 60 minute intervals
- **Interactive Streamlit dashboard** with Plotly charts
- **Economic calendar** with upcoming events through 2026

## Getting Started

### Prerequisites
- Python 3.9 or higher

### Installation

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Application

```bash
streamlit run streamlit_app.py
```

The app runs on `http://localhost:8501`

## Demo

### Dashboard View
![Dashboard](screenshots/dashboard-main.png)

### Market Impact Analysis
![Impact Analysis](screenshots/impact-analysis.png)

### Economic Calendar
![Calendar View](screenshots/calendar-view.png)

## Asset Classes Tracked

| Category | Assets |
|----------|--------|
| Equities | SPY, QQQ, IWM, DIA |
| Forex | EUR/USD, GBP/USD, USD/JPY, DXY |
| Bonds | TLT, IEF, HYG |
| Volatility | VIX, VVIX |
| Commodities | GLD, USO |
| **Crypto** | **BTC, ETH, SOL, XRP** |

## Economic Indicators

- CPI, NFP, PMI, FOMC, GDP, PPI, PCE
- Retail Sales, Jobless Claims

## Project Structure

```
macro_impact_tracker/
├── streamlit_app.py          # Main Streamlit application
├── requirements.txt          # Python dependencies
└── services/
    ├── market_data.py        # Market data simulation
    ├── macro_data.py         # Economic indicators
    ├── event_scheduler.py    # Event calendar
    └── impact_analyzer.py    # Impact analysis
```

## Technologies

- **Frontend**: Streamlit, Plotly
- **Backend**: Python, Pandas
- **Data**: Real-time price simulation
