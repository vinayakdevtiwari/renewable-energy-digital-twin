import type {
  SolarData,
  DemandData,
  BatteryData,
  EVData,
  RenewableContributionData,
  WeatherData,
  ForecastItem,
  AIRecommendation,
  AlertItem,
  DataSourceInfo,
  TimelineItem,
  DemoScenarioId
} from '../types/energy';
import { APP_CONFIG } from '../config/appConfig';

/**
 * SIMULATED DATA PROVIDER & PHYSICS MODEL
 * Enforces strict Kirchhoff Power Balance (Conservation of Energy):
 * Solar + Battery Discharge + Grid Import = Building Load + EV Load + Battery Charge + Grid Export
 * ALL simulated data items are explicitly tagged with `isSimulated: true`.
 */

export const generateSimulatedEnergyData = (
  weather: WeatherData,
  scenario: DemoScenarioId = 'NORMAL'
) => {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // 1. Solar Generation Model (Diurnal sine curve modulated by live Open-Meteo cloud cover & scenario)
  let solarFactor = 0;
  if (currentHour >= 6 && currentHour <= 18) {
    solarFactor = Math.sin(((currentHour - 6) / 12) * Math.PI);
  }
  
  let effectiveCloudCover = weather.cloudCover;
  if (scenario === 'CLOUD_SPIKE') {
    effectiveCloudCover = Math.max(82, weather.cloudCover);
  }

  const cloudAttenuation = 1 - (effectiveCloudCover / 100) * 0.75;
  let rawSolarGen = APP_CONFIG.SOLAR_PEAK_CAPACITY_KW * Math.pow(solarFactor, 1.4) * cloudAttenuation;
  
  if (scenario === 'CLOUD_SPIKE') {
    rawSolarGen *= 0.35; // 65% drop in solar generation
  }

  const solarGenkW = Math.max(0, Math.round(rawSolarGen * 100) / 100);
  const predictedSolarGenkW = Math.max(0, Math.round((solarGenkW * 1.05 + 0.2) * 100) / 100);

  // 2. Building Load Model (Base load + Peak Activity simulation & scenario)
  let demandFactor = 1.0;
  if ((currentHour >= 8 && currentHour <= 11) || (currentHour >= 18 && currentHour <= 21)) {
    demandFactor = 1.6;
  } else if (currentHour >= 23 || currentHour <= 5) {
    demandFactor = 0.65;
  }
  
  let baseDemand = 2.4 * demandFactor;
  if (scenario === 'DEMAND_SURGE') {
    baseDemand = 6.2; // Massive building demand spike
  }

  const buildingDemandkW = Math.max(1.2, Math.round(baseDemand * 100) / 100);

  // 3. EV Charging Station Model & Scenario
  const isEVInflux = scenario === 'EV_INFLUX';

  const evList = [
    {
      id: 'EV-01',
      name: 'Tesla Model 3',
      batterySoc: 48,
      targetSoc: 90,
      chargingPowerkW: isEVInflux ? 3.3 : (solarGenkW > 3.0 ? 3.3 : 1.2),
      status: 'charging' as const,
      recommendedWindow: '11:30 - 14:30 (Peak Solar)',
      connectedTime: '09:15 AM',
      estCompletionTime: '01:45 PM',
    },
    {
      id: 'EV-02',
      name: 'Hyundai Ioniq 5',
      batterySoc: 72,
      targetSoc: 85,
      chargingPowerkW: isEVInflux ? 3.3 : 0,
      status: isEVInflux ? ('charging' as const) : ('waiting' as const),
      recommendedWindow: '12:00 - 15:00',
      connectedTime: '10:00 AM',
      estCompletionTime: '02:15 PM',
    },
    {
      id: 'EV-03',
      name: 'Tata Nexon EV',
      batterySoc: 88,
      targetSoc: 90,
      chargingPowerkW: isEVInflux ? 3.3 : 0.6,
      status: 'charging' as const,
      recommendedWindow: 'Completed soon',
      connectedTime: '07:45 AM',
      estCompletionTime: '11:15 AM',
    },
    {
      id: 'EV-04',
      name: 'MG ZS EV',
      batterySoc: 30,
      targetSoc: 80,
      chargingPowerkW: isEVInflux ? 3.3 : 0,
      status: isEVInflux ? ('charging' as const) : ('scheduled' as const),
      recommendedWindow: '13:00 - 16:00',
      connectedTime: isEVInflux ? '11:30 AM' : '--',
      estCompletionTime: isEVInflux ? '03:30 PM' : '--',
    },
  ];

  const totalEVPowerkW = Math.round(evList.reduce((sum, v) => sum + v.chargingPowerkW, 0) * 100) / 100;
  const totalSiteLoadkW = Math.round((buildingDemandkW + totalEVPowerkW) * 100) / 100;

  // 4. Net Generation Balance & Battery/Grid Dispatch Physics
  // P_net = Solar - TotalSiteLoad
  const netBalancekW = Math.round((solarGenkW - totalSiteLoadkW) * 100) / 100;

  let baseSoc = 65;
  if (currentHour >= 12 && currentHour <= 16) baseSoc = 85;
  else if (currentHour >= 18 && currentHour <= 22) baseSoc = 48;
  else if (currentHour >= 0 && currentHour <= 5) baseSoc = 32;

  if (scenario === 'CLOUD_SPIKE' || scenario === 'DEMAND_SURGE') {
    baseSoc = 42; // Storage depleted faster
  }

  const socPercentage = Math.min(98, Math.max(15, Math.round(baseSoc + netBalancekW * 2)));

  let chargingState: 'charging' | 'discharging' | 'idle' = 'idle';
  let chargeRatekW = 0;
  let dischargeRatekW = 0;
  let gridImportkW = 0;
  let gridExportkW = 0;

  if (netBalancekW > 0.05) {
    if (socPercentage < 98) {
      chargingState = 'charging';
      chargeRatekW = Math.min(netBalancekW, 3.5);
      chargeRatekW = Math.round(chargeRatekW * 100) / 100;
      gridExportkW = Math.round((netBalancekW - chargeRatekW) * 100) / 100;
    } else {
      chargingState = 'idle';
      gridExportkW = netBalancekW;
    }
  } else if (netBalancekW < -0.05) {
    const deficitkW = Math.abs(netBalancekW);
    if (socPercentage > 15) {
      chargingState = 'discharging';
      dischargeRatekW = Math.min(deficitkW, 4.0);
      dischargeRatekW = Math.round(dischargeRatekW * 100) / 100;
      gridImportkW = Math.round((deficitkW - dischargeRatekW) * 100) / 100;
    } else {
      chargingState = 'idle';
      gridImportkW = deficitkW;
    }
  }

  const currentPowerkW = chargingState === 'charging' ? chargeRatekW : chargingState === 'discharging' ? dischargeRatekW : 0;
  const availableCapacitykWh = Math.round(((socPercentage / 100) * APP_CONFIG.BATTERY_MAX_CAPACITY_KWH) * 10) / 10;
  
  let timeToFullOrEmptyMinutes = 0;
  if (chargingState === 'charging' && chargeRatekW > 0) {
    const remainingToFull = APP_CONFIG.BATTERY_MAX_CAPACITY_KWH - availableCapacitykWh;
    timeToFullOrEmptyMinutes = Math.round((remainingToFull / chargeRatekW) * 60);
  } else if (chargingState === 'discharging' && dischargeRatekW > 0) {
    const remainingToMin = availableCapacitykWh - APP_CONFIG.BATTERY_MAX_CAPACITY_KWH * 0.15;
    timeToFullOrEmptyMinutes = Math.round((remainingToMin / dischargeRatekW) * 60);
  }

  // 5. Renewable Contribution Calculation & Explicit Assumption
  let renewablePercentage = 100;
  if (totalSiteLoadkW > 0) {
    const renewableSupplykW = totalSiteLoadkW - gridImportkW;
    renewablePercentage = Math.min(100, Math.max(0, Math.round((renewableSupplykW / totalSiteLoadkW) * 100)));
  }
  const gridPercentage = 100 - renewablePercentage;

  // Modeled Daily Totals — integrated from deterministic 24-hour diurnal solar profile
  // (Not derived from instantaneous kW; calculated by integrating the hourly model over daylight hours)
  const effectiveCloudAttenuation = 1 - (effectiveCloudCover / 100) * 0.75;
  // Integrate solar sine curve over daylight hours (6 AM to 6 PM = 12 hours)
  // Integral of sin((x-6)/12 * PI) from 6 to 18 = 12/PI * 2 = ~7.64 hours equivalent
  const solarDailyIntegralHours = (12 / Math.PI) * 2;
  const todayTotalkWh = Math.round(APP_CONFIG.SOLAR_PEAK_CAPACITY_KW * solarDailyIntegralHours * effectiveCloudAttenuation * (scenario === 'CLOUD_SPIKE' ? 0.35 : 1) * 10) / 10;
  // Building demand: integrate time-of-day profile (simplified trapezoid integration)
  // Night (0-6): 1.4 kW * 6h = 8.4 kWh, Day base (6-8, 11-18, 21-24): 2.4 kW * 14h = 33.6 kWh, Peak (8-11, 18-21): 4.4 kW * 6h = 26.4 kWh
  const buildingDailyBase = 1.4 * 6 + 2.4 * 9 + 4.4 * 6 + 2.4 * 3;
  const todayDemandkWh = Math.round((buildingDailyBase + totalEVPowerkW * 8) * 10) / 10;
  const co2AvoidedKg = Math.round(todayTotalkWh * APP_CONFIG.CO2_FACTOR_KG_PER_KWH * 10) / 10;
  // Cost savings = solar self-consumed (not exported) * base tariff
  const solarSelfConsumedkWh = Math.max(0, Math.round((todayTotalkWh - gridExportkW * 8) * 10) / 10);
  const todayCostSavingsINR = Math.round(solarSelfConsumedkWh * APP_CONFIG.GRID_BASE_TARIFF_INR * 10) / 10;

  // Final Objects
  const solar: SolarData = {
    currentGenerationkW: solarGenkW,
    predictedGenerationkW: predictedSolarGenkW,
    todayTotalkWh,
    percentageChange: scenario === 'CLOUD_SPIKE' ? -58.4 : +14.2,
    peakCapacitykW: APP_CONFIG.SOLAR_PEAK_CAPACITY_KW,
    efficiencyPercentage: Math.round(92 - effectiveCloudCover * 0.2),
    isSimulated: true, // EXPLICIT SIMULATED LABEL
  };

  const demand: DemandData = {
    currentDemandkW: buildingDemandkW,
    totalSiteLoadkW,
    todayTotalConsumptionkWh: todayDemandkWh,
    percentageChange: scenario === 'DEMAND_SURGE' ? +48.5 : -3.8,
    peakDemandkW: scenario === 'DEMAND_SURGE' ? 6.8 : 5.4,
    baseLoadkW: 1.8,
    isSimulated: true, // EXPLICIT SIMULATED LABEL
  };

  const battery: BatteryData = {
    socPercentage,
    chargingState,
    currentPowerkW,
    chargeRatekW,
    dischargeRatekW,
    availableCapacitykWh,
    maxCapacitykWh: APP_CONFIG.BATTERY_MAX_CAPACITY_KWH,
    timeToFullOrEmptyMinutes,
    healthPercentage: 97.4,
    operatingMode: scenario === 'CLOUD_SPIKE' ? 'Backup-Reserve' : 'Self-Consumption',
    temperatureC: 28.5,
    isSimulated: true, // EXPLICIT SIMULATED LABEL
  };

  const ev: EVData = {
    totalStations: 4,
    occupiedStations: isEVInflux ? 4 : 3,
    totalPowerkW: totalEVPowerkW,
    todayEnergyDeliveredkWh: isEVInflux ? 34.2 : 18.6,
    vehicles: evList,
    isSimulated: true, // EXPLICIT SIMULATED LABEL
  };

  const renewable: RenewableContributionData = {
    renewablePercentage,
    gridPercentage,
    gridImportkW,
    gridExportkW,
    co2AvoidedKg,
    todayCostSavingsINR,
    gridTariffINRPerkWh: APP_CONFIG.GRID_BASE_TARIFF_INR,
    isSimulated: true, // EXPLICIT SIMULATED LABEL
    assumptions: 'Estimated renewable contribution. Simulation assumes battery is charged primarily from solar surplus.',
  };

  return { solar, demand, battery, ev, renewable };
};

