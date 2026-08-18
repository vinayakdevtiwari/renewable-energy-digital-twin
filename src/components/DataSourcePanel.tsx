import React from 'react';
import { Database, Wifi, Server } from 'lucide-react';
import type { DataSourceInfo } from '../types/energy';

interface DataSourcePanelProps {
  dataSources: DataSourceInfo[];
}

export const DataSourcePanel: React.FC<DataSourcePanelProps> = ({ dataSources }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">System Architecture & Data Lineage Manifest</h2>
            <p className="text-xs text-slate-400">Verifiable live weather REST APIs, software simulation models, and rule-based optimization engines</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          DATA AUDIT MANIFEST
        </span>
      </div>

      {/* Data Source Cards Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataSources.map((ds) => (
          <div key={ds.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-cyan-400" />
                  {ds.name}
                </span>

                <div className="flex items-center space-x-1.5">
                  {/* Type Badge */}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                    ds.type === 'LIVE_API'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : ds.type === 'DEMO_SIMULATED'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                  }`}>
                    {ds.type === 'LIVE_API' ? 'LIVE API' : ds.type === 'DEMO_SIMULATED' ? 'SIMULATED' : 'ML ADAPTER'}
                  </span>

                  {/* Status Badge */}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                    ds.status === 'CONNECTED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : ds.status === 'INTEGRATION_READY'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {ds.status === 'INTEGRATION_READY' ? 'INTEGRATION READY' : ds.status}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mt-1 space-y-0.5 font-mono">
                <div>{ds.type === 'LIVE_API' ? 'Endpoint:' : 'Source:'} <span className="text-slate-200">{ds.endpoint}</span></div>
                <div>Status Info: <span className="text-emerald-400">{ds.latencyInfo}</span></div>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-tight">
                {ds.details}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Last Synced: {ds.lastFetchTime}</span>
              <span className={`flex items-center space-x-1 ${ds.type === 'LIVE_API' ? 'text-emerald-400' : ds.type === 'DEMO_SIMULATED' ? 'text-amber-400' : 'text-indigo-400'}`}>
                {ds.type === 'LIVE_API' ? <Wifi className="h-3 w-3" /> : <Server className="h-3 w-3" />}
                <span>{ds.type === 'LIVE_API' ? 'Live Connected' : ds.type === 'DEMO_SIMULATED' ? 'Simulation Active' : 'Adapter Ready'}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
