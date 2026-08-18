import React from 'react';
import { LineChart, Sparkles, Sun, Zap, CloudSun } from 'lucide-react';
import type { ForecastItem } from '../types/energy';

interface Forecast24hSectionProps {
  forecast24h: ForecastItem[];
}

export const Forecast24hSection: React.FC<Forecast24hSectionProps> = ({ forecast24h }) => {
  // Dynamically compute key milestone highlights from the actual forecast array
  const peakSolarItem = [...forecast24h].sort((a, b) => b.solarGenerationkW - a.solarGenerationkW)[0] || forecast24h[0];
  const peakDemandItem = [...forecast24h].sort((a, b) => b.energyDemandkW - a.energyDemandkW)[0] || forecast24h[0];
  const rampUpItem = forecast24h.find(item => item.solarGenerationkW >= 1.0) || forecast24h[0];
  const peakSolarIndex = forecast24h.findIndex(item => item.hourLabel === peakSolarItem?.hourLabel);
  const declineItem = forecast24h.slice(peakSolarIndex > 0 ? peakSolarIndex : 0).find(item => item.solarGenerationkW <= 1.5) || forecast24h[forecast24h.length - 1];

  const milestones = [
    {
      time: rampUpItem ? rampUpItem.hourLabel : '07:00 AM',
      title: 'Solar Ramp Up',
      desc: `Generation reaches ${rampUpItem ? rampUpItem.solarGenerationkW : 1.2} kW. Storage charging active.`,
      icon: Sun,
      color: 'text-amber-400',
    },
    {
      time: peakSolarItem ? peakSolarItem.hourLabel : '12:00 PM',
      title: 'Peak Solar Yield',
      desc: `Max generation (${peakSolarItem ? peakSolarItem.solarGenerationkW : 6.5} kW). Excess power redirected.`,
      icon: Sparkles,
      color: 'text-emerald-400',
    },
    {
      time: declineItem ? declineItem.hourLabel : '05:00 PM',
      title: 'Solar Decline',
      desc: `Solar lowers to ${declineItem ? declineItem.solarGenerationkW : 1.1} kW. Battery supports building load.`,
      icon: CloudSun,
      color: 'text-cyan-400',
    },
    {
      time: peakDemandItem ? peakDemandItem.hourLabel : '08:00 PM',
      title: 'Peak Demand Spike',
      desc: `Peak site load (${peakDemandItem ? peakDemandItem.energyDemandkW : 4.4} kW). Discharge avoids peak grid fees.`,
      icon: Zap,
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Next 24 Hours — Physics-Informed Baseline Forecast</h2>
            <p className="text-xs text-slate-400">Baseline forecast synthesizing live Open-Meteo weather parameters & microgrid physics</p>
          </div>
        </div>

        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
          PHYSICS-INFORMED MODEL
        </span>
      </div>

      {/* Dynamic Key Milestones Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {milestones.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-start space-x-3 hover:border-slate-700 transition">
              <div className={`p-2 rounded-lg bg-slate-900 ${m.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-white">{m.time}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Forecast Milestone</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">{m.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-tight">{m.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Timeline Cards */}
      <div className="mb-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">24-Hour Forecast Timeline</h3>
        <div className="flex space-x-3 overflow-x-auto pb-3 scrollbar-thin">
          {forecast24h.map((item, index) => (
            <div
              key={index}
              className={`min-w-[130px] rounded-xl border p-3 flex flex-col justify-between transition ${
                item.isSurplus
                  ? 'bg-slate-950 border-emerald-500/30 hover:border-emerald-500/60'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold text-white">{item.hourLabel}</span>
                <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                  item.isSurplus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.isSurplus ? 'Surplus' : 'Deficit'}
                </span>
              </div>

              {/* Metrics */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Solar:</span>
                  <span className="font-bold text-amber-400">{item.solarGenerationkW} kW</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Demand:</span>
                  <span className="font-bold text-cyan-400">{item.energyDemandkW} kW</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Battery SoC:</span>
                  <span className="font-bold text-emerald-400">{item.batterySoc}%</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>Renewable:</span>
                <span className="font-semibold text-slate-300">{item.renewableAvailabilityPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