/**
 * PREDICTIVE FORECAST ENGINE (PHYSICS-INFORMED BASELINE MODEL)
 * Generates 24 hourly points combining diurnal solar curve & live Open-Meteo weather forecast parameters
 */
export const generate24HourForecast = (
  weather: WeatherData,
  scenario: DemoScenarioId = 'NORMAL'
): ForecastItem[] => {
  const forecastItems: ForecastItem[] = [];
  const startHour = new Date().getHours();

  for (let i = 0; i < 24; i++) {
    const targetHour = (startHour + i) % 24;
    const hourLabel = targetHour === 0 ? '12 AM' : targetHour === 12 ? '12 PM' : targetHour > 12 ? `${targetHour - 12} PM` : `${targetHour} AM`;
    
    // Genuine Open-Meteo hourly cloud cover forecast point
    let cloudCoverPercent = (weather.hourlyCloudCover && weather.hourlyCloudCover[i] !== undefined)
      ? weather.hourlyCloudCover[i]
      : weather.cloudCover;
    
    if (scenario === 'CLOUD_SPIKE' && i < 6) {
      cloudCoverPercent = Math.max(85, cloudCoverPercent);
    }

    let solarVal = 0;
    if (targetHour >= 6 && targetHour <= 18) {
      solarVal = APP_CONFIG.SOLAR_PEAK_CAPACITY_KW * Math.sin(((targetHour - 6) / 12) * Math.PI);
    }
    
    let solarMultiplier = 1 - (cloudCoverPercent / 100) * 0.7;
    if (scenario === 'CLOUD_SPIKE' && i < 6) {
      solarMultiplier *= 0.35;
    }

    solarVal = Math.max(0, Math.round(solarVal * solarMultiplier * 100) / 100);

    let demandVal = 2.4;
    if ((targetHour >= 9 && targetHour <= 11) || (targetHour >= 18 && targetHour <= 21)) {
      demandVal = 4.4;
    } else if (targetHour >= 0 && targetHour <= 5) {
      demandVal = 1.4;
    }

    if (scenario === 'DEMAND_SURGE' && i < 5) {
      demandVal = 6.2;
    }

    demandVal = Math.round(demandVal * 100) / 100;

    let socVal = 50;
    if (targetHour >= 12 && targetHour <= 16) socVal = 90;
    else if (targetHour >= 19 && targetHour <= 22) socVal = 40;
    else if (targetHour >= 1 && targetHour <= 6) socVal = 30;

    if (scenario === 'CLOUD_SPIKE' && i < 6) {
      socVal = Math.max(20, socVal - 25);
    }

    const renewAvail = Math.min(100, Math.round((solarVal / (demandVal || 1)) * 100));

    forecastItems.push({
      timestamp: new Date(Date.now() + i * 3600 * 1000).toISOString(),
      hourLabel,
      solarGenerationkW: solarVal,
      energyDemandkW: demandVal,
      batterySoc: socVal,
      renewableAvailabilityPercent: renewAvail,
      weatherCondition: cloudCoverPercent > 60 ? 'Cloudy' : cloudCoverPercent > 30 ? 'Partly Cloudy' : 'Sunny',
      cloudCoverPercent,
      isDeficit: demandVal > solarVal,
      isSurplus: solarVal > demandVal,
    });
  }

  return forecastItems;
};

