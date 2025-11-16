// src/services/dailyAttendance.ts
import { attendanceApi } from "./api";
import { apiCache, deduplicateRequest } from "../utils/performance";

// ==================== INTERFACES ====================

export interface AttendanceStatsResponse {
  total: number;
  present: number;
  absent: number;
  late: number;
  on_leave: number;
  half_day: number;
  attendance_rate: number;
  previous_rate?: number;
  rate_change?: number;
}

export interface AttendanceRecordResponse {
  id: string;
  name: string;
  employee_id: string;
  department: string;
  check_in?: string;
  check_out?: string;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave' | 'Half Day' | 'WFH';
  hours: string;
  photo?: string;
  is_active: boolean;
}

export interface DailyAttendanceResponse {
  date: string;
  current_time: string;
  stats: AttendanceStatsResponse;
  records: AttendanceRecordResponse[];
  total_records: number;
}

export interface LiveClockResponse {
  current_time: string;
  current_date: string;
  formatted_time: string;
  formatted_date: string;
}

export interface DailyAttendanceParams {
  selected_date?: string;  // Keep for backward compatibility, maps to selected_date
  search?: string;
  status_filter?: 'all' | 'present' | 'absent' | 'late' | 'on_leave' | 'half_day';
  department_filter?: string;
  limit?: number;
  offset?: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch daily attendance data with optional filters
 */
export const getDailyAttendance = async (
  params: DailyAttendanceParams = {}
): Promise<DailyAttendanceResponse> => {
  const cacheKey = `daily-attendance-${JSON.stringify(params)}`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Deduplicate concurrent requests
  return deduplicateRequest(cacheKey, async () => {
    try {
      const response = await attendanceApi.get<DailyAttendanceResponse>('/daily-attendance/', {
        params: {
          selected_date: params.selected_date || new Date().toLocaleDateString('en-CA'),
          search: params.search || undefined,
          status_filter: params.status_filter || 'all',
          department_filter: params.department_filter || 'all',
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      });

      // Cache the result
      apiCache.set(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to fetch daily attendance data';
      throw new Error(errorMessage);
    }
  });
};

/**
 * Fetch live clock data for real-time display
 */
export const getLiveClock = async (): Promise<LiveClockResponse> => {
  try {
    const response = await attendanceApi.get<LiveClockResponse>('/daily-attendance/live-clock');
    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.detail || 'Failed to fetch live clock data';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch daily attendance statistics only
 */
export const getDailyStats = async (
  target_date?: string
): Promise<AttendanceStatsResponse> => {
  try {
    const response = await attendanceApi.get<AttendanceStatsResponse>('/daily-attendance/stats', {
      params: {
        selected_date: target_date || new Date().toLocaleDateString('en-CA'),
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.detail || 'Failed to fetch daily statistics';
    throw new Error(errorMessage);
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format attendance status for display
 */
export const formatAttendanceStatus = (status: AttendanceRecordResponse['status']): string => {
  const statusMap: Record<string, string> = {
    'Present': 'Present',
    'Absent': 'Absent',
    'Late': 'Late Arrival',
    'On Leave': 'On Leave',
    'Half Day': 'Half Day',
    'WFH': 'Work From Home',
  };

  return statusMap[status] || status;
};

/**
 * Get status color for UI display
 */
export const getAttendanceStatusColor = (status: AttendanceRecordResponse['status']): string => {
  const colorMap: Record<string, string> = {
    'Present': 'bg-green-50 text-green-700 border-green-200',
    'Absent': 'bg-red-50 text-red-700 border-red-200',
    'Late': 'bg-orange-50 text-orange-700 border-orange-200',
    'On Leave': 'bg-blue-50 text-blue-700 border-blue-200',
    'Half Day': 'bg-purple-50 text-purple-700 border-purple-200',
    'WFH': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  return colorMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

/**
 * Calculate attendance rate change indicator
 */
export const getAttendanceRateChange = (stats: AttendanceStatsResponse) => {
  const change = stats.rate_change || 0;
  const isPositive = change >= 0;
  
  return {
    isPositive,
    value: Math.abs(change),
    indicator: isPositive ? '+' : '-',
    colorClass: isPositive ? 'text-green-600' : 'text-red-600',
    trendClass: isPositive ? 'trending-up' : 'trending-down',
  };
};

/**
 * Parse work hours string for sorting/display
 */
export const parseWorkHours = (hours: string): { hours: number; minutes: number; isInProgress: boolean } => {
  if (hours === '-' || hours === 'In Progress') {
    return { hours: 0, minutes: 0, isInProgress: hours === 'In Progress' };
  }

  const match = hours.match(/(\d+)h\s*(\d+)m/);
  if (match) {
    return {
      hours: parseInt(match[1], 10),
      minutes: parseInt(match[2], 10),
      isInProgress: hours.includes('In Progress'),
    };
  }

  return { hours: 0, minutes: 0, isInProgress: false };
};

/**
 * Generate employee avatar URL
 */
export const getEmployeeAvatarUrl = (name: string, photo?: string): string => {
  if (photo && photo !== '') {
    return photo;
  }
  
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.replace(' ', ''))}`;
};

/**
 * Get employee initials for fallback avatar
 */
export const getEmployeeInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};