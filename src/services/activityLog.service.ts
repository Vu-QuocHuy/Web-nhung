import apiClient from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export interface ActivityLog {
  _id: string;
  userId: string;
  username?: string;
  action: string;
  target: string;
  status: 'success' | 'failure';
  timestamp: string;
  details?: any;
}

export interface ActivityLogParams {
  userId?: string;
  action?: string;
  status?: 'success' | 'failure';
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export const activityLogService = {
  async getMyLogs(params?: { limit?: number; page?: number }): Promise<ActivityLog[]> {
    const response = await apiClient.get<{ success: boolean; data: ActivityLog[] }>(
      API_ENDPOINTS.ACTIVITY_LOGS.MY_LOGS,
      { params }
    );
    return response.data.data;
  },

  async getAll(params?: ActivityLogParams): Promise<{
    success: boolean;
    count: number;
    totalPages: number;
    currentPage: number;
    data: ActivityLog[];
  }> {
    const response = await apiClient.get<{
      success: boolean;
      count: number;
      totalPages: number;
      currentPage: number;
      data: ActivityLog[];
    }>(API_ENDPOINTS.ACTIVITY_LOGS.BASE, { params });
    return response.data;
  },

  async getStats(params?: { startDate?: string; endDate?: string }): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.ACTIVITY_LOGS.STATS, { params });
    return response.data;
  },
};

