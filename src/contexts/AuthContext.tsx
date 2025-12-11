import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import api from "@/services/api";
import { env } from "@/config/env";
import { employeeService } from "@/services/employee";
import { toast } from "sonner";

type UserRole = "admin" | "manager" | "employee";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface LoginCredentials {
  email: string;
  password: string;
}

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;

  unreadNotifCount: number;
  markNotificationsAsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Notification sound for real-time alerts
const notificationSound = new Audio('/audio/notification.mp3');

const TOKEN_COOKIE_CANDIDATES = [
  "access_token",
  "access_token_cookie",
  "attendance_access_token",
  "Authorization",
  "authorization",
  "auth_token",
];

const TOKEN_STORAGE_KEYS = ["access_token", "auth_token", "token"] as const;

const extractTokenFromPayload = (payload: any): string | null => {
  if (!payload) {
    return null;
  }

  const candidates = [
    payload.access_token,
    payload.accessToken,
    payload.token,
    payload?.data?.access_token,
    payload?.data?.accessToken,
    payload?.data?.token,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return null;
};

const persistAuthToken = (token: string) => {
  const storages: Storage[] = [];

  try {
    if (typeof localStorage !== "undefined") {
      storages.push(localStorage);
    }
  } catch {
    /* noop */
  }

  try {
    if (typeof sessionStorage !== "undefined") {
      storages.push(sessionStorage);
    }
  } catch {
    /* noop */
  }

  for (const storage of storages) {
    for (const key of TOKEN_STORAGE_KEYS) {
      try {
        storage.setItem(key, token);
      } catch {
        /* noop */
      }
    }
  }
};

const persistTokenFromPayload = (payload: any) => {
  const token = extractTokenFromPayload(payload);
  if (token) {
    persistAuthToken(token);
  }
};

const clearStoredAuthToken = () => {
  const storages: Storage[] = [];

  try {
    if (typeof localStorage !== "undefined") {
      storages.push(localStorage);
    }
  } catch {
    /* noop */
  }

  try {
    if (typeof sessionStorage !== "undefined") {
      storages.push(sessionStorage);
    }
  } catch {
    /* noop */
  }

  for (const storage of storages) {
    for (const key of TOKEN_STORAGE_KEYS) {
      try {
        storage.removeItem(key);
      } catch {
        /* noop */
      }
    }
  }
};

const getAuthTokenFromBrowser = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  // Debug: Log available cookies (without values for security)
  const availableCookies = document.cookie
    .split(';')
    .map(c => c.trim().split('=')[0])
    .filter(Boolean);
  
  if (availableCookies.length > 0) {
    console.debug("[Auth] Available cookie names:", availableCookies);
  } else {
    console.debug("[Auth] No cookies found (may be HTTP-only)");
  }

  for (const candidate of TOKEN_COOKIE_CANDIDATES) {
    const match = document.cookie.match(new RegExp(`${candidate}=([^;]+)`));
    if (match?.[1]) {
      try {
        console.debug(`[Auth] Found token in cookie: ${candidate}`);
        return decodeURIComponent(match[1]);
      } catch {
        console.debug(`[Auth] Found token in cookie: ${candidate} (not URL encoded)`);
        return match[1];
      }
    }
  }

  const readStorage = (storage: Storage | undefined) => {
    if (!storage) {
      return null;
    }
    for (const key of TOKEN_STORAGE_KEYS) {
      const value = storage.getItem(key);
      if (value) {
        console.debug(`[Auth] Found token in storage: ${key}`);
        return value;
      }
    }
    return null;
  };

  try {
    const fromLocal = readStorage(typeof localStorage !== "undefined" ? localStorage : undefined);
    if (fromLocal) {
      return fromLocal;
    }
  } catch {
    /* noop */
  }

  try {
    const fromSession = readStorage(typeof sessionStorage !== "undefined" ? sessionStorage : undefined);
    if (fromSession) {
      return fromSession;
    }
  } catch {
    /* noop */
  }

  console.debug("[Auth] No accessible auth token found (relying on HTTP-only cookies)");
  return null;
};
const mapRole = (apiRole: string): UserRole => {
  if (apiRole === "super_admin" || apiRole === "Super Admin" || apiRole === "admin") return "admin";
  if (apiRole === "department_manager" || apiRole === "Manager" || apiRole === "manager") return "manager";
  return "employee";
};

