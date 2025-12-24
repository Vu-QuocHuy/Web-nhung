import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, Filter, RefreshCw, Plus, X } from 'lucide-react';
import { alertService, Alert } from '../../services/alert.service';
import { userService, User } from '../../services/user.service';
import { toast } from 'sonner';

export default function AdminNotificationsScreen() {
  const [filter, setFilter] = useState('all' as 'all' | 'unresolved');
  const [severityFilter, setSeverityFilter] = useState('all' as 'all' | 'critical' | 'warning' | 'info');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([] as Alert[]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState([] as User[]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    severity: 'info' as 'info' | 'warning' | 'critical',
    type: 'manual_notice',
    targetAll: true,
    targetUsers: [] as string[],
    data: {},
  });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 20, page };
      if (filter === 'unresolved') {
        params.status = 'active';
      }
      if (severityFilter !== 'all') {
        params.severity = severityFilter;
      }
      const response = await alertService.getAll(params);
      setNotifications(response.data);
      setTotalPages(response.pages || 1);
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
  }, [filter, severityFilter, page]);

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

  const handleDelete = async (id: string) => {
    try {
      await alertService.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Đã xóa cảnh báo');
    } catch (error: any) {
      toast.error('Không thể xóa cảnh báo: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const statusOk = filter === 'all' ? true : n.status === 'active';
    const severityOk = severityFilter === 'all' ? true : (n.severity || 'info') === severityFilter;
    return statusOk && severityOk;
  });

  const formatMessage = (message?: string) => {
    if (!message) return '';
    return message
      .replace(/water_level/gi, 'Mực nước')
      .replace(/soil_moisture/gi, 'Độ ẩm đất')
      .replace(/temperature/gi, 'NNhiệt độ')
      .replace(/humidity/gi, 'Độ ẩm không khí')
      .replace(/light/gi, 'Ánh sáng');
  };

  const formatTime = (notification: Alert) => {
    // Prefer createdAt -> updatedAt -> resolvedAt -> timestamp
    const ts =
      notification.createdAt ||
      notification.updatedAt ||
      notification.resolvedAt ||
      notification.timestamp;

    if (!ts) return '-';

    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) return '-';

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

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchAlerts();
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userService.getAll({ limit: 100 });
      setUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showCreateDialog) {
      fetchUsers();
    }
  }, [showCreateDialog]);

  const handleCreate = async () => {
    if (!newAlert.title || !newAlert.message) {
      toast.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    if (!newAlert.targetAll && newAlert.targetUsers.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người nhận');
      return;
    }
    try {
      setCreating(true);
      await alertService.create({
        title: newAlert.title,
        message: newAlert.message,
        severity: newAlert.severity,
        type: newAlert.type,
        targetAll: newAlert.targetAll,
        targetUsers: newAlert.targetAll ? [] : newAlert.targetUsers,
        data: newAlert.data || {},
      });
      toast.success('Đã tạo thông báo');
      setShowCreateDialog(false);
      setNewAlert({
        title: '',
        message: '',
        severity: 'info',
        type: 'manual_notice',
        targetAll: true,
        targetUsers: [],
        data: {},
      });
      fetchAlerts();
    } catch (error: any) {
      toast.error('Không thể tạo thông báo: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreating(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setNewAlert((prev) => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter((id) => id !== userId)
        : [...prev.targetUsers, userId],
    }));
  };

  const getLevelConfig = (severity: string) => {
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
    return configs[severity as keyof typeof configs] || configs.info;
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900 text-lg font-semibold leading-tight">Thông báo (Admin)</h1>
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
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900 font-medium">Bộ lọc trạng thái:</span>
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unresolved')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'unresolved'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chưa xử lý ({notifications.filter((n) => n.status === 'active').length})
              </button>
            </div>

            <span className="text-gray-900 font-medium ml-4">Mức độ:</span>
            <div className="flex gap-3">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'critical', label: 'Nghiêm trọng' },
                { id: 'warning', label: 'Cảnh báo' },
                { id: 'info', label: 'Thông tin' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSeverityFilter(item.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    severityFilter === item.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo thông báo</span>
            </button>
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
               const config = getLevelConfig(notification.severity || 'info');
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
                          <div className="flex items-center gap-3">
                            <h3 className="text-gray-900 font-medium text-lg">
                              {notification.title || notification.message || config.label}
                            </h3>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium ${
                                notification.status === 'resolved'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {notification.status === 'resolved' ? 'Đã xử lý' : 'Chưa xử lý'}
                            </span>
                          </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                            {formatTime(notification)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                          {formatMessage(notification.message)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                              (notification.severity || 'info') === 'critical'
                              ? 'bg-red-100 text-red-700'
                                : (notification.severity || 'info') === 'warning'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                            {config.label}
                          </span>
                          {notification.status === 'active' && (
                            <button
                              onClick={() => handleResolve(notification._id)}
                              className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium hover:bg-green-200"
                            >
                              Xử lý
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium hover:bg-red-200"
                          >
                            Xóa
                          </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Trang {page} / {totalPages}
              </span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Create Alert Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 text-lg font-semibold">Tạo thông báo</h2>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Tiêu đề</label>
                <input
                  type="text"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nhập tiêu đề"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Nội dung</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Nhập nội dung thông báo"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Mức độ</label>
                <div className="flex gap-3">
                  {[
                    { id: 'critical', label: 'Nghiêm trọng' },
                    { id: 'warning', label: 'Cảnh báo' },
                    { id: 'info', label: 'Thông tin' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setNewAlert({ ...newAlert, severity: item.id as any })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        newAlert.severity === item.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Người nhận</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="targetAll"
                      checked={newAlert.targetAll}
                      onChange={() => setNewAlert({ ...newAlert, targetAll: true, targetUsers: [] })}
                      className="w-4 h-4 text-purple-600"
                    />
                    <label htmlFor="targetAll" className="text-gray-700 cursor-pointer">
                      Gửi cho tất cả người dùng
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="targetSpecific"
                      checked={!newAlert.targetAll}
                      onChange={() => setNewAlert({ ...newAlert, targetAll: false })}
                      className="w-4 h-4 text-purple-600"
                    />
                    <label htmlFor="targetSpecific" className="text-gray-700 cursor-pointer">
                      Chọn người dùng cụ thể
                    </label>
                  </div>
                  {!newAlert.targetAll && (
                    <div className="ml-7 mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {loadingUsers ? (
                        <div className="text-gray-500 text-sm">Đang tải danh sách người dùng...</div>
                      ) : users.length === 0 ? (
                        <div className="text-gray-500 text-sm">Không có người dùng nào</div>
                      ) : (
                        <div className="space-y-2">
                          {users.map((user) => (
                            <div key={user._id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`user-${user._id}`}
                                checked={newAlert.targetUsers.includes(user._id)}
                                onChange={() => toggleUserSelection(user._id)}
                                className="w-4 h-4 text-purple-600 rounded"
                              />
                              <label
                                htmlFor={`user-${user._id}`}
                                className="text-sm text-gray-700 cursor-pointer flex-1"
                              >
                                {user.username} ({user.email})
                                {user.role === 'admin' && (
                                  <span className="ml-2 text-xs text-purple-600">(Admin)</span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  type="button"
                  disabled={creating}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {creating ? 'Đang tạo...' : 'Tạo thông báo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}