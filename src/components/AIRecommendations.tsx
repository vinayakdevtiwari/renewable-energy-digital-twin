import React from 'react';
import { Brain, CheckCircle, ArrowRight, BatteryCharging, Car, Zap, Sparkles, ShieldAlert, ArrowDownRight } from 'lucide-react';
import type { AIRecommendation } from '../types/energy';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  onApplyRecommendation: (id: string) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  onApplyRecommendation,
}) => {
  const getPriorityBadge = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
      case 'MEDIUM':
        return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400';
      case 'LOW':
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Battery Management':
        return <BatteryCharging className="h-4 w-4 text-emerald-400" />;
      case 'EV Scheduling':
        return <Car className="h-4 w-4 text-indigo-400" />;
      case 'Solar Optimization':
        return <Zap className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight">AURA OPTIMIZATION ENGINE — RULE-BASED ENERGY DISPATCH</h2>
            <p className="text-xs text-slate-400">Transparent reasoning chain: Condition → Problem → Recommended Action → Expected Impact</p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 uppercase">
          RULE-BASED DISPATCH
        </span>
      </div>

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`rounded-xl border p-4 flex flex-col justify-between transition ${
              rec.applied
                ? 'bg-slate-950/60 border-slate-800 opacity-65'
                : 'bg-slate-950 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <div>
              {/* Category & Priority */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(rec.category)}
                  <span className="text-xs font-bold text-slate-300">{rec.category}</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getPriorityBadge(rec.priority)}`}>
                  Priority: {rec.priority}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-extrabold text-white mb-3 leading-snug">
                {rec.title}
              </h3>

              {/* Reasoning Chain Box */}
              <div className="space-y-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg p-3 mb-4">
                {/* 1. Condition */}
                <div className="flex items-start space-x-2">
                  <div className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-extrabold text-[9px] uppercase shrink-0 mt-0.5">
                    CONDITION
                  </div>
                  <span className="text-slate-300 font-medium">{rec.condition || rec.reason}</span>
                </div>

                {/* 2. Problem */}
                <div className="flex items-start space-x-2">
                  <div className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-[9px] uppercase shrink-0 mt-0.5 flex items-center gap-1">
                    <ShieldAlert className="h-2.5 w-2.5" /> PROBLEM
                  </div>
                  <span className="text-slate-400">{rec.problem || 'Energy inefficiency during current tariff window'}</span>
                </div>

                {/* 3. Action */}
                <div className="flex items-start space-x-2">
                  <div className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-extrabold text-[9px] uppercase shrink-0 mt-0.5">
                    ACTION
                  </div>
                  <span className="text-slate-200 font-semibold">{rec.action || rec.title}</span>
                </div>

                {/* 4. Impact */}
                <div className="flex items-start space-x-2 pt-1 border-t border-slate-800/80">
                  <div className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px] uppercase shrink-0 mt-0.5 flex items-center gap-1">
                    <ArrowDownRight className="h-2.5 w-2.5" /> IMPACT
                  </div>
                  <span className="text-emerald-400 font-extrabold">{rec.expectedImpact || rec.expectedBenefit}</span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500">{rec.timestamp}</span>

              {rec.applied ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-bold text-xs">
                  <CheckCircle className="h-4 w-4" />
                  <span>Simulated Action Applied</span>
                </span>
              ) : (
                <button
                  onClick={() => onApplyRecommendation(rec.id)}
                  className="flex items-center space-x-1.5 rounded-lg bg-emerald-500 text-slate-950 px-3.5 py-1.5 text-xs font-extrabold hover:bg-emerald-400 transition shadow-md hover:scale-105"
                  title="Simulate action in digital twin physics model"
                >
                  <span>Simulate Action</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
