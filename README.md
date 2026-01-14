# Macro Impact Tracker

A real-time web application that monitors how macroeconomic events (CPI, NFP, FOMC, GDP, etc.) immediately impact financial markets across multiple asset classes.

## Features

- **Real-time market monitoring** across 14+ assets (equities, FX, bonds, commodities, volatility)
- **Live event tracking** for scheduled economic releases
- **Impact analysis** measuring market reactions at 1, 5, 15, 30, and 60 minute intervals
- **Interactive dashboards** with price charts and market tickers
- **Economic calendar** with upcoming events through 2027

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Chart.js, Zustand, Socket.io-client

**Backend:** Node.js, Express, Socket.io

## Getting Started

```bash
# Install dependencies
npm install

# Run the application (starts both server and client)
npm run dev
```

The app runs on `http://localhost:5173` with the backend on port `3001`.

## Demo

### Dashboard View
![Dashboard](screenshots/Screenshot%202026-01-13%20at%209.46.45%20PM.png)

### Market Impact Analysis
![Impact Analysis](screenshots/Screenshot%202026-01-13%20at%209.46.59%20PM.png)

### Economic Calendar
![Calendar View](screenshots/Screenshot%202026-01-13%20at%209.47.13%20PM.png)

## Asset Classes Tracked

| Category | Assets |
|----------|--------|
| Equities | SPY, QQQ, IWM, DIA |
| Forex | EUR/USD, GBP/USD, USD/JPY, DXY |
| Bonds | TLT, IEF, HYG |
| Volatility | VIX, VVIX |
| Commodities | GLD, USO |

## Economic Indicators

CPI, NFP, PMI, FOMC, GDP, PPI, PCE, Retail Sales, Jobless Claims
