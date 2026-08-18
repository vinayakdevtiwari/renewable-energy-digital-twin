import React from 'react';
import { Clock, ArrowRight, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { TimelineItem } from '../types/energy';

interface OperationalTimelineSectionProps {
  timeline: TimelineItem[];
}

export const OperationalTimelineSection: React.FC<OperationalTimelineSectionProps> = ({ timeline }) => {
  const getStatusBadge = (status: 'OPTIMAL' | 'WARNING' | 'NEUTRAL' | 'CRITICAL') => {
    switch (status) {
      case 'OPTIMAL':
        return { icon: CheckCircle, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
      case 'WARNING':
        return { icon: AlertTriangle, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
      case 'CRITICAL':
        return { icon: AlertCircle, color: 'text-red-400 border-red-500/30 bg-red-500/10' };
      default:
        return { icon: Info, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md mb-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight">WHAT HAPPENS NEXT? — 6-HOUR OPERATIONAL FORECAST TIMELINE</h2>
            <p className="text-xs text-slate-400">Predictive event trajectory: Move from monitoring current state to proactive decision preparation</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase">
          LOOK-AHEAD ENGINE
        </span>
      </div>

      {/* Timeline Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {timeline.map((item, idx) => {
          const badge = getStatusBadge(item.status);
          const StatusIcon = badge.icon;

          return (
            <div
              key={idx}
              className="relative rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex flex-col justify-between hover:border-slate-700 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    {item.time}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 uppercase ${badge.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {item.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-200 mb-1 group-hover:text-cyan-400 transition">
                  {item.title}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>Sequence T+{idx + 1}h</span>
                <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
