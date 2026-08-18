import React from 'react';
import { Car } from 'lucide-react';
import type { EVData } from '../types/energy';

interface EVChargingCardProps {
  ev: EVData;
}

export const EVChargingCard: React.FC<EVChargingCardProps> = ({ ev }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Smart EV Charging Hub — Simulation</h2>
            <p className="text-xs text-slate-400">4 simulated charging bays for energy dispatch testing</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span className="text-slate-400">Total Power: <strong className="text-indigo-400">{ev.totalPowerkW} kW</strong></span>
          <span className="text-slate-400">Occupancy: <strong className="text-white">{ev.occupiedStations}/{ev.totalStations} Simulated Bays</strong></span>
        </div>
      </div>

      {/* Vehicle Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ev.vehicles.map((v) => (
          <div key={v.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex flex-col justify-between">
            <div>
              {/* Vehicle Title & Status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-white">{v.name}</span>
                  <span className="text-[10px] text-slate-500">({v.id} - Demo Entity)</span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    v.status === 'charging'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : v.status === 'waiting'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : v.status === 'scheduled'
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              {/* SoC Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Battery: <strong className="text-white">{v.batterySoc}%</strong> (Simulated)</span>
                  <span className="text-slate-500">Target: {v.targetSoc}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${v.batterySoc}%` }}
                  ></div>
                </div>
              </div>

              {/* Charging Power & Window */}
              <div className="space-y-1 text-xs text-slate-400 mt-3">
                <div className="flex justify-between">
                  <span>Current Power:</span>
                  <span className="font-bold text-indigo-300">{v.chargingPowerkW} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommended Window:</span>
                  <span className="font-semibold text-emerald-400 text-[11px]">{v.recommendedWindow}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Connected: {v.connectedTime}</span>
              <span>Est. Done: {v.estCompletionTime}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
