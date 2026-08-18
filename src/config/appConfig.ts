import type { LocationConfig } from '../types/energy';

export const LOCATIONS: LocationConfig[] = [
  {
    id: 'delhi',
    name: 'New Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  },
  {
    id: 'sf',
    name: 'San Francisco',
    country: 'USA',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
  },
];

export const APP_CONFIG = {
  DEFAULT_LOCATION: LOCATIONS[0],
  DEFAULT_REFRESH_INTERVAL: 60, // seconds
  REFRESH_OPTIONS: [10, 30, 60, 120, 300],
  
  // API endpoints
  WEATHER_API_BASE: 'https://api.open-meteo.com/v1/forecast',
  WEATHER_API_KEY: import.meta.env.VITE_WEATHER_API_KEY || '', // optional
  
  // Future Backend API endpoints setup
  ML_FORECAST_ENDPOINT: import.meta.env.VITE_ML_FORECAST_ENDPOINT || '/api/forecast',
  ML_RECOMMENDATIONS_ENDPOINT: import.meta.env.VITE_ML_RECOMMENDATIONS_ENDPOINT || '/api/recommendations',
  ML_ENERGY_STATUS_ENDPOINT: import.meta.env.VITE_ML_ENERGY_STATUS_ENDPOINT || '/api/energy-status',

  // System Specifications
  SOLAR_PEAK_CAPACITY_KW: 8.5,
  BATTERY_MAX_CAPACITY_KWH: 15.0,
  GRID_BASE_TARIFF_INR: 7.50, // ₹ per kWh base rate
  GRID_PEAK_TARIFF_INR: 9.80, // ₹ per kWh peak rate (6 PM - 9 PM)
  CO2_FACTOR_KG_PER_KWH: 0.82, // 0.82 kg CO2 saved per kWh solar generated
};
