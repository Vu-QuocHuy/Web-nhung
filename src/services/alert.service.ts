import apiClient from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export interface Alert {
  _id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  isRead: boolean;
  timestamp: string;
  status?: 'active' | 'resolved';
}

export interface AlertParams {
  status?: 'active' | 'resolved';
  level?: 'info' | 'warning' | 'critical';
  isRead?: boolean;
  limit?: number;
}

export const alertService = {
  async getAll(params?: AlertParams): Promise<{ success: boolean; count: number; data: Alert[] }> {
    const response = await apiClient.get<{ success: boolean; count: number; data: Alert[] }>(
      API_ENDPOINTS.ALERTS.BASE,
      { params }
    );
    return response.data;
  },

  async getUnread(): Promise<Alert[]> {
    const response = await apiClient.get<{ success: boolean; data: Alert[] }>(
      API_ENDPOINTS.ALERTS.UNREAD
    );
    return response.data.data;
  },

  async markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      API_ENDPOINTS.ALERTS.READ(id)
    );
    return response.data;
  },

  async resolve(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      API_ENDPOINTS.ALERTS.RESOLVE(id)
    );
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.ALERTS.BY_ID(id)
    );
    return response.data;
  },
};

