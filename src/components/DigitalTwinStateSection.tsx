import React from 'react';
import { Cpu, Sun, Building2, BatteryCharging, Car, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import type { SolarData, DemandData, BatteryData, EVData, RenewableContributionData } from '../types/energy';

interface DigitalTwinStateSectionProps {
  solar: SolarData;
  demand: DemandData;
  battery: BatteryData;
  ev: EVData;
  renewable: RenewableContributionData;
}

export const DigitalTwinStateSection: React.FC<DigitalTwinStateSectionProps> = ({
  solar,
  demand,
  battery,
  ev,
  renewable,
}) => {
  const twinNodes = [
    {
      id: 'solar',
      name: '☀ SOLAR GENERATION',
      value: `${solar.currentGenerationkW.toFixed(2)} kW`,
      status: solar.currentGenerationkW > 0 ? 'ACTIVE GENERATION' : 'NIGHTTIME IDLE',
      trend: `+${solar.percentageChange}% vs baseline`,
      trendIcon: TrendingUp,
      trendColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      icon: Sun,
      iconColor: 'text-amber-400 bg-amber-500/10',
      subtext: `Peak Capacity: ${solar.peakCapacitykW} kW`,
    },
    {
      id: 'building',
      name: '🏢 BUILDING LOAD',
      value: `${demand.currentDemandkW.toFixed(2)} kW`,
      status: 'ACTIVE OCCUPANCY',
      trend: `${demand.percentageChange}% load variance`,
      trendIcon: TrendingDown,
      trendColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      icon: Building2,
      iconColor: 'text-cyan-400 bg-cyan-500/10',
      subtext: `Site Total: ${demand.totalSiteLoadkW.toFixed(2)} kW`,
    },
    {
      id: 'battery',
      name: '🔋 BESS STORAGE',
      value: `${battery.socPercentage}% SoC`,
      status: battery.chargingState === 'charging' ? `CHARGING (+${battery.currentPowerkW} kW)` : battery.chargingState === 'discharging' ? `DISCHARGING (-${battery.currentPowerkW} kW)` : 'STORAGE IDLE',
      trend: `${battery.availableCapacitykWh} / ${battery.maxCapacitykWh} kWh`,
      trendIcon: BatteryCharging,
      trendColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      icon: BatteryCharging,
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      subtext: `Health: ${battery.healthPercentage}% | ${battery.operatingMode}`,
    },
    {
      id: 'ev',
      name: '🚗 EV CHARGING HUB',
      value: `${ev.totalPowerkW.toFixed(2)} kW`,
      status: `${ev.occupiedStations}/${ev.totalStations} BAYS ACTIVE`,
      trend: `Delivered ${ev.todayEnergyDeliveredkWh} kWh`,
      trendIcon: Car,
      trendColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
      icon: Car,
      iconColor: 'text-indigo-400 bg-indigo-500/10',
      subtext: '4 Simulated Bays Connected',
    },
    {
      id: 'grid',
      name: '⚡ UTILITY GRID INTERFACE',
      value: renewable.gridImportkW > 0 ? `${renewable.gridImportkW.toFixed(2)} kW Imp` : renewable.gridExportkW > 0 ? `${renewable.gridExportkW.toFixed(2)} kW Exp` : '0.0 kW',
      status: renewable.gridImportkW > 0 ? 'BUYING GRID POWER' : renewable.gridExportkW > 0 ? 'EXPORTING SURPLUS' : 'IN-SYNC BALANCE',
      trend: `Tariff: ₹${renewable.gridTariffINRPerkWh}/kWh`,
      trendIcon: Zap,
      trendColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      icon: Zap,
      iconColor: 'text-cyan-400 bg-cyan-500/10',
      subtext: `Renewable Share: ${renewable.renewablePercentage}%`,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md mb-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">DIGITAL TWIN — CURRENT SYSTEM STATE</h2>
            <p className="text-xs text-slate-400">Real-time software replica of synchronized microgrid asset states</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 uppercase">
          PHYSICS SIMULATION MODEL
        </span>
      </div>

      {/* Grid of Digital Twin Asset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {twinNodes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              className={`rounded-xl border ${node.borderColor} bg-slate-950 p-3.5 flex flex-col justify-between hover:border-slate-700 transition`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{node.name}</span>
                  <span className="text-[8px] font-bold px-1 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
                    SIMULATED
                  </span>
                </div>

                <div className="flex items-center space-x-2.5 mb-2">
                  <div className={`p-2 rounded-lg ${node.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white leading-none">{node.value}</div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{node.status}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">{node.subtext}</span>
                <span className={`font-bold ${node.trendColor}`}>{node.trend}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
