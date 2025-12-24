import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Droplets,
  Fan,
  Lightbulb,
  RotateCcw,
  Zap,
} from "lucide-react";
import { deviceService } from "../../services/device.service";
import { toast } from "sonner";

type DeviceStatus = "ON" | "OFF" | "AUTO";

interface Device {
  id: string;
  name: string;
  displayName: string;
  icon: any;
  status: DeviceStatus;
  color: string;
}

type DeviceConfigEntry = {
  id: string;
  name: string;
  displayName: string;
  icon: any;
  color: string;
};

const DEVICE_CONFIG: Record<string, DeviceConfigEntry> = {
  pump: {
    id: "pump",
    name: "pump",
    displayName: "Bơm nước",
      icon: Droplets,
    color: "blue",
    },
  fan: {
    id: "fan",
    name: "fan",
    displayName: "Quạt",
      icon: Fan,
    color: "cyan",
    },
  light: {
    id: "light",
    name: "light",
    displayName: "Đèn (Tất cả)",
      icon: Lightbulb,
    color: "yellow",
    },
  servo_door: {
    id: "servo_door",
    name: "servo_door",
    displayName: "Cửa (Servo)",
    icon: RotateCcw,
    color: "purple",
    },
  servo_feed: {
    id: "servo_feed",
    name: "servo_feed",
    displayName: "Cho ăn (Servo)",
    icon: RotateCcw,
    color: "purple",
  },
  led_farm: {
    id: "led_farm",
    name: "led_farm",
    displayName: "Đèn trồng cây",
    icon: Zap,
    color: "green",
    },
  led_animal: {
    id: "led_animal",
    name: "led_animal",
    displayName: "Đèn khu vật nuôi",
    icon: Zap,
    color: "orange",
    },
  led_hallway: {
    id: "led_hallway",
    name: "led_hallway",
    displayName: "Đèn hành lang",
    icon: Zap,
    color: "pink",
  },
};

export default function DeviceControlScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([] as Device[]);

  const fetchDeviceStatus = async () => {
    try {
      const statusData = await deviceService.getStatus();

      const entries = Object.entries(statusData ?? {}) as [
        string,
        DeviceStatus
      ][];

      const devicesWithStatus: Device[] = entries.map(
        ([deviceName, status]) => {
          const config =
            DEVICE_CONFIG[deviceName as keyof typeof DEVICE_CONFIG];
          if (config) {
            return {
              ...config,
              status,
            } as Device;
          }
          return {
            id: deviceName,
            name: deviceName,
            displayName: deviceName,
            icon: Zap,
            status,
            color: "gray",
          };
        }
      );

      setDevices(devicesWithStatus);
    } catch (error: any) {
      console.error("Error fetching device status:", error);
      toast.error(
        "Không thể tải trạng thái thiết bị: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeviceStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeviceStatus();
  };

  const setDeviceStatus = async (device: Device, targetStatus: DeviceStatus) => {
    try {
      await deviceService.controlDevice({
        deviceName: device.name as any,
        action: targetStatus,
        value: 0,
      });

      setDevices((prev: Device[]) =>
        prev.map((d: Device) =>
          d.id === device.id ? { ...d, status: targetStatus } : d
        )
      );

      const actionLabel =
        targetStatus === "ON"
          ? "bật"
          : targetStatus === "OFF"
          ? "tắt"
          : "chuyển sang tự động";

      toast.success(`${device.displayName} đã được ${actionLabel}`);
    } catch (error: any) {
      console.error("Error controlling device:", error);
      toast.error(
        "Không thể điều khiển thiết bị: " +
          (error.response?.data?.message || error.message)
    );
    }
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<
      string,
      { icon: string; bg: string; border: string }
    > = {
      blue: {
        icon: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      cyan: {
        icon: "text-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
      },
      yellow: {
        icon: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
      },
      red: { icon: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
      green: {
        icon: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      },
      purple: {
        icon: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-200",
      },
      orange: {
        icon: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
      },
      pink: {
        icon: "text-pink-600",
        bg: "bg-pink-50",
        border: "border-pink-200",
      },
      gray: {
        icon: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
      },
    };

    return isActive
      ? colorMap[color] || colorMap.gray
      : { icon: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200" };
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900 text-lg font-semibold leading-[44px]">Điều khiển thiết bị</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Đang tải...</div>
          </div>
        ) : (
        <div className="grid grid-cols-4 gap-6">
            {devices.map((device: Device) => {
            const Icon = device.icon;
              const isActive =
                device.status === "ON" || device.status === "AUTO";
              const colors = getColorClasses(device.color, isActive);
              const statusClasses =
                device.status === "AUTO"
                  ? "bg-yellow-100 text-gray-800 border border-yellow-300"
                  : device.status === "ON"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600";
            return (
              <div
                key={device.id}
                  className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} p-6 hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${colors.bg} p-4 rounded-xl`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses}`}>
                      {device.status === "AUTO"
                        ? "Tự động"
                        : device.status === "ON"
                        ? "Hoạt động"
                        : "Tắt"}
                  </div>
                </div>

                <div className="mb-4">
                    <div className="text-gray-900 font-medium">
                      {device.displayName}
                    </div>
                </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setDeviceStatus(device, "ON")}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        device.status === "ON"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Bật
                    </button>
                    <button
                      onClick={() => setDeviceStatus(device, "OFF")}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        device.status === "OFF"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Tắt
                    </button>
                <button
                      onClick={() => setDeviceStatus(device, "AUTO")}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        device.status === "AUTO"
                          ? "bg-white border border-yellow-400 text-yellow-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                      Tự động
                </button>
                  </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
