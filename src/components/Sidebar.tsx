import React from 'react';
import {
  LayoutDashboard,
  Activity,
  LineChart,
  Brain,
  BatteryCharging,
  Database
} from 'lucide-react';

export type NavTab = 'overview' | 'analytics' | 'forecast' | 'ai' | 'storage' | 'sources';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  alertCount: number;
  aiRecCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  aiRecCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Control Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Energy Flow & Balance',
      icon: Activity,
      badge: null,
    },
    {
      id: 'forecast' as NavTab,
      label: '24h Predictive Forecast',
      icon: LineChart,
      badge: null,
    },
    {
      id: 'ai' as NavTab,
      label: 'Energy Optimizations',
      icon: Brain,
      badge: aiRecCount > 0 ? `${aiRecCount} NEW` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'storage' as NavTab,
      label: 'Battery & EV Hub',
      icon: BatteryCharging,
      badge: null,
    },
    {
      id: 'sources' as NavTab,
      label: 'Data Sources & APIs',
      icon: Database,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-4 hidden md:block min-h-[calc(100vh-65px)]">
      <div className="mb-6 px-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Operations Monitor
        </span>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-400 border border-emerald-500/30 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Summary Widget */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">System Health</span>
          <span className="text-[10px] text-emerald-400 font-bold">OPTIMAL</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[94%]"></div>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Open-Meteo REST API active. Real-time solar radiation and weather synchronization operating cleanly.
        </p>
      </div>
    </aside>
  );
};
