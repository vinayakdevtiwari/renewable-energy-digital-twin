import type { ForecastItem, AIRecommendation } from '../types/energy';

/**
 * ML INTEGRATION SERVICE
 * Provides modular adapters for future external ML backends:
 * - GET /api/forecast
 * - GET /api/recommendations
 * - GET /api/energy-status
 */

export interface CustomMlPayload {
  timestamp: string;
  solar_generation: number;
  energy_demand: number;
  battery_soc: number;
  confidence: number;
  recommendation_title?: string;
  recommendation_priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

class MlIntegrationService {
  private customForecastData: ForecastItem[] | null = null;
  private customRecommendations: AIRecommendation[] | null = null;
  private isCustomMlActive: boolean = false;

  public setCustomMlData(forecast: ForecastItem[], recommendations: AIRecommendation[]) {
    this.customForecastData = forecast;
    this.customRecommendations = recommendations;
    this.isCustomMlActive = true;
  }

  public resetToDefault() {
    this.customForecastData = null;
    this.customRecommendations = null;
    this.isCustomMlActive = false;
  }

  public isUsingCustomMl(): boolean {
    return this.isCustomMlActive;
  }

  public getForecast(): ForecastItem[] | null {
    return this.customForecastData;
  }

  public getRecommendations(): AIRecommendation[] | null {
    return this.customRecommendations;
  }
}

export const mlIntegrationService = new MlIntegrationService();
