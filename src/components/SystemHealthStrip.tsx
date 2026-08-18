import React from 'react';
import { Activity, ShieldCheck, Sun, BatteryCharging, Zap, Play } from 'lucide-react';
import type { DemoScenarioId } from '../types/energy';

interface SystemHealthStripProps {
  renewablePercentage: number;
  gridImportkW: number;
  batterySoc: number;
  solarGenkW: number;
  isApiOffline: boolean;
  isDemoMode: boolean;
  currentScenario: DemoScenarioId;
  onScenarioChange: (scenario: DemoScenarioId) => void;
}

export const SystemHealthStrip: React.FC<SystemHealthStripProps> = ({
  renewablePercentage,
  gridImportkW,
  batterySoc,
  solarGenkW,
  isApiOffline,
  isDemoMode,
  currentScenario,
  onScenarioChange,
}) => {
  const forecastLabel = currentScenario === 'CLOUD_SPIKE'
    ? 'DECLINING (CLOUD EVENT)'
    : currentScenario === 'DEMAND_SURGE'
    ? 'STRESSED (HIGH DEMAND)'
    : currentScenario === 'EV_INFLUX'
    ? 'ELEVATED LOAD'
    : solarGenkW > 3 ? 'POSITIVE (SOLAR PEAK)' : solarGenkW > 0.5 ? 'STABLE' : 'FLAT (LOW SOLAR)';
  const scenarios: { id: DemoScenarioId; label: string; desc: string }[] = [
    { id: 'NORMAL', label: '1. Optimal Baseline', desc: 'Standard diurnal solar yield' },
    { id: 'CLOUD_SPIKE', label: '2. Cloud Cover Spike', desc: 'Solar output drops 65%' },
    { id: 'DEMAND_SURGE', label: '3. Demand Peak Surge', desc: 'Building load spikes to 6.2 kW' },
    { id: 'EV_INFLUX', label: '4. EV Fleet Influx', desc: 'All 4 EV bays charging at 13.2 kW' },
  ];

  return (
    <div className="mb-6 space-y-3">
      {/* Primary Health & Status Strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        
        {/* Item 1: System Status */}
        <div className="flex items-center space-x-2">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">System Status:</span>
          <span className="font-extrabold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            {isApiOffline ? 'DEGRADED (OFFLINE)' : 'ONLINE / OPTIMAL'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

        {/* Item 2: Renewable Coverage */}
        <div className="flex items-center space-x-2">
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Renewable Coverage:</span>
          <span className="font-extrabold text-amber-400">{renewablePercentage}%</span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

        {/* Item 3: Grid Dependency */}
        <div className="flex items-center space-x-2">
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Grid Dependency:</span>
          <span className={`font-extrabold ${gridImportkW > 2.0 ? 'text-amber-400' : gridImportkW > 0 ? 'text-cyan-400' : 'text-emerald-400'}`}>
            {gridImportkW > 2.0 ? 'HIGH' : gridImportkW > 0 ? 'LOW' : 'ZERO (SELF-POWERED)'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

        {/* Item 4: Battery Storage */}
        <div className="flex items-center space-x-2">
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Battery Reserve:</span>
          <span className="font-extrabold text-emerald-400">{batterySoc}%</span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

        {/* Item 5: Forecast Trajectory */}
        <div className="flex items-center space-x-2">
          <Activity className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Forecast Trajectory:</span>
          <span className="font-extrabold text-indigo-300">{forecastLabel}</span>
        </div>

      </div>

      {/* Interactive Hackathon Presentation Demo Scenarios Bar */}
      {isDemoMode && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Play className="h-4 w-4 text-amber-400 fill-current animate-pulse" />
            <div>
              <span className="font-bold text-amber-300">HACKATHON DEMO MODE SCENARIO SWITCHER</span>
              <p className="text-[11px] text-amber-200/70">Select a deterministic demonstration scenario — all resulting metrics are simulated (not live sensor data)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onScenarioChange(sc.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center space-x-1.5 ${
                  currentScenario === sc.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
                title={sc.desc}
              >
                <span>{sc.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
