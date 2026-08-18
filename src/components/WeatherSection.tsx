import React from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  Zap,
  CheckCircle2
} from 'lucide-react';
import type { WeatherData } from '../types/energy';

interface WeatherSectionProps {
  weather: WeatherData;
  locationName: string;
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({ weather, locationName }) => {
  const getWeatherIcon = (iconName: string, size: string = "h-8 w-8") => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={`${size} text-amber-400`} />;
      case 'CloudSun':
        return <CloudSun className={`${size} text-amber-300`} />;
      case 'Cloud':
        return <Cloud className={`${size} text-slate-300`} />;
      case 'CloudRain':
        return <CloudRain className={`${size} text-cyan-400`} />;
      case 'CloudSnow':
        return <CloudSnow className={`${size} text-blue-200`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${size} text-amber-400`} />;
      default:
        return <Sun className={`${size} text-amber-400`} />;
    }
  };

  // Solar impact heuristic based on cloud cover
  let solarImpactText = 'Optimal solar irradiance. Solar panels operating near maximum potential efficiency.';
  let solarImpactBadge = 'HIGH EFFICIENCY';
  let solarImpactColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

  if (weather.cloudCover > 60) {
    solarImpactText = 'High cloud coverage detected. Solar generation expected to decrease by ~40-60%.';
    solarImpactBadge = 'REDUCED YIELD';
    solarImpactColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  } else if (weather.cloudCover > 30) {
    solarImpactText = 'Moderate cloud scattering. Intermittent solar flux variations expected.';
    solarImpactBadge = 'MODERATE YIELD';
    solarImpactColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Live Meteorological & Solar Irradiance</h2>
            <p className="text-xs text-slate-400">Real-time weather parameters influencing solar generation models</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>LIVE OPEN-METEO API</span>
          </span>
          <span className="text-xs text-slate-500">{locationName}</span>
        </div>
      </div>

      {/* Main Grid: Current Weather + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Current Weather Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Weather</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {weather.temperature}°C
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Feels like <strong className="text-slate-200">{weather.apparentTemperature}°C</strong>
              </div>
            </div>
            {getWeatherIcon(weather.cloudCover > 50 ? 'Cloud' : weather.cloudCover > 20 ? 'CloudSun' : 'Sun', 'h-12 w-12')}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400">{weather.weatherCondition}</span>
            <span className="text-slate-500">Daytime: {weather.isDay ? 'Yes ☀️' : 'No 🌙'}</span>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:col-span-2">
          
          {/* Solar Irradiance */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Solar Irradiance</span>
              <Zap className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white">{weather.solarIrradiance} <span className="text-xs font-normal text-amber-400">W/m²</span></div>
            <span className="text-[10px] text-slate-500">Direct Normal Flux</span>
          </div>

          {/* Cloud Cover */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Cloud Cover</span>
              <Cloud className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <div className="text-xl font-bold text-white">{weather.cloudCover}%</div>
            <span className="text-[10px] text-slate-500">Sky Coverage</span>
          </div>

          {/* Wind Speed */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Wind Speed</span>
              <Wind className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white">{weather.windSpeed} <span className="text-xs font-normal text-cyan-400">km/h</span></div>
            <span className="text-[10px] text-slate-500">10m Surface Wind</span>
          </div>

          {/* Humidity */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Humidity</span>
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white">{weather.humidity}%</div>
            <span className="text-[10px] text-slate-500">Relative Humidity</span>
          </div>

          {/* Sunrise */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Sunrise</span>
              <Sunrise className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-base font-bold text-white">{weather.sunrise}</div>
            <span className="text-[10px] text-slate-500">Solar Dawn</span>
          </div>

          {/* Sunset */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Sunset</span>
              <Sunset className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <div className="text-base font-bold text-white">{weather.sunset}</div>
            <span className="text-[10px] text-slate-500">Solar Dusk</span>
          </div>

        </div>
      </div>

      {/* Solar Impact Analysis Box */}
      <div className={`rounded-xl border p-3 mb-6 flex flex-wrap items-center justify-between gap-2 ${solarImpactColor}`}>
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold">{solarImpactText}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase">
          {solarImpactBadge}
        </span>
      </div>

      {/* 4-Day Forecast Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">4-Day Solar & Weather Forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {weather.forecast.map((day, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{day.dayName}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{day.condition}</div>
                <div className="text-xs font-extrabold text-amber-400 mt-1">
                  {day.tempMax}° / <span className="text-slate-500">{day.tempMin}°C</span>
                </div>
              </div>
              <div className="text-right">
                {getWeatherIcon(day.icon, 'h-6 w-6')}
                <div className="text-[9px] text-slate-500 mt-1">Peak: {day.solarRadiationMax} W/m²</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
