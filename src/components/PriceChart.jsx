import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

export default function PriceChart({ symbol, height = '100%' }) {
  const { priceHistory, activeEvents } = useStore();
  const chartRef = useRef(null);

  const history = priceHistory[symbol] || [];

  // Find event markers
  const eventMarkers = activeEvents
    .filter(e => e.releasedAt)
    .map(e => ({
      time: new Date(e.releasedAt).getTime(),
      label: e.indicator
    }));

  const data = {
    labels: history.map(h => h.time),
    datasets: [
      {
        label: symbol,
        data: history.map(h => h.price),
        borderColor: '#00ff88',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1a1a25',
        borderColor: '#32324a',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => {
            const date = new Date(items[0].label);
            return date.toLocaleTimeString();
          },
          label: (item) => {
            return `${symbol}: ${item.raw?.toFixed(symbol.includes('/') ? 4 : 2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          }
        },
        grid: {
          color: 'rgba(50, 50, 74, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#71717a',
          maxTicksLimit: 6
        }
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(50, 50, 74, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#71717a',
          callback: (value) => {
            return value.toFixed(symbol.includes('/') ? 4 : 2);
          }
        }
      }
    },
    animation: {
      duration: 0
    }
  };

  if (history.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Waiting for price data...
      </div>
    );
  }

  return (
    <div style={{ height }} className="chart-container">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
