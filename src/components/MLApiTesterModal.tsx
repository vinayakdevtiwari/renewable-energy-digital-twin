import React, { useState } from 'react';
import { X, Code2, Play, RotateCcw } from 'lucide-react';
import { mlIntegrationService } from '../services/mlIntegrationService';

interface MLApiTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const MLApiTesterModal: React.FC<MLApiTesterModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(
    {
      endpoint: '/api/forecast',
      timestamp: new Date().toISOString(),
      solar_generation: 6.85,
      energy_demand: 2.10,
      battery_soc: 94,
      confidence: 0.96,
      recommendation_title: "JUDGE TEST: Export Surplus Energy to Grid at Peak Rate",
      recommendation_priority: "HIGH",
      reason: "Custom ML API injection verified successfully during hackathon demonstration.",
      expected_benefit: "Maximized economic return via ₹ 12.50/kWh peak grid export tariff."
    },
    null,
    2
  ));

  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyCustomJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Inject synthetic custom recommendation
      const customRecs = [
        {
          id: `custom-ml-${Date.now()}`,
          title: parsed.recommendation_title || 'Custom ML Optimization',
          priority: (parsed.recommendation_priority as 'HIGH' | 'MEDIUM' | 'LOW') || 'HIGH',
          condition: parsed.reason || 'Provided by external ML backend endpoint.',
          problem: 'External peak grid export rate detected.',
          action: 'Export surplus solar to grid.',
          expectedImpact: parsed.expected_benefit || 'Custom optimized yield.',
          reason: parsed.reason || 'Provided by external ML backend endpoint.',
          expectedBenefit: parsed.expected_benefit || 'Custom optimized yield.',
          category: 'Solar Optimization' as const,
          applied: false,
          timestamp: 'Just now',
          actionType: 'EXPORT_GRID' as const,
        },
      ];

      // Inject custom forecast
      const customForecast = Array.from({ length: 24 }).map((_, i) => ({
        timestamp: new Date(Date.now() + i * 3600 * 1000).toISOString(),
        hourLabel: `${(i + 12) % 12 || 12} ${i >= 12 ? 'PM' : 'AM'}`,
        solarGenerationkW: Math.round((parsed.solar_generation + Math.sin(i / 2) * 2) * 100) / 100,
        energyDemandkW: Math.round((parsed.energy_demand + Math.cos(i / 3) * 0.8) * 100) / 100,
        batterySoc: Math.min(100, Math.max(10, parsed.battery_soc - i * 2)),
        renewableAvailabilityPercent: 88,
        weatherCondition: 'Clear Sky',
        cloudCoverPercent: 15,
        isDeficit: false,
        isSurplus: true,
      }));

      mlIntegrationService.setCustomMlData(customForecast, customRecs);
      onRefreshData();
      setMessage('✅ Custom ML API payload injected into dashboard state successfully!');
    } catch (err) {
      setMessage('❌ Invalid JSON syntax. Please verify formatted JSON string.');
    }
  };

  const handleReset = () => {
    mlIntegrationService.resetToDefault();
    onRefreshData();
    setMessage('🔄 Reset to default Open-Meteo & simulated providers.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">External Forecast & ML API Sandbox</h3>
              <p className="text-xs text-slate-400">Test how external APIs (/api/forecast, /api/recommendations) seamlessly inject into dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Editor */}
        <div className="py-4 space-y-3 flex-1 overflow-y-auto">
          <label className="text-xs font-semibold text-slate-300 block">
            Simulated Backend REST Response JSON (`GET /api/forecast` & `GET /api/recommendations`):
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />

          {message && (
            <div className="text-xs font-medium p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
              {message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCustomJson}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Inject Payload & Update UI</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
