import React, { useState } from 'react';
import { User, Mail, Shield, Power, Lock, CheckCircle } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';

interface ProfileScreenProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
  onLogout: () => void;
}

export default function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-12 border-b border-gray-200">
        <div className="flex items-center gap-6">
          <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-12 h-12" />
          </div>
          <div>
            <h1 className="mb-2">{user.name}</h1>
            <p className="text-green-100 text-lg">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-6">Thông tin tài khoản</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">Họ tên</div>
                <div className="text-gray-900 font-medium">{user.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="text-gray-900 font-medium">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">Vai trò</div>
                <div className="text-gray-900 font-medium">
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">Trạng thái</div>
                <div className="text-green-600 font-medium">Đang hoạt động</div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        {!showChangePassword ? (
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium text-lg">Đổi mật khẩu</span>
            </div>
            <span className="text-gray-400 text-2xl">›</span>
          </button>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-6">Đổi mật khẩu</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Mật khẩu cũ
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập mật khẩu cũ"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}