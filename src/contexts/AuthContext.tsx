import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, AuthResponse } from "../services/auth.service";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isJwtExpiredOrNearExpiry = (
    token: string,
    leewaySeconds: number = 30
  ) => {
    try {
      const payloadPart = token.split(".")[1];
      if (!payloadPart) return true;
      const payloadJson = atob(
        payloadPart.replace(/-/g, "+").replace(/_/g, "/")
      );
      const payload = JSON.parse(payloadJson);
      const expSeconds = payload?.exp;
      if (!expSeconds || typeof expSeconds !== "number") return true;
      const nowSeconds = Math.floor(Date.now() / 1000);
      return expSeconds <= nowSeconds + leewaySeconds;
    } catch {
      return true;
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const storedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (storedUser && accessToken) {
        try {
          const userData = JSON.parse(storedUser);

          // If access token is expired (or near expiry), refresh it BEFORE rendering dashboards.
          if (refreshToken && isJwtExpiredOrNearExpiry(accessToken)) {
            try {
              const refreshed = await authService.refreshToken(refreshToken);
              if (refreshed?.accessToken) {
                localStorage.setItem("accessToken", refreshed.accessToken);
              }
            } catch (error) {
              // Refresh failed, clear session
              localStorage.removeItem("user");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              if (!cancelled) setUser(null);
              return;
            }
          }

          if (!cancelled) setUser(userData);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }

      if (!cancelled) setLoading(false);
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login({
        email,
        password,
      });

      // Store tokens
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Store user data
      const userData: User = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        role: response.user.role,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      toast.success(response.message || "Đăng nhập thành công");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      toast.success("Đăng xuất thành công");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
