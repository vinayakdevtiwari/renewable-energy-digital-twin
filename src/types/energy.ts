export interface LocationConfig {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WeatherForecastDay {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  cloudCoverMax: number;
  solarRadiationMax: number; // W/m²
  icon: string;
}

export interface WeatherData {
  temperature: number; // °C
  apparentTemperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  cloudCover: number; // %
  solarIrradiance: number; // W/m² (Direct Normal / Shortwave radiation)
  weatherCondition: string; // Clear, Partly Cloudy, Overcast, Rain, etc.
  weatherCode: number;
  sunrise: string;
  sunset: string;
  isDay: boolean;
  forecast: WeatherForecastDay[];
  hourlyCloudCover?: number[]; // Live 24h Open-Meteo hourly cloud cover %
  hourlyIrradiance?: number[]; // Live 24h Open-Meteo hourly irradiance W/m²
  isLive: boolean; // EXPLICIT REAL DATA MARKER (Open-Meteo REST API)
  lastUpdated: string;
}

export interface SolarData {
  currentGenerationkW: number;
  predictedGenerationkW: number;
  todayTotalkWh: number;
  percentageChange: number;
  peakCapacitykW: number;
  efficiencyPercentage: number;
  isSimulated: boolean; // EXPLICIT SIMULATED MARKER
}

export interface DemandData {
  currentDemandkW: number; // Building load
  totalSiteLoadkW: number; // Building load + EV load
  todayTotalConsumptionkWh: number;
  percentageChange: number;
  peakDemandkW: number;
  baseLoadkW: number;
  isSimulated: boolean; // EXPLICIT SIMULATED MARKER
}

export interface BatteryData {
  socPercentage: number; // % State of Charge
  chargingState: 'charging' | 'discharging' | 'idle';
  currentPowerkW: number; // positive = magnitude of charge or discharge
  chargeRatekW: number; // >0 when charging
  dischargeRatekW: number; // >0 when discharging
  availableCapacitykWh: number;
  maxCapacitykWh: number;
  timeToFullOrEmptyMinutes: number;
  healthPercentage: number;
  operatingMode: 'Self-Consumption' | 'Grid-Export' | 'Backup-Reserve';
  temperatureC: number;
  isSimulated: boolean; // EXPLICIT SIMULATED MARKER
}

export interface EVItem {
  id: string;
  name: string;
  batterySoc: number; // %
  targetSoc: number; // %
  chargingPowerkW: number;
  status: 'charging' | 'waiting' | 'completed' | 'scheduled';
  recommendedWindow: string;
  connectedTime: string;
  estCompletionTime: string;
}

export interface EVData {
  totalStations: number;
  occupiedStations: number;
  totalPowerkW: number;
  todayEnergyDeliveredkWh: number;
  vehicles: EVItem[];
  isSimulated: boolean; // EXPLICIT SIMULATED MARKER
}

export interface RenewableContributionData {
  renewablePercentage: number; // % of total site load met by solar + solar-charged battery
  gridPercentage: number; // % of total site load met by grid import
  gridImportkW: number; // > 0 when buying from grid
  gridExportkW: number; // > 0 when selling surplus to grid
  co2AvoidedKg: number; // ESTIMATED
  todayCostSavingsINR: number; // ESTIMATED
  gridTariffINRPerkWh: number;
  isSimulated: boolean; // EXPLICIT SIMULATED MARKER
  assumptions: string; // e.g. "Assumes battery is charged primarily via solar surplus"
}

export interface ForecastItem {
  timestamp: string;
  hourLabel: string;
  solarGenerationkW: number;
  energyDemandkW: number;
  batterySoc: number;
  renewableAvailabilityPercent: number;
  weatherCondition: string;
  cloudCoverPercent: number;
  isDeficit: boolean;
  isSurplus: boolean;
}

export interface AIRecommendation {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  condition: string; // E.g. "Solar generation exceeds demand by 1.6 kW"
  problem: string;   // E.g. "Unused clean energy export to grid at low tariff"
  action: string;    // E.g. "Direct surplus to charge battery storage"
  expectedImpact: string; // E.g. "↓ 14% grid dependency, ↑ 9% renewable utilization"
  reason: string;
  expectedBenefit: string;
  category: 'Solar Optimization' | 'Battery Management' | 'EV Scheduling' | 'Grid Savings';
  applied: boolean;
  timestamp: string;
  actionType: 'CHARGE_BATTERY' | 'SCHEDULE_EV' | 'SHIFT_LOAD' | 'EXPORT_GRID';
}

export interface TimelineItem {
  time: string;
  title: string;
  desc: string;
  status: 'OPTIMAL' | 'WARNING' | 'NEUTRAL' | 'CRITICAL';
}

export type DemoScenarioId = 'NORMAL' | 'CLOUD_SPIKE' | 'DEMAND_SURGE' | 'EV_INFLUX';

export interface DemoScenario {
  id: DemoScenarioId;
  label: string;
  description: string;
}

export interface AlertItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  category: 'Solar' | 'Battery' | 'EV' | 'Grid' | 'Weather' | 'API';
  read: boolean;
}

export interface DataSourceInfo {
  id: string;
  name: string;
  type: 'LIVE_API' | 'DEMO_SIMULATED' | 'ML_ADAPTER';
  status: 'CONNECTED' | 'INTEGRATION_READY' | 'NOT_CONNECTED' | 'DEGRADED';
  lastFetchTime: string;
  endpoint: string;
  latencyInfo: string; // Real measured latency or "N/A (Simulated)"
  details: string;
}

export interface FullDashboardState {
  weather: WeatherData;
  solar: SolarData;
  demand: DemandData;
  battery: BatteryData;
  ev: EVData;
  renewable: RenewableContributionData;
  forecast24h: ForecastItem[];
  recommendations: AIRecommendation[];
  alerts: AlertItem[];
  dataSources: DataSourceInfo[];
  timeline: TimelineItem[];
  currentScenario: DemoScenarioId;
  isDemoMode: boolean;
  isApiOffline: boolean;
  lastUpdatedTimestamp: Date;
  refreshIntervalSeconds: number;
  selectedLocation: LocationConfig;
}
