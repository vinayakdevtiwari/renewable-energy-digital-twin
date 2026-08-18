import React from 'react';
import { Sun, Zap, BatteryCharging, Leaf, IndianRupee, TrendingUp, TrendingDown, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { SolarData, DemandData, BatteryData, RenewableContributionData } from '../types/energy';

interface KPICardsProps {
  solar: SolarData;
  demand: DemandData;
  battery: BatteryData;
  renewable: RenewableContributionData;
}

export const KPICards: React.FC<KPICardsProps> = ({
  solar,
  demand,
  battery,
  renewable,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      
      {/* 1. Solar Generation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden backdrop-blur-sm hover:border-amber-500/40 transition group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Solar Generation</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition">
            <Sun className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {solar.currentGenerationkW.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-amber-400">kW</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center text-emerald-400 font-semibold">
            <TrendingUp className="h-3 w-3 mr-0.5" />
            +{solar.percentageChange}%
          </span>
          <span>Modeled: <strong className="text-slate-200">{solar.todayTotalkWh} kWh</strong></span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Cap: {solar.peakCapacitykW} kW</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-amber-500/30 text-amber-400 uppercase">
            SIMULATED
          </span>
        </div>
      </div>

      {/* 2. Energy Consumption */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden backdrop-blur-sm hover:border-cyan-500/40 transition group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Building Load</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
            <Zap className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {demand.currentDemandkW.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-cyan-400">kW</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center text-cyan-400 font-semibold">
            <TrendingDown className="h-3 w-3 mr-0.5" />
            {demand.percentageChange}%
          </span>
          <span>Modeled: <strong className="text-slate-200">{demand.todayTotalConsumptionkWh} kWh</strong></span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Site Total: {demand.totalSiteLoadkW.toFixed(2)} kW</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-cyan-500/30 text-cyan-400 uppercase">
            SIMULATED
          </span>
        </div>
      </div>

      {/* 3. Battery Storage */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden backdrop-blur-sm hover:border-emerald-500/40 transition group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Battery Storage</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
            <BatteryCharging className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {battery.socPercentage}%
          </span>
          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded uppercase ${
            battery.chargingState === 'charging'
              ? 'bg-emerald-500/20 text-emerald-400'
              : battery.chargingState === 'discharging'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {battery.chargingState === 'charging' ? `+${battery.currentPowerkW} kW` : battery.chargingState === 'discharging' ? `-${battery.currentPowerkW} kW` : 'Idle'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Capacity:</span>
          <span className="text-slate-200 font-semibold">{battery.availableCapacitykWh} / {battery.maxCapacitykWh} kWh</span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">{battery.operatingMode}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-emerald-500/30 text-emerald-400 uppercase">
            SIMULATED
          </span>
        </div>
      </div>

      {/* 4. Renewable Contribution */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden backdrop-blur-sm hover:border-emerald-500/40 transition group" title={renewable.assumptions}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Renewable Contribution</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
            <Leaf className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {renewable.renewablePercentage}%
          </span>
          <span className="text-xs font-semibold text-emerald-400">of site load</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${renewable.renewablePercentage}%` }}
          ></div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            {renewable.gridImportkW > 0 ? (
              <span className="text-amber-400 font-semibold flex items-center">
                <ArrowDownLeft className="h-3 w-3" /> Imp: {renewable.gridImportkW} kW
              </span>
            ) : renewable.gridExportkW > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3" /> Exp: {renewable.gridExportkW} kW
              </span>
            ) : (
              <span>Grid: 0 kW</span>
            )}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-emerald-500/30 text-emerald-400 uppercase">
            ESTIMATED
          </span>
        </div>
      </div>

      {/* 5. CO2 Reduction */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden backdrop-blur-sm hover:border-teal-500/40 transition group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Estimated CO₂ Avoided</span>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {renewable.co2AvoidedKg}
          </span>
          <span className="text-xs font-semibold text-teal-400">kg</span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Offset equiv:</span>
          <span className="text-slate-200 font-semibold">~{(renewable.co2AvoidedKg / 20).toFixed(1)} Trees</span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">0.82 kg/kWh</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-teal-500/30 text-teal-400 uppercase">
            ESTIMATED
          </span>
        </div>
      </div>

      {/* 6. Today's Cost Savings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden backdrop-blur-sm hover:border-indigo-500/40 transition group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Estimated Cost Savings</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
            <IndianRupee className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1 mb-1">
          <span className="text-xs font-semibold text-indigo-400">₹</span>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {renewable.todayCostSavingsINR.toFixed(2)}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Grid Tariff:</span>
          <span className="text-slate-200 font-semibold">₹ {renewable.gridTariffINRPerkWh.toFixed(2)}/kWh</span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Self-Consumption</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-indigo-500/30 text-indigo-400 uppercase">
            ESTIMATED
          </span>
        </div>
      </div>

    </div>
  );
};
