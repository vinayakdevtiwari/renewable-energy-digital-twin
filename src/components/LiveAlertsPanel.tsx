import React from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { AlertItem } from '../types/energy';

interface LiveAlertsPanelProps {
  alerts: AlertItem[];
  onDismissAlert: (id: string) => void;
}

export const LiveAlertsPanel: React.FC<LiveAlertsPanelProps> = ({ alerts, onDismissAlert }) => {
  const getSeverityStyle = (severity: 'CRITICAL' | 'WARNING' | 'INFO') => {
    switch (severity) {
      case 'CRITICAL':
        return {
          badge: 'bg-red-500/20 text-red-400 border-red-500/40',
          box: 'border-red-500/30 bg-red-500/5',
          icon: <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />,
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          box: 'border-amber-500/30 bg-amber-500/5',
          icon: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
        };
      case 'INFO':
        return {
          badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          box: 'border-cyan-500/30 bg-cyan-500/5',
          icon: <Info className="h-4 w-4 text-cyan-400 shrink-0" />,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Live Microgrid Event Stream & Alerts</h2>
            <p className="text-xs text-slate-400">Real-time dynamic safety, weather drop, and operational threshold events</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          {alerts.length} Active Events
        </span>
      </div>

      {/* Alert Stream List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            All system parameters operating within normal thresholds. No active alerts.
          </div>
        ) : (
          alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-3 flex items-start justify-between gap-3 transition ${style.box}`}
              >
                <div className="flex items-start space-x-3">
                  {style.icon}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${style.badge}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-500">{alert.category}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{alert.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition"
                  title="Dismiss alert"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
