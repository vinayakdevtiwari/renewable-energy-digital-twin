import React, { useState } from 'react';
import {
  Zap,
  MapPin,
  RefreshCw,
  Clock,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { LocationConfig } from '../types/energy';
import { APP_CONFIG } from '../config/appConfig';

interface HeaderProps {
  selectedLocation: LocationConfig;
  availableLocations: LocationConfig[];
  onLocationChange: (loc: LocationConfig) => void;
  secondsUntilNextRefresh: number;
  isRefreshing: boolean;
  onManualRefresh: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: (demo: boolean) => void;
  isApiOffline: boolean;
  lastUpdatedTimestamp?: Date;
  refreshIntervalSeconds: number;
  onRefreshIntervalChange: (sec: number) => void;
  onOpenMlModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLocation,
  availableLocations,
  onLocationChange,
  secondsUntilNextRefresh,
  isRefreshing,
  onManualRefresh,
  isDemoMode,
  onToggleDemoMode,
  isApiOffline,
  lastUpdatedTimestamp,
  refreshIntervalSeconds,
  onRefreshIntervalChange,
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showIntervalDropdown, setShowIntervalDropdown] = useState(false);

  const formattedTimeAgo = lastUpdatedTimestamp
    ? `${Math.max(0, Math.floor((Date.now() - lastUpdatedTimestamp.getTime()) / 1000))}s ago`
    : 'just now';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 text-white transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Brand & System Status */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
            <Zap className="h-6 w-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-sans">
                AURA <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ENERGY</span>
              </h1>
              <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                SD-03 Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Digital Twin-Ready Prototype</span>
              <span className="inline-block h-1 w-1 rounded-full bg-slate-600"></span>
              <span className="text-slate-400">Control Center</span>
            </p>
          </div>
        </div>

        {/* Location & Status Bar */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Location Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>{selectedLocation.name}, {selectedLocation.country}</span>
              <span className="text-[10px] text-slate-400">({selectedLocation.latitude.toFixed(2)}°, {selectedLocation.longitude.toFixed(2)}°)</span>
            </button>

            {showLocationDropdown && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl z-50 p-2 text-xs">
                <div className="px-2 py-1 font-semibold text-slate-400 uppercase text-[10px]">Select Station Location</div>
                <div className="divide-y divide-slate-800">
                  {availableLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onLocationChange(loc);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                        selectedLocation.id === loc.id ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{loc.name}, {loc.country}</span>
                      <span className="text-[10px] text-slate-500">{loc.latitude}°, {loc.longitude}°</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Connection Status Badge */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isApiOffline
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <Radio className={`h-3.5 w-3.5 ${isApiOffline ? 'animate-bounce text-amber-400' : 'animate-pulse text-emerald-400'}`} />
            <span>{isApiOffline ? 'API DEGRADED' : 'OPEN-METEO LIVE'}</span>
          </div>

          {/* Auto Refresh Status & Countdown */}
          <div className="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">LIVE WEATHER</span>
            <span className="text-slate-500">|</span>
            <Clock className="h-3 w-3 text-slate-400" />
            <span>Updated {formattedTimeAgo}</span>
            <span className="text-slate-500">({secondsUntilNextRefresh}s)</span>

            {/* Refresh Interval Settings */}
            <div className="relative ml-1">
              <button
                onClick={() => setShowIntervalDropdown(!showIntervalDropdown)}
                className="text-slate-400 hover:text-slate-200"
                title="Change Refresh Interval"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>
              {showIntervalDropdown && (
                <div className="absolute right-0 mt-2 w-36 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400">Refresh Rate</div>
                  {APP_CONFIG.REFRESH_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        onRefreshIntervalChange(opt);
                        setShowIntervalDropdown(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        refreshIntervalSeconds === opt ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Every {opt} seconds
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500/50 hover:bg-slate-700 transition disabled:opacity-50"
            title="Force Manual Data Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-slate-300'}`} />
            <span>Refresh</span>
          </button>

          {/* Mode Indicator: LIVE WEATHER + SIMULATED ENERGY */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 p-0.5">
            <button
              onClick={() => onToggleDemoMode(false)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                !isDemoMode
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live Open-Meteo weather REST API + Simulated energy model physics"
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>LIVE WEATHER + SIMULATED ENERGY</span>
            </button>

            <button
              onClick={() => onToggleDemoMode(true)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                isDemoMode
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Override live weather with synthetic cloud/irradiance test profile"
            >
              <AlertTriangle className="h-3 w-3" />
              <span>DEMO PROFILE</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
