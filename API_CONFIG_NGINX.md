# API Configuration for Nginx Gateway

This document explains how to configure the frontend to use the Nginx API Gateway.

## Nginx Routing Structure

Based on `ac.txt` (Nginx configuration), all API requests go through a single gateway that routes to backend microservices:

```
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX API GATEWAY                          │
│                    (http://localhost:80)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /api/auth/*      ──────────────────►  Auth Service             │
│                                        (inview_auth:8000)       │
│                                                                 │
│  /api/attendance/* ─────────────────►  Attendance Service       │
│                                        (inview_attendance:8000) │
│                                                                 │
│  /ws/*            ──────────────────►  WebSocket Notifications  │
│                                                                 │
│  /health          ──────────────────►  Health Check             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Required Changes to `src/config/env.ts`

Since `config/` is in `.gitignore`, you need to manually update `src/config/env.ts`:

```typescript
// src/config/env.ts - Updated for Nginx API Gateway
// ============================================================================
// All API requests now go through a single Nginx gateway that routes to
// the appropriate backend microservices:
//   /api/auth/       → Auth Service (inview_auth:8000)
//   /api/attendance/ → Attendance Service (inview_attendance:8000)
//   /ws/             → WebSocket for notifications
// ============================================================================

// Base URL for the Nginx gateway
// Development: http://localhost (port 80)
// Production: https://api.yourdomain.com
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost';

export const env = {
  // ============================================================================
  // Single API Gateway Base URL
  // ============================================================================
  apiGatewayUrl: API_GATEWAY_URL,

  // ============================================================================
  // Service-Specific Base URLs (via Nginx routing)
  // ============================================================================
  
  // Auth Service: /api/auth/ routes → Auth microservice
  // Used for: login, logout, register, refresh tokens, user management
  apiBaseUrl: `${API_GATEWAY_URL}/api/auth`,

  // Attendance Service: /api/attendance/ routes → Attendance microservice  
  // Used for: attendance records, dashboard, analytics, reports
  attendanceApiUrl: `${API_GATEWAY_URL}/api/attendance`,

  // Employee Service: Currently served by Auth service
  // Used for: employee list, notifications, department management
  employeeApiUrl: `${API_GATEWAY_URL}/api/auth`,

  // ============================================================================
  // WebSocket URL for Real-Time Notifications
  // ============================================================================
  wsUrl: `${API_GATEWAY_URL.replace('http', 'ws')}/ws`,

  // ============================================================================
  // Auth Paths (relative to apiBaseUrl: /api/auth)
  // ============================================================================
  // These paths are appended to apiBaseUrl, so:
  //   login    → /api/auth/login
  //   logout   → /api/auth/logout
  //   me       → /api/auth/me
  //   refresh  → /api/auth/refresh
  authPaths: {
    login: '/login',
    logout: '/logout',
    me: '/me',
    refresh: '/refresh',
  },

  // ============================================================================
  // Feature Flags
  // ============================================================================
  enableDebugLogging: import.meta.env.DEV,
  enableMockData: false,
};

export type EnvConfig = typeof env;
```

## Environment Variables

Create a `.env` file (or `.env.local`) in your project root:

```bash
# Development (Nginx running locally on port 80)
VITE_API_GATEWAY_URL=http://localhost

# Production (replace with your domain)
# VITE_API_GATEWAY_URL=https://api.inview.com
```

## API Endpoint Mapping

Here's how the endpoints map before and after the Nginx gateway:

### Auth Endpoints
| Endpoint | Before (Direct) | After (via Nginx) |
|----------|-----------------|-------------------|
| Login | `http://localhost:8000/login` | `http://localhost/api/auth/login` |
| Logout | `http://localhost:8000/logout` | `http://localhost/api/auth/logout` |
| Get User | `http://localhost:8000/me` | `http://localhost/api/auth/me` |
| Refresh Token | `http://localhost:8000/refresh` | `http://localhost/api/auth/refresh` |
| Register | `http://localhost:8000/auth/register` | `http://localhost/api/auth/auth/register` |
| Departments | `http://localhost:8000/departments/active` | `http://localhost/api/auth/departments/active` |

### Attendance Endpoints
| Endpoint | Before (Direct) | After (via Nginx) |
|----------|-----------------|-------------------|
| Dashboard Summary | `http://localhost:8002/summary/dashboard` | `http://localhost/api/attendance/summary/dashboard` |
| Department Performance | `http://localhost:8002/summary/department-performance` | `http://localhost/api/attendance/summary/department-performance` |
| Analytics | `http://localhost:8002/analytics/` | `http://localhost/api/attendance/analytics/` |
| Employee Statistics | `http://localhost:8002/employees/statistics` | `http://localhost/api/attendance/employees/statistics` |

### Employee/Notifications (via Auth Service)
| Endpoint | Before (Direct) | After (via Nginx) |
|----------|-----------------|-------------------|
| Employee List | `http://localhost:8003/employees/list` | `http://localhost/api/auth/employees/list` |
| Notifications | `http://localhost:8003/notifications` | `http://localhost/api/auth/notifications` |
| WebSocket | `ws://localhost:8003/ws/notifications` | `ws://localhost/ws/notifications` |

## WebSocket Configuration in AuthContext.tsx

The WebSocket URL builder in `AuthContext.tsx` needs to be updated to use the new gateway wsUrl:

```typescript
// In AuthContext.tsx, update buildNotificationWebSocketUrl function:

const buildNotificationWebSocketUrl = useCallback((): string | null => {
  try {
    // Use the wsUrl from env directly
    const wsUrl = env.wsUrl; // ws://localhost/ws
    const url = `${wsUrl}/notifications`;
    
    const token = getAuthTokenFromBrowser();
    if (token) {
      return `${url}?token=${encodeURIComponent(token)}`;
    }
    
    return url;
  } catch (error) {
    console.error("[WebSocket] Failed to build WebSocket URL:", error);
    return null;
  }
}, []);
```

## Testing the Configuration

1. Make sure Nginx is running:
   ```bash
   docker-compose up -d nginx
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost/health
   # Should return: healthy
   ```

3. Test auth endpoint:
   ```bash
   curl http://localhost/api/auth/me
   # Should return 401 if not logged in
   ```

4. Test attendance endpoint:
   ```bash
   curl http://localhost/api/attendance/analytics/
   # Should return 401 if not logged in
   ```

## Benefits of Using Nginx Gateway

1. **Single Point of Entry**: All traffic goes through one URL (port 80/443)
2. **CORS Simplified**: Only need to configure CORS on Nginx
3. **SSL/TLS Termination**: HTTPS handled at Nginx level
4. **Rate Limiting**: Protects all services with `limit_req_zone`
5. **Load Balancing**: Easy to add more backend instances
6. **Security Headers**: Added at gateway level (X-Frame-Options, etc.)
7. **Gzip Compression**: Reduces bandwidth for all responses
