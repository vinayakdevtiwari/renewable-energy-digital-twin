import React from 'react';
import { Network, Cloud, Cpu, Zap, LineChart, Brain, Server } from 'lucide-react';

export const SystemExplanationPanel: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Live Environmental Ingestion',
      desc: 'Fetches real-time temperature, cloud cover, wind speed, and solar irradiance (W/m²) directly via Open-Meteo REST API.',
      icon: Cloud,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      badge: 'LIVE API DATA',
      badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      num: '02',
      title: 'Digital Twin Physics Conversion',
      desc: 'Translates live environmental inputs into simulated diurnal solar generation profiles and occupancy building load dynamics.',
      icon: Cpu,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      badge: 'SIMULATED MODEL',
      badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      num: '03',
      title: 'Microgrid Energy Balance Bus',
      desc: 'Enforces strict Kirchhoff power conservation (Power IN == Power OUT) across solar, building, BESS storage, EV charging, and grid exchange.',
      icon: Zap,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      badge: 'POWER CONSERVATION',
      badgeStyle: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      num: '04',
      title: '24-Hour Predictive Forecasting',
      desc: 'Synthesizes next 24 hours of hourly solar yield, building demand, battery SoC trajectory, and grid dependency risk.',
      icon: LineChart,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      badge: 'PHYSICS FORECAST',
      badgeStyle: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      num: '05',
      title: 'Rule-Based Optimization Engine',
      desc: 'Analyzes net energy & grid tariff windows (Base ₹7.50 vs Peak ₹9.80) to emit explicit Condition → Problem → Action → Impact dispatch guidance.',
      icon: Brain,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      badge: 'RULE DISPATCH',
      badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      num: '06',
      title: 'Future Hardware & ML Readiness',
      desc: 'Modular software architecture prepared to replace simulated inputs with physical telemetry (ESP32, INA219, Modbus, BMS) and external ML APIs.',
      icon: Server,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      badge: 'INTEGRATION READY',
      badgeStyle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md mb-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight">SYSTEM ARCHITECTURE — HOW AURA ENERGY WORKS</h2>
            <p className="text-xs text-slate-400">7-Stage Software Digital Twin & Energy Intelligence Pipeline</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase">
          DIGITAL TWIN PIPELINE
        </span>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-500 font-mono">STAGE {step.num}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${step.badgeStyle}`}>
                    {step.badge}
                  </span>
                </div>

                <div className="flex items-center space-x-2.5 mb-2">
                  <div className={`p-2 rounded-xl border ${step.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white leading-tight">{step.title}</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
