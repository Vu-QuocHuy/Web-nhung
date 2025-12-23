import React, { useState, useEffect } from 'react';
import { Filter, CheckCircle, XCircle, User, Settings, Zap, RefreshCw } from 'lucide-react';
import { activityLogService, ActivityLog } from '../../services/activityLog.service';
import { toast } from 'sonner';

interface ActivityLogsScreenProps {
  onBack: () => void;
}

export default function ActivityLogsScreen({ onBack }: ActivityLogsScreenProps) {
  const [filterType, setFilterType] = useState<'all' | 'user' | 'device' | 'threshold' | 'schedule'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterType !== 'all') {
        params.action = filterType;
      }
      const response = await activityLogService.getAll(params);
      setLogs(response.data);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      toast.error('Không thể tải lịch sử hoạt động: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLogType = (action: string): 'user' | 'device' | 'threshold' | 'schedule' => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('user') || lowerAction.includes('người dùng')) return 'user';
    if (lowerAction.includes('device') || lowerAction.includes('thiết bị')) return 'device';
    if (lowerAction.includes('threshold') || lowerAction.includes('ngưỡng')) return 'threshold';
    if (lowerAction.includes('schedule') || lowerAction.includes('lịch trình')) return 'schedule';
    return 'user';
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    const logType = getLogType(log.action);
    return logType === filterType;
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      user: User,
      device: Zap,
      threshold: Settings,
      schedule: Filter,
    };
    return icons[type as keyof typeof icons] || User;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      user: 'Người dùng',
      device: 'Thiết bị',
      threshold: 'Ngưỡng',
      schedule: 'Lịch trình',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      user: 'bg-blue-50 text-blue-600',
      device: 'bg-purple-50 text-purple-600',
      threshold: 'bg-orange-50 text-orange-600',
      schedule: 'bg-green-50 text-green-600',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-1">Lịch sử hoạt động</h1>
            <p className="text-gray-500">Theo dõi tất cả các hoạt động trong hệ thống</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
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
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">Lọc theo:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('user')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Người dùng
            </button>
            <button
              onClick={() => setFilterType('device')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'device'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Thiết bị
            </button>
            <button
              onClick={() => setFilterType('threshold')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'threshold'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ngưỡng
            </button>
            <button
              onClick={() => setFilterType('schedule')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'schedule'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lịch trình
            </button>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Người thực hiện
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hành động
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Đối tượng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không có nhật ký hoạt động nào
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const logType = getLogType(log.action);
                    const TypeIcon = getTypeIcon(logType);
                    return (
                      <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(logType)}`}>
                            <TypeIcon className="w-4 h-4" />
                            {getTypeLabel(logType)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{log.username || 'System'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{log.action}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600">{log.target}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">{formatTime(log.timestamp)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.status === 'success' ? (
                            <div className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium">Thành công</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-red-600">
                              <XCircle className="w-5 h-5" />
                              <span className="font-medium">Thất bại</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}