import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        family: "'Inter', sans-serif"
      },
      bodyFont: {
        size: 13,
        family: "'Inter', sans-serif"
      },
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
          size: 12
        },
        color: '#8c8c8c'
      }
    },
    y: {
      grid: {
        borderDash: [4, 4],
        color: '#f0f0f0'
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
          size: 12
        },
        color: '#8c8c8c',
        callback: function(value: any) {
             if (value >= 1000) {
                 return '$' + value / 1000 + 'k';
             }
             return '$' + value;
         }
      },
      border: {
          display: false
      }
    },
  },
};

const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Sales',
      data: [350, 450, 600, 300, 800, 400, 500],
      backgroundColor: '#1677ff',
      borderRadius: 4,
      barThickness: 16,
    },
  ],
};

export default function SalesChart() {
  return (
    <div style={{ height: '300px', width: '100%', padding: '16px 0' }}>
      <Bar options={options} data={data} />
    </div>
  );
}