/**
 * 6-HOUR OPERATIONAL TIMELINE GENERATOR ("WHAT HAPPENS NEXT?")
 */
export const generate6HourTimeline = (
  solarGenkW: number,
  demandkW: number,
  batterySoc: number,
  scenario: DemoScenarioId
): TimelineItem[] => {
  const currentHour = new Date().getHours();
  const formatHour = (offset: number) => {
    const h = (currentHour + offset) % 24;
    return `${(h % 12) || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
  };

  if (scenario === 'CLOUD_SPIKE') {
    return [
      { time: formatHour(0), title: 'Cloud Spike Detected', desc: `Solar output dropped to ${solarGenkW} kW due to dense overcast.`, status: 'CRITICAL' },
      { time: formatHour(1), title: 'BESS Discharge Active', desc: `Battery (SoC: ${batterySoc}%) discharging to cover building load deficit (${demandkW} kW).`, status: 'WARNING' },
      { time: formatHour(3), title: 'Battery Reserve Buffer', desc: `BESS SoC drops toward 25%. Grid import fallback prepared.`, status: 'WARNING' },
      { time: formatHour(5), title: 'Cloud Front Clearance', desc: `Irradiance expected to recover. Solar yield ramp up anticipated.`, status: 'OPTIMAL' },
    ];
  }

  if (scenario === 'DEMAND_SURGE') {
    return [
      { time: formatHour(0), title: 'HVAC Demand Surge', desc: `Building consumption spiked to ${demandkW} kW peak load.`, status: 'CRITICAL' },
      { time: formatHour(1), title: 'Grid Import Active', desc: `Solar & BESS combined output insufficient. Buying grid power at ₹${APP_CONFIG.GRID_BASE_TARIFF_INR}/kWh.`, status: 'WARNING' },
      { time: formatHour(3), title: 'Peak Rate Window Warning', desc: `Peak tariff window approaches (₹${APP_CONFIG.GRID_PEAK_TARIFF_INR}/kWh). Load shifting advised.`, status: 'WARNING' },
      { time: formatHour(5), title: 'Load Stabilization', desc: `Building HVAC drops back to baseline occupancy profile.`, status: 'OPTIMAL' },
    ];
  }

  if (scenario === 'EV_INFLUX') {
    return [
      { time: formatHour(0), title: 'EV Fleet Influx', desc: `4 EV charging bays occupied (13.2 kW total EV load).`, status: 'WARNING' },
      { time: formatHour(2), title: 'Solar Peak Support', desc: `Peak solar yield supplying EV-01 & EV-02 charging demands.`, status: 'OPTIMAL' },
      { time: formatHour(4), title: 'EV Fast Charge Complete', desc: `EV-03 Nexon & EV-01 Tesla reach target 90% SoC.`, status: 'OPTIMAL' },
      { time: formatHour(6), title: 'EV Hub Idle Window', desc: `Charging load falls to zero. Excess solar redirected to BESS.`, status: 'NEUTRAL' },
    ];
  }

  // Baseline Default Timeline
  return [
    { time: formatHour(1), title: 'Solar Surplus Window', desc: `Solar generation expected to exceed building demand by ${(Math.max(0.5, solarGenkW - demandkW)).toFixed(1)} kW.`, status: 'OPTIMAL' },
    { time: formatHour(3), title: 'BESS Full Charge Target', desc: `Battery storage projected to reach target 85% SoC.`, status: 'OPTIMAL' },
    { time: formatHour(4), title: 'Solar Output Decline', desc: `Sun position lowers. Storage switches to self-consumption support.`, status: 'NEUTRAL' },
    { time: formatHour(5), title: 'Evening Demand Peak', desc: `Occupancy peak starting. BESS discharging to avoid peak tariff (₹${APP_CONFIG.GRID_PEAK_TARIFF_INR}/kWh).`, status: 'WARNING' },
  ];
};

/**
 * OPTIMIZATION RECOMMENDATIONS GENERATOR (RULE-BASED ENGINE WITH REASONING CHAIN)
 */
export const generateAIRecommendations = (
  solarGenkW: number,
  demandkW: number,
  batterySoc: number,
  cloudCover: number,
  scenario: DemoScenarioId = 'NORMAL'
): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  const netEnergy = solarGenkW - demandkW;

  if (scenario === 'CLOUD_SPIKE') {
    recommendations.push({
      id: 'rec-cloud-1',
      title: 'Emergency BESS Discharge to Support Building Deficit',
      priority: 'HIGH',
      condition: `Cloud cover spiked to ${cloudCover}% causing a ${Math.abs(netEnergy).toFixed(2)} kW solar deficit.`,
      problem: `Building load (${demandkW} kW) exceeds current solar output (${solarGenkW} kW).`,
      action: 'Discharge BESS storage array to cover building load and avoid grid import.',
      expectedImpact: `Estimated grid dependency reduction. Avoids ~₹ ${(APP_CONFIG.BATTERY_MAX_CAPACITY_KWH * 0.5 * APP_CONFIG.GRID_PEAK_TARIFF_INR).toFixed(2)} modeled peak grid cost`,
      reason: `Cloud coverage is currently ${cloudCover}%. Solar output dropped by ~65%.`,
      expectedBenefit: `Avoids peak grid import at ₹ ${APP_CONFIG.GRID_PEAK_TARIFF_INR.toFixed(2)}/kWh using stored clean energy.`,
      category: 'Battery Management',
      applied: false,
      timestamp: 'Just now',
      actionType: 'CHARGE_BATTERY',
    });
  }

  if (scenario === 'DEMAND_SURGE') {
    recommendations.push({
      id: 'rec-surge-1',
      title: 'Shift Flexible HVAC Load During Demand Surge',
      priority: 'HIGH',
      condition: `Building load spiked to ${demandkW} kW (exceeding baseline by 150%).`,
      problem: `Transformer load threshold approached. High grid import cost at peak rate.`,
      action: 'Initiate automated load shed on non-critical HVAC zones for 45 minutes.',
      expectedImpact: '↓ 1.8 kW peak building load, ↓ 22% grid import cost',
      reason: `Building demand spike of ${demandkW} kW exceeds current generation.`,
      expectedBenefit: `Prevents peak demand surcharge and stabilizes site load.`,
      category: 'Grid Savings',
      applied: false,
      timestamp: 'Just now',
      actionType: 'SHIFT_LOAD',
    });
  }

  if (netEnergy > 1.2 && batterySoc < 90) {
    recommendations.push({
      id: 'rec-1',
      title: 'Direct Solar Surplus to Battery Storage',
      priority: 'HIGH',
      condition: `Solar generation (${solarGenkW} kW) exceeds building load (${demandkW} kW) by ${(netEnergy).toFixed(2)} kW.`,
      problem: `Unused clean solar generation would be exported to grid at low feed-in rate.`,
      action: 'Direct 3.5 kW solar surplus to charge BESS storage array.',
      expectedImpact: '↓ 14% evening grid dependency, ↑ 9% renewable self-consumption',
      reason: `Solar generation (${solarGenkW} kW) exceeds building load (${demandkW} kW) by ${(netEnergy).toFixed(2)} kW.`,
      expectedBenefit: `Avoid grid export at low feed-in tariffs and store power for peak evening demand.`,
      category: 'Battery Management',
      applied: false,
      timestamp: '2 mins ago',
      actionType: 'CHARGE_BATTERY',
    });
  }

  if (solarGenkW > 3.0) {
    recommendations.push({
      id: 'rec-2',
      title: 'Schedule Fast EV Charging Window',
      priority: 'HIGH',
      condition: `High solar irradiance detected (${solarGenkW} kW output). EV-02 is waiting.`,
      problem: `Waiting EV vehicle delaying charging until evening peak rate window.`,
      action: 'Dispatch 3.3 kW solar surplus directly to EV-02 charging bay.',
      expectedImpact: `Estimated solar-powered EV charge. Avoids grid import (~₹ ${(3.3 * APP_CONFIG.GRID_BASE_TARIFF_INR).toFixed(2)} modeled saving)`,
      reason: `High solar irradiance detected (${solarGenkW} kW output). EV-02 (Ioniq 5) is waiting for charge.`,
      expectedBenefit: `Zero-Carbon EV charging with estimated savings vs base tariff (₹ ${APP_CONFIG.GRID_BASE_TARIFF_INR.toFixed(2)}/kWh).`,
      category: 'EV Scheduling',
      applied: false,
      timestamp: '5 mins ago',
      actionType: 'SCHEDULE_EV',
    });
  }

  recommendations.push({
    id: 'rec-4',
    title: 'Peak Demand Load Shifting (6 PM - 9 PM)',
    priority: 'LOW',
    condition: `Evening peak tariff window approaches (6:00 PM - 9:00 PM).`,
    problem: `Grid tariff increases to peak rate of ₹ ${APP_CONFIG.GRID_PEAK_TARIFF_INR.toFixed(2)}/kWh.`,
    action: 'Pre-charge BESS and schedule non-critical load shifting.',
    expectedImpact: '↓ 30% peak grid tariff expenditure during peak window',
    reason: `Evening grid tariffs increase to peak rate of ₹ ${APP_CONFIG.GRID_PEAK_TARIFF_INR.toFixed(2)}/kWh during peak hours.`,
    expectedBenefit: `Reduces peak grid dependency by switching HVAC load during peak rate window (₹ ${APP_CONFIG.GRID_PEAK_TARIFF_INR.toFixed(2)}/kWh).`,
    category: 'Grid Savings',
    applied: false,
    timestamp: '10 mins ago',
    actionType: 'SHIFT_LOAD',
  });

  return recommendations;
};

/**
 * LIVE ALERTS SYSTEM
 */
export const generateLiveAlerts = (
  solarGenkW: number,
  demandkW: number,
  batterySoc: number,
  isApiOffline: boolean,
  scenario: DemoScenarioId = 'NORMAL'
): AlertItem[] => {
  const alerts: AlertItem[] = [];
  const now = new Date().toLocaleTimeString();

  if (scenario === 'CLOUD_SPIKE') {
    alerts.push({
      id: 'alt-cloud-spike',
      severity: 'WARNING',
      title: 'Cloud Cover Spike — Solar Output Reduced by 65%',
      message: `Dense cloud cover front detected. Solar output dropped to ${solarGenkW} kW. BESS reserve dispatching automatically.`,
      timestamp: now,
      category: 'Weather',
      read: false,
    });
  }

  if (scenario === 'DEMAND_SURGE') {
    alerts.push({
      id: 'alt-demand-surge',
      severity: 'CRITICAL',
      title: 'Building Demand Surge Alert — Peak 6.2 kW',
      message: `Consumption spike at ${demandkW} kW. Grid import active to prevent site overload.`,
      timestamp: now,
      category: 'Grid',
      read: false,
    });
  }

  if (scenario === 'EV_INFLUX') {
    alerts.push({
      id: 'alt-ev-influx',
      severity: 'INFO',
      title: 'EV Fleet Influx — 4 Bays Occupied (13.2 kW Load)',
      message: 'All 4 simulated charging bays active. Solar surplus & BESS optimizing charge allocation.',
      timestamp: now,
      category: 'EV',
      read: false,
    });
  }

  if (isApiOffline) {
    alerts.push({
      id: 'alt-api-offline',
      severity: 'WARNING',
      title: 'Weather API Offline - Using Cached State',
      message: 'Unable to reach Open-Meteo weather endpoint. Showing last valid recorded data.',
      timestamp: now,
      category: 'API',
      read: false,
    });
  }

  if (batterySoc < 20) {
    alerts.push({
      id: 'alt-batt-low',
      severity: 'CRITICAL',
      title: 'Battery Reserve Low',
      message: `State of Charge is at ${batterySoc}%. Minimum reserve threshold is 15%.`,
      timestamp: now,
      category: 'Battery',
      read: false,
    });
  }

  if (solarGenkW > demandkW * 1.3) {
    alerts.push({
      id: 'alt-solar-surplus',
      severity: 'INFO',
      title: 'Solar Generation Surplus Detected',
      message: `Solar generating ${solarGenkW} kW vs building load ${demandkW} kW. Clean energy surplus available.`,
      timestamp: now,
      category: 'Solar',
      read: false,
    });
  }

  return alerts;
};

/**
 * DATA SOURCES AUDIT MANIFEST
 * Explicitly separates LIVE API vs SIMULATED / ADAPTER statuses
 */
export const getInitialDataSources = (isApiOffline: boolean): DataSourceInfo[] => {
  return [
    {
      id: 'ds-weather',
      name: 'Open-Meteo Weather & Radiation API',
      type: 'LIVE_API', // GENUINELY LIVE API
      status: isApiOffline ? 'DEGRADED' : 'CONNECTED',
      lastFetchTime: new Date().toLocaleTimeString(),
      endpoint: 'https://api.open-meteo.com/v1/forecast',
      latencyInfo: 'Live API / Response Received',
      details: 'Genuinely live temperature, humidity, cloud cover, wind speed, and solar irradiance (W/m²)',
    },
    {
      id: 'ds-solar',
      name: 'Solar Generation Model (Simulated)',
      type: 'DEMO_SIMULATED', // SIMULATED
      status: 'INTEGRATION_READY',
      lastFetchTime: new Date().toLocaleTimeString(),
      endpoint: 'Source: Software Simulation Model',
      latencyInfo: 'N/A (Simulated)',
      details: 'Simulated solar generation model driven by live Open-Meteo solar irradiance and system parameters.',
    },
    {
      id: 'ds-demand',
      name: 'Building Energy Meter (Simulated)',
      type: 'DEMO_SIMULATED', // SIMULATED
      status: 'INTEGRATION_READY',
      lastFetchTime: new Date().toLocaleTimeString(),
      endpoint: 'Source: Software Simulation Model',
      latencyInfo: 'N/A (Simulated)',
      details: 'Simulated building electricity demand model used by the digital twin.',
    },
    {
      id: 'ds-ml',
      name: 'Forecast & Optimization Engine',
      type: 'ML_ADAPTER', // ADAPTER
      status: 'INTEGRATION_READY',
      lastFetchTime: new Date().toLocaleTimeString(),
      endpoint: 'Source: Rule-Based Engine & Open-Meteo REST API',
      latencyInfo: 'N/A (Integration Ready)',
      details: 'Software forecasting and rule-based optimization engine used to analyze system state and generate energy recommendations.',
    },
  ];
};
