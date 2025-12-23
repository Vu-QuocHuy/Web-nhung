import apiClient from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterLevel: number;
  light: number;
  timestamp: string;
}

export interface SensorHistoryParams {
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'water_level' | 'light';
  hours?: number;
  limit?: number;
}

export interface SensorHistoryPoint {
  value: number;
  timestamp: string;
}

export const sensorService = {
  async getLatest(): Promise<SensorData> {
    const response = await apiClient.get<{ success: boolean; data: SensorData }>(
      API_ENDPOINTS.SENSORS.LATEST
    );
    return response.data.data;
  },

  async getHistory(params: SensorHistoryParams): Promise<SensorHistoryPoint[]> {
    const response = await apiClient.get<{ success: boolean; data: SensorHistoryPoint[] }>(
      API_ENDPOINTS.SENSORS.HISTORY,
      { params }
    );
    return response.data.data;
  },

  async getAll(params?: { limit?: number; page?: number }): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.SENSORS.BASE, { params });
    return response.data;
  },

  async cleanup(days: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.SENSORS.CLEANUP,
      { params: { days } }
    );
    return response.data;
  },
};

