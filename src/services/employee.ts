// src/services/employee.ts
import api from './api';
import { env } from '@/config/env';
import axios from 'axios';

// Create a dedicated employee API instance that shares cookies with the main auth service
export const employeeApi = axios.create({
  baseURL: env.employeeApiUrl,
  withCredentials: true, // This ensures cookies from port 8000 are sent to port 8003
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Add the same response interceptor logic to handle auth errors and token refresh
employeeApi.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config as (Record<string, any> & { _retry?: boolean }) | undefined;

    // If request opts out of auth handling, propagate error
    if (originalRequest?.headers?.["X-Skip-Interceptor"] === "true") {
      return Promise.reject(error);
    }

    // Check if it's an auth error (401, 419, 440)
    const isAuthError = (error: any) => {
      const status = error?.response?.status;
      return status === 401 || status === 419 || status === 440;
    };

    if (originalRequest && !originalRequest._retry && isAuthError(error)) {
      originalRequest._retry = true;

      try {
        // Use the main API to refresh the token on the auth service (port 8000)
        await axios.post(
          `${env.apiBaseUrl}${env.authPaths.refresh}`,
          {},
          { withCredentials: true }
        );
        
        // Retry the original request to the employee service
        return employeeApi(originalRequest as any);
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Types based on the backend API
export interface DepartmentResponse {
  id: number;
  name: string;
  code?: string;
}

export interface EmployeeResponse {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone?: string;
  department?: DepartmentResponse;
  position?: string;
  avatar_url?: string;
  joining_date: string;
  status: string;
  attendance_rate: number;
  last_check_in?: string;
}

export interface PaginationResponse {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface DepartmentFilter {
  id: string;
  name: string;
  count: number;
}

export interface FiltersResponse {
  departments: DepartmentFilter[];
  statuses: FilterOption[];
}

export interface NotificationItem {
  id: number;
  employee_id: number;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
}

export interface StatData {
  value: number;
  change: string;
  change_percentage: number;
  trend: 'up' | 'down' | 'neutral';
  comparison_period: string;
}

export interface NewEmployeeData {
  value: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  details: string[];
}

export interface AttendanceData {
  value: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  department_breakdown: Record<string, number>;
}

export interface TenureData {
  value: number;
  unit: string;
  median: number;
  trend: string;
}

export interface EmployeeStatsResponse {
  total_active: StatData;
  new_this_month: NewEmployeeData;
  average_attendance: AttendanceData;
  average_tenure: TenureData;
}

export interface EmployeeListResponse {
  employees: EmployeeResponse[];
  pagination: PaginationResponse;
  filters?: FiltersResponse;
}

export interface ExportResponse {
  download_url: string;
  filename: string;
  expires_at: string;
}

export interface RegisterEmployeeRequest {
  email: string;
  password: string;
  name: string;
  phone_number: string;
  date_of_birth?: string;
  employee_id: string;
  department_id: number;
  role: string;
  designation: string;
  joining_date: string;
  flat?: string;
  house_no?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country?: string;
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  branch_name?: string;
  ifsc_code?: string;
}

export interface RegisterEmployeeResponse {
  message: string;
  employee_id: string;
}

export const employeeService = {
  /**
   * Get employees list (active or separated)
   */
  async getEmployeesList(params: {
    isActive?: boolean;
    search?: string;
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<EmployeeListResponse> {
    const queryParams = new URLSearchParams();

    if (params.isActive !== undefined) queryParams.append('is_active', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.department && params.department !== 'all') queryParams.append('department', params.department);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    // Use the dedicated employee API instance with proper authentication
    const response = await employeeApi.get(`/employees/list?${queryParams}`);
    return response.data as EmployeeListResponse;
  },

  /**
   * Get active employees
   */
  async getActiveEmployees(params: {
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<EmployeeListResponse> {
    return this.getEmployeesList({ ...params, isActive: true });
  },

  /**
   * Get separated employees
   */
  async getSeparatedEmployees(params: {
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<EmployeeListResponse> {
    return this.getEmployeesList({ ...params, isActive: false });
  },

  /**
   * Get employee statistics
   */
  async getEmployeeStatistics(): Promise<EmployeeStatsResponse> {
    const response = await employeeApi.get('/employees/statistics');
    return response.data as EmployeeStatsResponse;
  },

  /**
   * Get filter options
   */
  async getEmployeeFilters(): Promise<FiltersResponse> {
    const response = await employeeApi.get('/employees/filters');
    return response.data as FiltersResponse;
  },

  /**
   * Fetch notifications (optionally unread only)
   */
  async getNotifications(params: { unreadOnly?: boolean } = {}): Promise<NotificationListResponse> {
    const query = params.unreadOnly ? '?unread_only=true' : '';
    const response = await employeeApi.get(`/notifications${query}`);
    const data = response.data as NotificationListResponse | NotificationItem[];
    if (Array.isArray(data)) {
      return { notifications: data };
    }
    return data;
  },

  /**
   * Mark notifications as read
   */
  async markNotificationsRead(): Promise<void> {
    await employeeApi.post('/notifications/mark-read');
  },

  /**
   * Export employee data
   */
  async exportEmployeeData(params: {
    format?: string;
    columns?: string[];
    department?: string;
    status?: string;
    isActive?: boolean;
  } = {}): Promise<ExportResponse> {
    const queryParams = new URLSearchParams();

    if (params.format) queryParams.append('format', params.format);
    if (params.columns) {
      params.columns.forEach(col => queryParams.append('columns', col));
    }
    if (params.department) queryParams.append('department', params.department);
    if (params.status) queryParams.append('status', params.status);
    if (params.isActive !== undefined) queryParams.append('is_active', params.isActive.toString());

    const response = await employeeApi.post(`/employees/export?${queryParams}`);
    return response.data as ExportResponse;
  },

  /**
   * Get employee details by employee code
   */
  async getEmployeeDetails(employeeCode: string): Promise<EmployeeResponse> {
    const response = await employeeApi.get(`/employees/${employeeCode}`);
    return response.data as EmployeeResponse;
  },

  /**
   * Health check for employee API
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await employeeApi.get('/employees/health');
    return response.data as { status: string; timestamp: string };
  },

  /**
   * Get all departments (legacy method for compatibility)
   */
  async getDepartments(): Promise<DepartmentResponse[]> {
    const response = await api.get(`/departments/active`, {
      withCredentials: true
    });
    return response.data as DepartmentResponse[];
  },

  /**
   * Register a new employee (legacy method for compatibility)
   */
  async registerEmployee(
    employeeData: RegisterEmployeeRequest,
    avatarFile: File
  ): Promise<RegisterEmployeeResponse> {
    const formData = new FormData();

    // Append all employee data fields
    Object.entries(employeeData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // Append avatar file if provided
    if (avatarFile) {
      formData.append('avatar_file', avatarFile);
    }

    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data as RegisterEmployeeResponse;
  },
};