import { useState, useEffect, useCallback, useRef } from 'react';
import type { FullDashboardState, LocationConfig, AlertItem, DemoScenarioId } from '../types/energy';
import { APP_CONFIG, LOCATIONS } from '../config/appConfig';
import { fetchLiveWeather } from '../services/weatherService';
import {
  generateSimulatedEnergyData,
  generate24HourForecast,
  generate6HourTimeline,
  generateAIRecommendations,
  generateLiveAlerts,
  getInitialDataSources,
} from '../services/demoDataService';
import { mlIntegrationService } from '../services/mlIntegrationService';

export const useEnergyData = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationConfig>(APP_CONFIG.DEFAULT_LOCATION);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState<number>(APP_CONFIG.DEFAULT_REFRESH_INTERVAL);
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState<number>(APP_CONFIG.DEFAULT_REFRESH_INTERVAL);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [currentScenario, setCurrentScenario] = useState<DemoScenarioId>('NORMAL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Core state storage
  const [state, setState] = useState<FullDashboardState | null>(null);
  const lastValidStateRef = useRef<FullDashboardState | null>(null);

  // Main data fetching & physics routine
  const loadData = useCallback(
    async (location: LocationConfig, forceDemo: boolean = false, scenario: DemoScenarioId = 'NORMAL') => {
      setIsRefreshing(true);
      let isApiOffline = false;
      let weatherData = lastValidStateRef.current?.weather || null;

      try {
        if (!forceDemo) {
          // Fetch real Open-Meteo API weather & solar radiation
          const liveWeather = await fetchLiveWeather(location);
          weatherData = liveWeather;
        } else {
          // Demo weather simulation profile
          weatherData = {
            temperature: 29.4,
            apparentTemperature: 31.0,
            humidity: 58,
            windSpeed: 14.2,
            cloudCover: scenario === 'CLOUD_SPIKE' ? 85 : 22,
            solarIrradiance: scenario === 'CLOUD_SPIKE' ? 180 : 520,
            weatherCondition: scenario === 'CLOUD_SPIKE' ? 'Overcast' : 'Partly Cloudy',
            weatherCode: scenario === 'CLOUD_SPIKE' ? 3 : 2,
            sunrise: '06:04 AM',
            sunset: '07:12 PM',
            isDay: true,
            forecast: [
              { date: 'Today', dayName: 'Today', tempMax: 32, tempMin: 22, condition: scenario === 'CLOUD_SPIKE' ? 'Overcast' : 'Partly Cloudy', cloudCoverMax: scenario === 'CLOUD_SPIKE' ? 85 : 22, solarRadiationMax: 650, icon: 'CloudSun' },
              { date: 'Tomorrow', dayName: 'Tomorrow', tempMax: 34, tempMin: 23, condition: 'Clear Sky', cloudCoverMax: 10, solarRadiationMax: 720, icon: 'Sun' },
              { date: 'Day +2', dayName: 'Fri', tempMax: 31, tempMin: 21, condition: 'Rain Showers', cloudCoverMax: 75, solarRadiationMax: 310, icon: 'CloudRain' },
              { date: 'Day +3', dayName: 'Sat', tempMax: 30, tempMin: 20, condition: 'Overcast', cloudCoverMax: 85, solarRadiationMax: 240, icon: 'Cloud' },
            ],
            isLive: false,
            lastUpdated: new Date().toLocaleTimeString(),
          };
        }
      } catch (err) {
        console.warn('Weather API failed, retaining last valid weather data:', err);
        isApiOffline = true;
        
        // Fallback default if no prior state exists
        if (!weatherData) {
          weatherData = {
            temperature: 28.0,
            apparentTemperature: 29.0,
            humidity: 60,
            windSpeed: 12.0,
            cloudCover: 30,
            solarIrradiance: 400,
            weatherCondition: 'Clear Sky',
            weatherCode: 0,
            sunrise: '06:00 AM',
            sunset: '07:00 PM',
            isDay: true,
            forecast: [],
            isLive: false,
            lastUpdated: new Date().toLocaleTimeString(),
          };
        }
      }

      // Generate energy dynamics (Solar, Demand, Battery, EV, Renewable Contribution)
      const energyData = generateSimulatedEnergyData(weatherData, scenario);

      // Check ML custom overrides or use default forecast/recommendations
      const forecast24h = mlIntegrationService.getForecast() || generate24HourForecast(weatherData, scenario);
      
      const timeline = generate6HourTimeline(
        energyData.solar.currentGenerationkW,
        energyData.demand.currentDemandkW,
        energyData.battery.socPercentage,
        scenario
      );

      const recommendations =
        mlIntegrationService.getRecommendations() ||
        generateAIRecommendations(
          energyData.solar.currentGenerationkW,
          energyData.demand.currentDemandkW,
          energyData.battery.socPercentage,
          weatherData.cloudCover,
          scenario
        );

      const alerts = generateLiveAlerts(
        energyData.solar.currentGenerationkW,
        energyData.demand.currentDemandkW,
        energyData.battery.socPercentage,
        isApiOffline,
        scenario
      );

      const dataSources = getInitialDataSources(isApiOffline);

      const newState: FullDashboardState = {
        weather: weatherData,
        solar: energyData.solar,
        demand: energyData.demand,
        battery: energyData.battery,
        ev: energyData.ev,
        renewable: energyData.renewable,
        forecast24h,
        recommendations,
        alerts,
        dataSources,
        timeline,
        currentScenario: scenario,
        isDemoMode: forceDemo,
        isApiOffline,
        lastUpdatedTimestamp: new Date(),
        refreshIntervalSeconds,
        selectedLocation: location,
      };

      lastValidStateRef.current = newState;
      setState(newState);
      setIsRefreshing(false);
      setSecondsUntilNextRefresh(refreshIntervalSeconds);
    },
    [refreshIntervalSeconds]
  );

  // Initial load & Location/Demo/Scenario change
  useEffect(() => {
    loadData(selectedLocation, isDemoMode, currentScenario);
  }, [selectedLocation, isDemoMode, currentScenario, loadData]);

  // Automatic Refresh Countdown Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilNextRefresh((prev) => {
        if (prev <= 1) {
          loadData(selectedLocation, isDemoMode, currentScenario);
          return refreshIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshIntervalSeconds, selectedLocation, isDemoMode, currentScenario, loadData]);

  // Manual Trigger
  const handleManualRefresh = () => {
    loadData(selectedLocation, isDemoMode, currentScenario);
  };

  // Toggle Location
  const handleLocationChange = (loc: LocationConfig) => {
    setSelectedLocation(loc);
  };

  // Toggle Demo Mode
  const handleToggleDemoMode = (demo: boolean) => {
    setIsDemoMode(demo);
    if (!demo) setCurrentScenario('NORMAL');
  };

  // Scenario Switcher
  const handleScenarioChange = (scenarioId: DemoScenarioId) => {
    setCurrentScenario(scenarioId);
    loadData(selectedLocation, true, scenarioId);
  };

  // Apply AI Recommendation
  const handleApplyRecommendation = (id: string) => {
    if (!state) return;
    setState((prev) => {
      if (!prev) return prev;
      const updatedRecs = prev.recommendations.map((rec) =>
        rec.id === id ? { ...rec, applied: true } : rec
      );
      
      const newAlert: AlertItem = {
        id: `alt-applied-${Date.now()}`,
        severity: 'INFO',
        title: 'Optimization Action Simulated',
        message: `Simulated action in physics model: ${prev.recommendations.find(r => r.id === id)?.title}`,
        timestamp: new Date().toLocaleTimeString(),
        category: 'Solar',
        read: false,
      };

      return {
        ...prev,
        recommendations: updatedRecs,
        alerts: [newAlert, ...prev.alerts],
      };
    });
  };

  // Dismiss Alert
  const handleDismissAlert = (id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        alerts: prev.alerts.filter((a) => a.id !== id),
      };
    });
  };

  return {
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
    availableLocations: LOCATIONS,
  };
};
