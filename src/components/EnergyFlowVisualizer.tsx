import React from 'react';
import { Sun, Building2, BatteryCharging, Car, Zap, Network, CheckCircle2 } from 'lucide-react';
import type { SolarData, DemandData, BatteryData, EVData, RenewableContributionData } from '../types/energy';

interface EnergyFlowVisualizerProps {
  solar: SolarData;
  demand: DemandData;
  battery: BatteryData;
  ev: EVData;
  renewable: RenewableContributionData;
}

export const EnergyFlowVisualizer: React.FC<EnergyFlowVisualizerProps> = ({
  solar,
  demand,
  battery,
  ev,
  renewable,
}) => {
  const solarkW = solar.currentGenerationkW;
  const buildingkW = demand.currentDemandkW;
  const evkW = ev.totalPowerkW;
  const totalLoadkW = demand.totalSiteLoadkW;

  const isCharging = battery.chargingState === 'charging';
  const isDischarging = battery.chargingState === 'discharging';
  const batteryRatekW = battery.currentPowerkW;

  const gridImportkW = renewable.gridImportkW;
  const gridExportkW = renewable.gridExportkW;

  // Power Balance Validation
  const powerIn = Math.round((solarkW + (isDischarging ? batteryRatekW : 0) + gridImportkW) * 100) / 100;
  const powerOut = Math.round((buildingkW + evkW + (isCharging ? batteryRatekW : 0) + gridExportkW) * 100) / 100;
  const isBalanced = Math.abs(powerIn - powerOut) <= 0.05;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl relative overflow-hidden backdrop-blur-md mb-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400 fill-amber-400/20" />
              Simulated Energy Flow & Power Balance
            </h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
              isBalanced ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {isBalanced ? 'POWER BALANCE VERIFIED (IN == OUT ±0.05 kW)' : 'POWER BALANCE CHECK FAILED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict physical power conservation (Power IN = Power OUT): Generation + Battery Discharge + Grid Import = Building Load + EV Load + Battery Charge + Grid Export
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
            <span className="text-slate-300">Solar ({solarkW.toFixed(2)} kW)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
            <span className="text-slate-300">Site Load ({totalLoadkW.toFixed(2)} kW)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span className="text-slate-300">Battery ({isCharging ? `+${batteryRatekW}` : isDischarging ? `-${batteryRatekW}` : '0'} kW)</span>
          </div>
        </div>
      </div>

      {/* Main Flow Diagram */}
      <div className="relative w-full overflow-x-auto py-2">
        <div className="min-w-[700px] flex items-center justify-between gap-6 px-4 py-8 relative">
          
          {/* Left Column: Generation Sources & Grid Import */}
          <div className="flex flex-col space-y-4 z-10 w-52">
            
            {/* Solar Generation Node */}
            <div className="rounded-xl border border-amber-500/40 bg-slate-950 p-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Sun className="h-5 w-5 animate-spin-slow" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Solar Array</div>
                  <div className="text-[10px] text-amber-400 font-semibold">Clean Supply</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-amber-400">{solarkW.toFixed(2)} kW</div>
                <div className="text-[9px] text-slate-500">Generating</div>
              </div>
            </div>

            {/* Battery Discharge Source (if discharging) */}
            {isDischarging && (
              <div className="rounded-xl border border-amber-500/40 bg-slate-950 p-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <BatteryCharging className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Battery Discharging</div>
                    <div className="text-[10px] text-amber-400 font-semibold">{battery.socPercentage}% SoC</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-amber-400">+{batteryRatekW.toFixed(2)} kW</div>
                  <div className="text-[9px] text-slate-500">Supply</div>
                </div>
              </div>
            )}

            {/* Grid Import Node (if importing) */}
            <div className={`rounded-xl border p-3 flex items-center justify-between shadow-lg transition ${
              gridImportkW > 0 ? 'border-indigo-500/50 bg-slate-950' : 'border-slate-800 bg-slate-950/60 opacity-60'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Utility Grid</div>
                  <div className="text-[10px] text-slate-400">
                    {gridImportkW > 0 ? 'Importing Power' : gridExportkW > 0 ? 'Exporting Surplus' : 'Grid In-Sync'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-black ${gridImportkW > 0 ? 'text-amber-400' : gridExportkW > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {gridImportkW > 0 ? `+${gridImportkW.toFixed(2)} kW` : gridExportkW > 0 ? `-${gridExportkW.toFixed(2)} kW` : '0.0 kW'}
                </div>
                <div className="text-[9px] text-slate-500">
                  {gridImportkW > 0 ? 'Buying' : gridExportkW > 0 ? 'Selling' : 'Balanced'}
                </div>
              </div>
            </div>

          </div>

          {/* Central Bus & Flow Lines */}
          <div className="flex-1 relative h-36 flex items-center justify-center">
            
            {/* SVG Cable Lines */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              
              {/* Cable: Solar -> Central Hub */}
              <line x1="0" y1="25%" x2="50%" y2="50%" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 6" className="opacity-40" />
              {solarkW > 0.1 && (
                <circle r="4" fill="#fbbf24">
                  <animateMotion path="M 0,35 L 250,70" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Cable: Grid -> Central Hub */}
              <line x1="0" y1="75%" x2="50%" y2="50%" stroke="#818cf8" strokeWidth="3" strokeDasharray="6 6" className="opacity-40" />
              {gridImportkW > 0.1 && (
                <circle r="4" fill="#a5b4fc">
                  <animateMotion path="M 0,105 L 250,70" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Cable: Central Hub -> Building */}
              <line x1="50%" y1="50%" x2="100%" y2="20%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 6" className="opacity-40" />
              {buildingkW > 0.1 && (
                <circle r="4" fill="#22d3ee">
                  <animateMotion path="M 250,70 L 500,25" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Cable: Central Hub -> Battery */}
              <line x1="50%" y1="50%" x2="100%" y2="50%" stroke="#10b981" strokeWidth="3" strokeDasharray="6 6" className="opacity-40" />
              {isCharging && (
                <circle r="4" fill="#34d399">
                  <animateMotion path="M 250,70 L 500,70" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Cable: Central Hub -> EV */}
              <line x1="50%" y1="50%" x2="100%" y2="80%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 6" className="opacity-40" />
              {evkW > 0.1 && (
                <circle r="4" fill="#c084fc">
                  <animateMotion path="M 250,70 L 500,115" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
            </svg>

            {/* Central EMS Microgrid Controller Hub */}
            <div className="relative z-10 group">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-40 blur animate-pulse"></div>
              <div className="relative h-24 w-24 rounded-full bg-slate-950 border-2 border-emerald-400 p-2 flex flex-col items-center justify-center text-center shadow-2xl">
                <Zap className="h-6 w-6 text-emerald-400 fill-emerald-400/20" />
                <span className="text-[9px] font-bold text-white uppercase mt-0.5">EMS BUS</span>
                <span className="text-[8px] text-emerald-400 font-extrabold">{powerIn.toFixed(2)} kW</span>
              </div>
            </div>

          </div>

          {/* Right Column: Loads & Battery Storage / Export */}
          <div className="flex flex-col space-y-3 z-10 w-52">
            
            {/* Building Load Node */}
            <div className="rounded-xl border border-cyan-500/40 bg-slate-950 p-2.5 flex items-center justify-between hover:border-cyan-500 transition">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Building Load</div>
                  <div className="text-[10px] text-slate-400">HVAC & Power</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-extrabold text-cyan-400">{buildingkW.toFixed(2)} kW</div>
                <div className="text-[9px] text-slate-500">Active</div>
              </div>
            </div>

            {/* Battery Charge Node (if charging) */}
            <div className={`rounded-xl border p-2.5 flex items-center justify-between transition ${
              isCharging ? 'border-emerald-500/50 bg-slate-950' : 'border-slate-800 bg-slate-950/60 opacity-60'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <BatteryCharging className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Battery Storage</div>
                  <div className="text-[10px] text-slate-400">{battery.socPercentage}% SoC</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-extrabold ${isCharging ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isCharging ? `+${batteryRatekW.toFixed(2)} kW` : 'Idle'}
                </div>
                <div className="text-[9px] text-slate-500 capitalize">{battery.chargingState}</div>
              </div>
            </div>

            {/* EV Charging Load Node */}
            <div className="rounded-xl border border-purple-500/40 bg-slate-950 p-2.5 flex items-center justify-between hover:border-purple-500 transition">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Car className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">EV Station</div>
                  <div className="text-[10px] text-slate-400">{ev.occupiedStations}/{ev.totalStations} Bays Active</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-extrabold text-purple-400">{evkW.toFixed(2)} kW</div>
                <div className="text-[9px] text-slate-500">Charging</div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Exact Mathematical Conservation Proof Verification Box */}
      <div className="mt-3 rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-white">Power Conservation Check:</span>
          <span className="text-slate-300 font-mono">
            Power IN ({powerIn.toFixed(2)} kW) == Power OUT ({powerOut.toFixed(2)} kW)
          </span>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <span className="text-slate-400">
            Renewable Contribution: <strong className="text-emerald-400 font-bold">{renewable.renewablePercentage}%</strong>
          </span>
          <span className="text-slate-400">
            Grid Import: <strong className="text-amber-400 font-bold">{gridImportkW.toFixed(2)} kW</strong>
          </span>
        </div>
      </div>

    </div>
  );
};
