import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { SolarData, DemandData, BatteryData } from '../types/energy';

interface DemandVsGenerationChartProps {
  solar: SolarData;
  demand: DemandData;
  battery: BatteryData;
}

export const DemandVsGenerationChart: React.FC<DemandVsGenerationChartProps> = ({
  solar,
  demand,
}) => {
  const currentSolar = solar.currentGenerationkW;
  const currentDemand = demand.currentDemandkW;
  const isSurplus = currentSolar >= currentDemand;
  const deltakW = Math.abs(currentSolar - currentDemand);

  // Generate 12 data points representing recent 24-hour balance
  const generateBalanceData = () => {
    const data = [];
    for (let i = 0; i < 24; i += 2) {
      const hour = i;
      const hourLabel = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

      let gen = 0;
      if (hour >= 6 && hour <= 18) {
        gen = solar.peakCapacitykW * Math.sin(((hour - 6) / 12) * Math.PI);
      }
      gen = Math.max(0, Math.round(gen * 0.85 * 100) / 100);

      let dem = 2.2;
      if ((hour >= 8 && hour <= 11) || (hour >= 18 && hour <= 21)) dem = 4.2;
      else if (hour >= 0 && hour <= 5) dem = 1.3;
      dem = Math.round(dem * 100) / 100;

      // Battery action
      let battPower = 0;
      if (gen > dem) battPower = Math.min(gen - dem, 3.5); // positive = charging
      else if (dem > gen) battPower = -Math.min(dem - gen, 3.5); // negative = discharging

      const surplus = gen > dem ? Math.round((gen - dem) * 100) / 100 : 0;
      const deficit = dem > gen ? Math.round((dem - gen) * 100) / 100 : 0;

      data.push({
        time: hourLabel,
        generation: gen,
        demand: dem,
        batteryPower: Math.round(battPower * 100) / 100,
        surplus,
        deficit,
      });
    }
    return data;
  };

  const chartData = generateBalanceData();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
      
      {/* Header & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Energy Demand vs Generation & Power Balance
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time surplus/deficit visualization and battery storage compensation
          </p>
        </div>

        {/* Dynamic Surplus / Deficit Badge */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
          isSurplus
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          {isSurplus ? (
            <>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              <span>SURPLUS: +{deltakW.toFixed(2)} kW (Charging Battery)</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="h-4 w-4 text-amber-400" />
              <span>DEFICIT: -{deltakW.toFixed(2)} kW (Discharging Battery)</span>
            </>
          )}
        </div>
      </div>

      {/* Visual Explanation Key */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-4 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-1.5">
          <span className="h-3 w-3 rounded bg-amber-400 inline-block"></span>
          <span className="text-slate-300 font-medium">Solar Generation (kW)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="h-3 w-3 rounded bg-cyan-400 inline-block"></span>
          <span className="text-slate-300 font-medium">Building Demand (kW)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="h-3 w-3 rounded bg-emerald-500/60 inline-block"></span>
          <span className="text-slate-300 font-medium">Surplus Zone (Green)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="h-3 w-3 rounded bg-amber-500/60 inline-block"></span>
          <span className="text-slate-300 font-medium">Deficit Zone (Amber)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" kW" />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(val: any) => [`${val ?? 0} kW`, '']}
            />

            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

            <Bar dataKey="surplus" name="Surplus Energy (kW)" fill="#10b981" opacity={0.6} />
            <Bar dataKey="deficit" name="Deficit Energy (kW)" fill="#f59e0b" opacity={0.6} />

            <Line
              type="monotone"
              dataKey="generation"
              name="Solar Generation"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={{ r: 4, fill: '#fbbf24' }}
            />

            <Line
              type="monotone"
              dataKey="demand"
              name="Building Demand"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{ r: 4, fill: '#22d3ee' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