const extractUserPayload = (raw: any) => raw?.user ?? raw?.data ?? raw;

const mapUser = (payload: any): User => {
  const source = extractUserPayload(payload) ?? {};
  return {
    id: source.employee_id ?? source.id ?? "",
    name: source.name ?? source.employee_id ?? source.email ?? "User",
    email: source.email ?? "",
    role: mapRole(source.role ?? "employee"),
  };
};

const isAuthError = (error: any) => {
  const status = error?.response?.status;
  return status === 401 || status === 403 || status === 419 || status === 440;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  const attemptRefresh = useCallback(async (): Promise<boolean> => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = (async () => {
        try {
          const response = await api.post(env.authPaths.refresh, {});
          persistTokenFromPayload(response?.data);
          return true;
        } catch (error) {
          return false;
        } finally {
          refreshPromiseRef.current = null;
        }
      })();
    }

    return refreshPromiseRef.current;
  }, []);

  const performAuthCheck = useCallback(
    async (allowRefresh: boolean) => {
      setStatus("loading");

      try {
  const response = await api.get(env.authPaths.me);

  setUser(mapUser(response.data));
        setStatus("authenticated");
        return true;
      } catch (error: any) {
        if (allowRefresh && isAuthError(error)) {
          const refreshed = await attemptRefresh();
          if (refreshed) {
            return performAuthCheck(false);
          }
        }

        clearStoredAuthToken();
        setUser(null);
        setStatus("unauthenticated");
        return false;
      }
    },
    [attemptRefresh]
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await performAuthCheck(true);
      } catch (error) {
        if (isMounted) {
          clearStoredAuthToken();
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    };

    bootstrap();

    const handleSessionExpired = () => {
      clearStoredAuthToken();
      setUser(null);
      setStatus("unauthenticated");
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [performAuthCheck]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setStatus("loading");

      try {
  const response = await api.post(env.authPaths.login, credentials);
  persistTokenFromPayload(response?.data);
  await performAuthCheck(false);
      } catch (error) {
        clearStoredAuthToken();
        setUser(null);
        setStatus("unauthenticated");
        throw error;
      }
    },
    [performAuthCheck]
  );

  const logout = useCallback(async () => {
    try {
      await api.post(
        env.authPaths.logout,
        {},
        { headers: { "X-Skip-Interceptor": "true" } }
      );
    } catch (error) {
      // Swallow errors: session may already be invalid
    } finally {
      clearStoredAuthToken();
      setUser(null);
      setStatus("unauthenticated");
      refreshPromiseRef.current = null;
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await employeeService.getNotifications({ unreadOnly: true });
      const notifications = response?.notifications || [];
      setUnreadNotifCount(notifications.length);
    } catch (error) {
      console.debug("[Notifications] Could not fetch unread count (endpoint may not be ready)");
      setUnreadNotifCount(0);
    }
  }, []);

  const markNotificationsAsRead = useCallback(async () => {
    try {
      await employeeService.markNotificationsRead();
      setUnreadNotifCount(0);
    } catch (error) {
      console.debug("[Notifications] Could not mark as read (endpoint may not be ready)");
      setUnreadNotifCount(0); // Reset locally anyway
    }
  }, []);

  const buildNotificationWebSocketUrl = useCallback((): string | null => {
    try {
      // Use the gateway URL and convert to WebSocket protocol
      // Nginx routes /ws/* to the notification service
      // Fallback: extract base URL from apiBaseUrl by removing /api/auth suffix
      const gatewayUrl = (env as any).apiGatewayUrl || env.apiBaseUrl.replace(/\/api\/auth\/?$/, '');
      const protocol = gatewayUrl.startsWith("https") ? "wss:" : "ws:";
      const host = gatewayUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Build WebSocket URL via Nginx gateway /ws/ route
      const url = `${protocol}//${host}/ws/notifications`;
      
      // Backend supports both cookie and query param authentication:
      // 1. HTTP-only cookie (primary, most secure) - sent automatically by browser
      // 2. Query parameter ?token=JWT (fallback for programmatic access)
      
      // Try to get token from accessible sources (non-HTTP-only cookies or storage)
      const token = getAuthTokenFromBrowser();
      
      if (token) {
        // If we found an accessible token, send it as query param for redundancy
        console.info("[WebSocket] Using token from accessible storage as query parameter");
        return `${url}?token=${encodeURIComponent(token)}`;
      }
      
      // No accessible token found - rely on HTTP-only cookie sent by browser
      console.info("[WebSocket] Using HTTP-only cookie authentication (sent automatically by browser)");
      return url;
    } catch (error) {
      console.error("[WebSocket] Failed to build WebSocket URL:", error);
      return null;
    }
  }, []);
  // Simple notification service
  useEffect(() => {
    if (status === "authenticated" && user) {
      // Fetch initial unread count
      fetchUnreadCount(); 
      
      const connect = () => {
        const wsUrl = buildNotificationWebSocketUrl();
        if (!wsUrl) {
          console.debug("[Notifications] WebSocket not configured");
          return;
        }
        
        console.info("[Notifications] Connecting...");
        wsRef.current = new WebSocket(wsUrl);
        
        let pingInterval: NodeJS.Timeout | null = null;

        wsRef.current.onopen = () => {
          console.info("[Notifications] Connected");
          pingInterval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send("ping");
            }
          }, 30000);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = event.data;
            if (data === "pong") return;
            
            const message = JSON.parse(data);
            
            if (message.type === "new_notification") {
              const msg = message.data?.message || "New notification";
              
              notificationSound.play().catch(() => {});
              toast.info(msg, { duration: 4000, position: "top-right" });
              setUnreadNotifCount(prev => prev + 1);
            }
          } catch (error) {
            console.debug("[Notifications] Parse error:", error);
          }
        };

        wsRef.current.onclose = (event) => {
          if (pingInterval) clearInterval(pingInterval);
          
          console.debug(`[Notifications] Disconnected (code: ${event.code})`);
          
          // Reconnect on auth errors after refresh
          if (event.code >= 4001 && event.code <= 4003) {
            attemptRefresh().then((success) => {
              if (success && status === "authenticated") {
                setTimeout(connect, 2000);
              }
            });
            return;
          }
          
          // Auto-reconnect for other errors
          if (status === "authenticated" && event.code !== 1000 && event.code !== 1001) {
            setTimeout(connect, 5000);
          }
        };
        
        wsRef.current.onerror = () => {
          console.debug("[Notifications] Connection error");
        };
      };

      connect();

      return () => {
        if (wsRef.current) {
          wsRef.current.onclose = null;
          wsRef.current.close();
        }
      };
    }
  }, [status, user, fetchUnreadCount, buildNotificationWebSocketUrl, attemptRefresh]);

  const refreshAuth = useCallback(async () => {
    await performAuthCheck(true);
  }, [performAuthCheck]);

  const loading = status === "loading" || status === "idle";
  const isAuthenticated = status === "authenticated";

  const contextValue = useMemo(
    () => ({
      user,
      status,
      loading,
      isAuthenticated,
      login,
      logout,
      refreshAuth,
      unreadNotifCount,
      markNotificationsAsRead,
    }),
    [user, status, loading, isAuthenticated, login, logout, refreshAuth, unreadNotifCount, markNotificationsAsRead]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
