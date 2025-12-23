import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Filter, RefreshCw } from 'lucide-react';
import { alertService, Alert } from '../../services/alert.service';
import { toast } from 'sonner';

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<'all' | 'unresolved'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Alert[]>([]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filter === 'unresolved') {
        params.status = 'active';
      }
      const response = await alertService.getAll(params);
      setNotifications(response.data);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast.error('Không thể tải thông báo: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Đã đánh dấu đã đọc');
    } catch (error: any) {
      toast.error('Không thể đánh dấu đã đọc: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alertService.resolve(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: 'resolved' } : n))
      );
      toast.success('Đã xử lý cảnh báo');
    } catch (error: any) {
      toast.error('Không thể xử lý cảnh báo: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : n.status === 'active'
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getLevelConfig = (type: string) => {
    const configs = {
      critical: {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-l-red-500',
        label: 'Nghiêm trọng',
      },
      warning: {
        icon: AlertTriangle,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-l-orange-500',
        label: 'Cảnh báo',
      },
      info: {
        icon: Info,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-l-blue-500',
        label: 'Thông tin',
      },
    };
    return configs[type as keyof typeof configs] || configs.info;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900">Thông báo</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900 font-medium">Bộ lọc:</span>
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unresolved')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'unresolved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chưa xử lý ({notifications.filter((n) => n.status === 'active').length})
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-600">Đang tải...</div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không có thông báo nào</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const config = getLevelConfig(notification.type);
              const Icon = config.icon;
              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${config.border} border-t border-r border-b border-gray-200 overflow-hidden hover:shadow-md transition-shadow`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`${config.bg} p-3 rounded-xl`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-gray-900 font-medium text-lg">{config.label}</h3>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              notification.type === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : notification.type === 'warning'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {config.label}
                          </span>
                          {notification.status === 'resolved' && (
                            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                              Đã xử lý
                            </span>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                          {notification.status === 'active' && (
                            <button
                              onClick={() => handleResolve(notification._id)}
                              className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium hover:bg-green-200"
                            >
                              Xử lý
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}