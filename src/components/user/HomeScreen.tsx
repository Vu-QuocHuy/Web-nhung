import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Sun,
  Sprout,
  Waves,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  History,
} from 'lucide-react';
import { sensorService } from '../../services/sensor.service';
import { deviceService } from '../../services/device.service';
import { alertService } from '../../services/alert.service';
import { scheduleService } from '../../services/schedule.service';
import { toast } from 'sonner';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    waterLevel: 0,
    light: 0,
    lastUpdate: new Date(),
  });
  const [systemStats, setSystemStats] = useState({
    devicesOnline: 0,
    totalDevices: 8,
    activeSchedules: 0,
    activeAlerts: 0,
  });

  const fetchData = async () => {
    try {
      // Fetch sensor data
      const latestData = await sensorService.getLatest();
      setSensorData({
        temperature: latestData.temperature ?? 0,
        humidity: latestData.humidity ?? 0,
        soilMoisture: latestData.soilMoisture ?? 0,
        waterLevel: latestData.waterLevel ?? 0,
        light: latestData.light ?? 0,
        lastUpdate: new Date(latestData.timestamp || Date.now()),
      });

      // Fetch device status
      const deviceStatus = await deviceService.getStatus();
      const onlineDevices = Object.values(deviceStatus).filter(
        (status) => status === 'ON' || status === 'AUTO'
      ).length;

      // Fetch schedules
      const schedules = await scheduleService.getAll();
      const activeSchedules = schedules.filter((s) => s.enabled).length;

      // Fetch unread alerts
      const unreadAlerts = await alertService.getUnread();

      setSystemStats({
        devicesOnline: onlineDevices,
        totalDevices: Object.keys(deviceStatus).length || 8,
        activeSchedules,
        activeAlerts: unreadAlerts.length,
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const statCards = [
    {
      label: 'Nhiệt độ',
      value: loading || sensorData.temperature === undefined || sensorData.temperature === null
        ? '...'
        : `${Number(sensorData.temperature).toFixed(1)}°C`,
      icon: Thermometer,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Độ ẩm không khí',
      value: loading || sensorData.humidity === undefined || sensorData.humidity === null
        ? '...'
        : `${Number(sensorData.humidity).toFixed(1)}%`,
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Độ ẩm đất',
      value: loading || sensorData.soilMoisture === undefined || sensorData.soilMoisture === null
        ? '...'
        : `${Number(sensorData.soilMoisture).toFixed(1)}%`,
      icon: Sprout,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Mực nước',
      value: loading || sensorData.waterLevel === undefined || sensorData.waterLevel === null
        ? '...'
        : `${Number(sensorData.waterLevel).toFixed(1)} cm`,
      icon: Waves,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      label: 'Ánh sáng',
      value: loading || sensorData.light === undefined || sensorData.light === null
        ? '...'
        : `${Math.round(Number(sensorData.light))}%`,
      icon: Sun,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 text-lg font-semibold leading-tight">Trang chủ</h1>
            <p className="text-gray-500">
              Cập nhật lúc: {sensorData.lastUpdate.toLocaleTimeString('vi-VN')}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
            />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-green-600" />
            <h2 className="text-gray-900">Trạng thái hệ thống</h2>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1">Hoạt động</div>
              <div className="text-gray-600">Hệ thống</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {loading ? '...' : `${systemStats.devicesOnline}/${systemStats.totalDevices}`}
              </div>
              <div className="text-gray-600">Thiết bị bật</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {loading ? '...' : systemStats.activeSchedules}
              </div>
              <div className="text-gray-600">Lịch trình</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {loading ? '...' : systemStats.activeAlerts}
              </div>
              <div className="text-gray-600">Cảnh báo</div>
            </div>
          </div>
        </div>

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.bgColor} p-4 rounded-xl`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-gray-600 mb-2">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <div className="bg-blue-100 p-4 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Droplets className="w-8 h-8 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">Bơm nước</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group">
              <div className="bg-green-100 p-4 rounded-xl group-hover:bg-green-200 transition-colors">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <span className="font-medium text-gray-700">Quạt</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all group">
              <div className="bg-yellow-100 p-4 rounded-xl group-hover:bg-yellow-200 transition-colors">
                <Sun className="w-8 h-8 text-yellow-600" />
              </div>
              <span className="font-medium text-gray-700">Đèn</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
              <div className="bg-purple-100 p-4 rounded-xl group-hover:bg-purple-200 transition-colors">
                <History className="w-8 h-8 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">Lịch sử</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}