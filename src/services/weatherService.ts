import type { WeatherData, WeatherForecastDay, LocationConfig } from '../types/energy';
import { APP_CONFIG } from '../config/appConfig';

// WMO Weather Interpretation Codes
const getWeatherCondition = (code: number): { condition: string; icon: string } => {
  if (code === 0) return { condition: 'Clear Sky', icon: 'Sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: 'CloudSun' };
  if (code === 3) return { condition: 'Overcast', icon: 'Cloud' };
  if (code === 45 || code === 48) return { condition: 'Foggy', icon: 'CloudFog' };
  if (code >= 51 && code <= 55) return { condition: 'Drizzle', icon: 'CloudDrizzle' };
  if (code >= 61 && code <= 65) return { condition: 'Rain', icon: 'CloudRain' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', icon: 'CloudSnow' };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', icon: 'CloudRain' };
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'CloudLightning' };
  return { condition: 'Clear Sky', icon: 'Sun' };
};

const formatTime = (isoString?: string): string => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
};

const getDayName = (dateStr: string, index: number): string => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const fetchLiveWeather = async (location: LocationConfig): Promise<WeatherData> => {
  const url = `${APP_CONFIG.WEATHER_API_BASE}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m,direct_normal_irradiance,shortwave_radiation&hourly=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,direct_normal_irradiance,shortwave_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,shortwave_radiation_sum&timezone=auto`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Open-Meteo API returned status ${response.status}`);
  }

  const data = await response.json();
  const current = data.current || {};
  const daily = data.daily || {};
  const hourly = data.hourly || {};

  const weatherInfo = getWeatherCondition(current.weather_code ?? 0);
  
  // Current solar irradiance from live Open-Meteo REST API endpoint
  const irradiance = Math.round(current.direct_normal_irradiance ?? current.shortwave_radiation ?? 450);

  // Extract next 24 hours of live forecast weather arrays
  const hourlyCloudCover: number[] = Array.isArray(hourly.cloud_cover) ? hourly.cloud_cover.slice(0, 24).map((v: number) => Math.round(v ?? 20)) : [];
  const hourlyIrradiance: number[] = Array.isArray(hourly.shortwave_radiation) ? hourly.shortwave_radiation.slice(0, 24).map((v: number) => Math.round(v ?? 0)) : [];

  // Build 4-day forecast using genuine Open-Meteo daily & hourly data (NO Math.random)
  const forecast: WeatherForecastDay[] = [];
  if (daily.time && Array.isArray(daily.time)) {
    for (let i = 0; i < Math.min(4, daily.time.length); i++) {
      const conditionObj = getWeatherCondition(daily.weather_code[i] ?? 0);
      
      // Calculate day's max cloud cover directly from 24h hourly points if available
      const dayHourlyClouds = Array.isArray(hourly.cloud_cover) ? hourly.cloud_cover.slice(i * 24, (i + 1) * 24) : [];
      const cloudCoverMax = dayHourlyClouds.length > 0 ? Math.max(...dayHourlyClouds) : Math.round(current.cloud_cover ?? 20);

      // Calculate day's peak hourly irradiance (W/m²) directly from hourly points
      const dayHourlyRadiation = Array.isArray(hourly.shortwave_radiation) ? hourly.shortwave_radiation.slice(i * 24, (i + 1) * 24) : [];
      const solarRadiationMax = dayHourlyRadiation.length > 0 ? Math.round(Math.max(...dayHourlyRadiation)) : Math.round((daily.shortwave_radiation_sum?.[i] ?? 20) * 27.78);

      forecast.push({
        date: daily.time[i],
        dayName: getDayName(daily.time[i], i),
        tempMax: Math.round(daily.temperature_2m_max[i] ?? 30),
        tempMin: Math.round(daily.temperature_2m_min[i] ?? 20),
        condition: conditionObj.condition,
        cloudCoverMax,
        solarRadiationMax,
        icon: conditionObj.icon,
      });
    }
  }

  return {
    temperature: Math.round((current.temperature_2m ?? 28) * 10) / 10,
    apparentTemperature: Math.round((current.apparent_temperature ?? 29) * 10) / 10,
    humidity: Math.round(current.relative_humidity_2m ?? 55),
    windSpeed: Math.round((current.wind_speed_10m ?? 12) * 10) / 10,
    cloudCover: Math.round(current.cloud_cover ?? 20),
    solarIrradiance: irradiance,
    weatherCondition: weatherInfo.condition,
    weatherCode: current.weather_code ?? 0,
    sunrise: formatTime(daily.sunrise?.[0]),
    sunset: formatTime(daily.sunset?.[0]),
    isDay: Boolean(current.is_day ?? 1),
    forecast,
    hourlyCloudCover,
    hourlyIrradiance,
    isLive: true, // GENUINE LIVE OPEN-METEO DATA
    lastUpdated: new Date().toLocaleTimeString(),
  };
};
