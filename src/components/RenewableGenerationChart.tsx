import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Sun, Sparkles } from 'lucide-react';
import type { SolarData } from '../types/energy';

interface RenewableGenerationChartProps {
  solar: SolarData;
}

type Timespan = '6h' | '24h' | '7d';

export const RenewableGenerationChart: React.FC<RenewableGenerationChartProps> = ({ solar }) => {
  const [timespan, setTimespan] = useState<Timespan>('24h');

  // Generate dataset based on chosen timespan
  const generateChartData = () => {
    const currentGen = solar.currentGenerationkW;
    const data = [];

    if (timespan === '6h') {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600 * 1000);
        const hourLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const factor = Math.max(0.1, 1 - Math.abs(i - 2) * 0.2);
        const actual = Math.max(0, Math.round(currentGen * factor * 100) / 100);
        const predicted = Math.max(0, Math.round((actual * 1.06 + 0.1) * 100) / 100);
        data.push({ time: hourLabel, actual, predicted });
      }
    } else if (timespan === '24h') {
      for (let i = 0; i < 24; i += 2) {
        const hour = i;
        const hourLabel = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
        let solarCurve = 0;
        if (hour >= 6 && hour <= 18) {
          solarCurve = solar.peakCapacitykW * Math.sin(((hour - 6) / 12) * Math.PI);
        }
        const actual = Math.max(0, Math.round(solarCurve * 0.85 * 100) / 100);
        const predicted = Math.max(0, Math.round(solarCurve * 100) / 100);
        data.push({ time: hourLabel, actual, predicted });
      }
    } else {
      // 7 days projection
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 0; i < 7; i++) {
        const actual = Math.round((28 + Math.sin(i) * 8) * 10) / 10;
        const predicted = Math.round((30 + Math.sin(i) * 6) * 10) / 10;
        data.push({ time: days[i], actual, predicted });
      }
    }

    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
      
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-400" />
              Renewable Generation: Simulated vs Baseline Prediction
            </h2>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              SIMULATED YIELD MODEL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparing solar physics simulation against baseline predicted yield curves
          </p>
        </div>

        {/* Timespan selector buttons */}
        <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setTimespan('6h')}
            className={`px-3 py-1 rounded-md transition ${
              timespan === '6h' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            6-Hour Model View
          </button>
          <button
            onClick={() => setTimespan('24h')}
            className={`px-3 py-1 rounded-md transition ${
              timespan === '24h' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24-Hour Model View
          </button>
          <button
            onClick={() => setTimespan('7d')}
            className={`px-3 py-1 rounded-md transition ${
              timespan === '7d' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7-Day Model Projection
          </button>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit={timespan === '7d' ? ' kWh' : ' kW'} />
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(val: any) => [`${val ?? 0} ${timespan === '7d' ? 'kWh' : 'kW'}`, '']}
            />
            
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              iconType="circle"
            />

            <Area
              type="monotone"
              dataKey="actual"
              name="Simulated Generation"
              stroke="#f59e0b"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActual)"
            />

            <Area
              type="monotone"
              dataKey="predicted"
              name="Baseline Predicted Generation"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorPredicted)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Physics Simulation Model: <strong className="text-slate-200">Diurnal Curve + Open-Meteo Irradiance Attenuation</strong></span>
        </div>
        <span className="text-[10px] text-slate-500">Updated every refresh cycle</span>
      </div>

    </div>
  );
};
