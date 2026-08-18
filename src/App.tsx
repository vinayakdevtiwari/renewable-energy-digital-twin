import { useState } from 'react';
import { useEnergyData } from './hooks/useEnergyData';
import { Header } from './components/Header';
import { Sidebar, type NavTab } from './components/Sidebar';
import { SystemHealthStrip } from './components/SystemHealthStrip';
import { KPICards } from './components/KPICards';
import { EnergyFlowVisualizer } from './components/EnergyFlowVisualizer';
import { DigitalTwinStateSection } from './components/DigitalTwinStateSection';
import { OperationalTimelineSection } from './components/OperationalTimelineSection';
import { WeatherSection } from './components/WeatherSection';
import { RenewableGenerationChart } from './components/RenewableGenerationChart';
import { DemandVsGenerationChart } from './components/DemandVsGenerationChart';
import { Forecast24hSection } from './components/Forecast24hSection';
import { AIRecommendations } from './components/AIRecommendations';
import { LiveAlertsPanel } from './components/LiveAlertsPanel';
import { BatteryStorageCard } from './components/BatteryStorageCard';
import { EVChargingCard } from './components/EVChargingCard';
import { DataSourcePanel } from './components/DataSourcePanel';
import { SystemExplanationPanel } from './components/SystemExplanationPanel';
import { MLApiTesterModal } from './components/MLApiTesterModal';
import { RefreshCw, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isMlModalOpen, setIsMlModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const {
    state,
    isRefreshing,
    secondsUntilNextRefresh,
    selectedLocation,
    isDemoMode,
    currentScenario,
    refreshIntervalSeconds,
    setRefreshIntervalSeconds,
    handleManualRefresh,
    handleLocationChange,
    handleToggleDemoMode,
    handleScenarioChange,
    handleApplyRecommendation,
    handleDismissAlert,
    availableLocations,
  } = useEnergyData();

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-xl animate-pulse">
          <Zap className="h-7 w-7 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400 font-medium">
          <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Synchronizing Open-Meteo Weather & Energy Physics Model...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'}`}>
      
      {/* Top Header */}
      <Header
        selectedLocation={selectedLocation}
        availableLocations={availableLocations}
        onLocationChange={handleLocationChange}
        secondsUntilNextRefresh={secondsUntilNextRefresh}
        isRefreshing={isRefreshing}
        onManualRefresh={handleManualRefresh}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        isApiOffline={state.isApiOffline}
        lastUpdatedTimestamp={state.lastUpdatedTimestamp}
        refreshIntervalSeconds={refreshIntervalSeconds}
        onRefreshIntervalChange={setRefreshIntervalSeconds}
        onOpenMlModal={() => setIsMlModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="flex">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={state.alerts.length}
          aiRecCount={state.recommendations.filter(r => !r.applied).length}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          
          {/* System Health Strip (Operational Indicators & Demo Scenario Switcher) */}
          <SystemHealthStrip
            renewablePercentage={state.renewable.renewablePercentage}
            gridImportkW={state.renewable.gridImportkW}
            batterySoc={state.battery.socPercentage}
            solarGenkW={state.solar.currentGenerationkW}
            isApiOffline={state.isApiOffline}
            isDemoMode={isDemoMode}
            currentScenario={currentScenario}
            onScenarioChange={handleScenarioChange}
          />

          {/* Top Banner Alert if API is degraded */}
          {state.isApiOffline && (
            <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center justify-between">
              <span>⚠️ External Weather API unavailable. Displaying cached weather state & simulated physics data.</span>
              <button onClick={handleManualRefresh} className="underline font-bold hover:text-white">Retry Connection</button>
            </div>
          )}

          {/* Top KPI Cards (Always visible on all tabs) */}
          <KPICards
            solar={state.solar}
            demand={state.demand}
            battery={state.battery}
            renewable={state.renewable}
          />

          {/* TAB 1: CONTROL OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight 1: Main Energy Balance Schematic */}
              <EnergyFlowVisualizer
                solar={state.solar}
                demand={state.demand}
                battery={state.battery}
                ev={state.ev}
                renewable={state.renewable}
              />

              {/* Highlight 2: Digital Twin Current System State */}
              <DigitalTwinStateSection
                solar={state.solar}
                demand={state.demand}
                battery={state.battery}
                ev={state.ev}
                renewable={state.renewable}
              />

              {/* Highlight 3: System Architecture Explanation ("How It Works") */}
              <SystemExplanationPanel />

              {/* Highlight 4: Operational Timeline ("What Happens Next?") */}
              <OperationalTimelineSection timeline={state.timeline} />

              {/* Highlight 4: Aura Optimization Engine & Live Alerts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AIRecommendations
                  recommendations={state.recommendations}
                  onApplyRecommendation={handleApplyRecommendation}
                />
                <LiveAlertsPanel
                  alerts={state.alerts}
                  onDismissAlert={handleDismissAlert}
                />
              </div>

              {/* Highlight 5: Live Weather Section */}
              <WeatherSection
                weather={state.weather}
                locationName={`${selectedLocation.name}, ${selectedLocation.country}`}
              />
            </div>
          )}

          {/* TAB 2: ENERGY FLOW & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <DemandVsGenerationChart
                solar={state.solar}
                demand={state.demand}
                battery={state.battery}
              />
              <RenewableGenerationChart solar={state.solar} />
              <EnergyFlowVisualizer
                solar={state.solar}
                demand={state.demand}
                battery={state.battery}
                ev={state.ev}
                renewable={state.renewable}
              />
            </div>
          )}

          {/* TAB 3: 24H PREDICTIVE FORECAST */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <Forecast24hSection forecast24h={state.forecast24h} />
              <OperationalTimelineSection timeline={state.timeline} />
              <RenewableGenerationChart solar={state.solar} />
            </div>
          )}

          {/* TAB 4: ENERGY OPTIMIZATIONS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <AIRecommendations
                recommendations={state.recommendations}
                onApplyRecommendation={handleApplyRecommendation}
              />
              <OperationalTimelineSection timeline={state.timeline} />
              <Forecast24hSection forecast24h={state.forecast24h} />
            </div>
          )}

          {/* TAB 5: BATTERY & EV HUB */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <BatteryStorageCard battery={state.battery} />
              <EVChargingCard ev={state.ev} />
            </div>
          )}

          {/* TAB 6: DATA SOURCES & APIS */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <DataSourcePanel dataSources={state.dataSources} />
              <WeatherSection
                weather={state.weather}
                locationName={`${selectedLocation.name}, ${selectedLocation.country}`}
              />
            </div>
          )}

        </main>
      </div>

      {/* Developer ML Sandbox Modal */}
      <MLApiTesterModal
        isOpen={isMlModalOpen}
        onClose={() => setIsMlModalOpen(false)}
        onRefreshData={handleManualRefresh}
      />
    </div>
  );
}
