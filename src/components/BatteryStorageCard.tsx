import React from 'react';
import { BatteryCharging, Thermometer, Clock } from 'lucide-react';
import type { BatteryData } from '../types/energy';

interface BatteryStorageCardProps {
  battery: BatteryData;
}

export const BatteryStorageCard: React.FC<BatteryStorageCardProps> = ({ battery }) => {
  const isCharging = battery.chargingState === 'charging';
  const isDischarging = battery.chargingState === 'discharging';

  const formatMinutes = (mins: number) => {
    if (mins <= 0) return 'Fully charged';
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hrs === 0) return `${rem}m`;
    return `${hrs}h ${rem}m`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <BatteryCharging className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">BESS — Simulated Energy Storage Model</h2>
            <p className="text-xs text-slate-400">15 kWh reference system model (Simulated)</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-emerald-500/30 text-emerald-400">
          HEALTH: {battery.healthPercentage}% (Simulated)
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SoC Progress Ring / Visual Gauge */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col items-center justify-center text-center">
          <div className="relative h-32 w-32 flex items-center justify-center mb-2">
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${isCharging ? 'text-emerald-400' : isDischarging ? 'text-amber-400' : 'text-cyan-400'} transition-all duration-700`}
                strokeDasharray={`${battery.socPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">{battery.socPercentage}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Simulated SoC</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 font-semibold">
            {battery.availableCapacitykWh} kWh / {battery.maxCapacitykWh} kWh (Reference)
          </div>
        </div>

        {/* Operating Status Parameters */}
        <div className="space-y-3 md:col-span-2 flex flex-col justify-center">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="text-xs text-slate-400 mb-1">Simulated Transfer Rate</div>
              <div className={`text-lg font-extrabold ${isCharging ? 'text-emerald-400' : isDischarging ? 'text-amber-400' : 'text-slate-300'}`}>
                {isCharging ? `+${battery.currentPowerkW} kW` : isDischarging ? `-${battery.currentPowerkW} kW` : '0.0 kW'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{battery.chargingState} Mode</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>Est. Time {isCharging ? 'to Full' : 'Remaining'}</span>
              </div>
              <div className="text-lg font-extrabold text-white">
                {formatMinutes(battery.timeToFullOrEmptyMinutes)}
              </div>
              <div className="text-[10px] text-slate-500">Based on simulated load</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-300 font-medium">Cell Temperature:</span>
              <span className="text-white font-bold">{battery.temperatureC}°C (Simulated)</span>
            </div>
            <span className="text-[10px] text-slate-500">Operating Mode: <strong className="text-emerald-400">{battery.operatingMode}</strong></span>
          </div>

        </div>

      </div>

    </div>
  );
};
