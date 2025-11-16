// src/services/monthlyRegister.ts
import { attendanceApi } from "./api";
import { apiCache, deduplicateRequest } from "../utils/performance";

// ==================== INTERFACES ====================

export interface CalendarDay {
  date: string;
  day_of_month: number;
  day_of_week: string;
  is_weekend: boolean;
  is_today: boolean;
  is_current_month: boolean;
  attendance_count: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  leave_count: number;
  attendance_percentage: number;
}

export interface MonthlyStats {
  total_working_days: number;
  total_employees: number;
  total_present: number;
  total_absent: number;
  total_late: number;
  total_on_leave: number;
  average_attendance_rate: number;
  best_attendance_day?: string;
  worst_attendance_day?: string;
  monthly_trend: 'up' | 'down' | 'stable';
}

export interface EmployeeMonthlyRecord {
  employee_id: string;
  employee_name: string;
  department: string;
  total_present: number;
  total_absent: number;
  total_late: number;
  total_on_leave: number;
  total_working_days: number;
  attendance_percentage: number;
  trend: 'excellent' | 'good' | 'average' | 'poor';
  daily_records: Record<string, string>; // date -> status mapping
}

export interface DepartmentSummary {
  department_name: string;
  total_employees: number;
  average_attendance: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  leave_days: number;
  trend: 'excellent' | 'good' | 'average' | 'poor';
}

export interface MonthlyRegisterResponse {
  year: number;
  month: number;
  month_name: string;
  calendar_days: CalendarDay[];
  monthly_stats: MonthlyStats;
  employee_records: EmployeeMonthlyRecord[];
  department_summaries: DepartmentSummary[];
  total_employees: number;
  working_days_in_month: number;
}

export interface MonthlyCalendarResponse {
  year: number;
  month: number;
  month_name: string;
  calendar_days: CalendarDay[];
  navigation: {
    current: { year: number; month: number; name: string };
    previous: { year: number; month: number; name: string };
    next: { year: number; month: number; name: string };
    today: { year: number; month: number };
  };
}

export interface MonthlyRegisterParams {
  year?: number;
  month?: number;
  include_employees?: boolean;
  include_departments?: boolean;
  limit?: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch complete monthly attendance register
 */
export const getMonthlyRegister = async (
  params: MonthlyRegisterParams = {}
): Promise<MonthlyRegisterResponse> => {
  const currentDate = new Date();
  const requestParams = {
    year: params.year || currentDate.getFullYear(),
    month: params.month || currentDate.getMonth() + 1,
    include_employees: params.include_employees !== false,
    include_departments: params.include_departments !== false,
    limit: params.limit || 100,
  };

  const cacheKey = `monthly-register-${JSON.stringify(requestParams)}`;
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      const response = await attendanceApi.get<MonthlyRegisterResponse>('/monthly-register/', {
        params: requestParams,
      });

      apiCache.set(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to fetch monthly register data';
      throw new Error(errorMessage);
    }
  });
};

/**
 * Fetch monthly calendar view only (lighter endpoint)
 */
export const getMonthlyCalendar = async (
  year?: number,
  month?: number
): Promise<MonthlyCalendarResponse> => {
  try {
    const currentDate = new Date();
    const response = await attendanceApi.get<MonthlyCalendarResponse>('/monthly-register/calendar', {
      params: {
        year: year || currentDate.getFullYear(),
        month: month || currentDate.getMonth() + 1,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.detail || 'Failed to fetch monthly calendar data';
    throw new Error(errorMessage);
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get status display character for calendar view
 */
export const getStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    'P': 'P',
    'A': 'A',
    'L': 'L',
    'OL': 'LV',
    'HD': 'H',
    'WFH': 'W',
    'U': '?',
  };

  return statusMap[status] || status;
};

/**
 * Get status color class for UI display
 */
export const getStatusColorClass = (status: string): string => {
  const colorMap: Record<string, string> = {
    'P': 'bg-green-600 text-white',
    'A': 'bg-red-600 text-white',
    'L': 'bg-orange-600 text-white',
    'OL': 'bg-blue-600 text-white',
    'LV': 'bg-blue-600 text-white',
    'HD': 'bg-purple-600 text-white',
    'H': 'bg-purple-600 text-white',
    'WFH': 'bg-cyan-600 text-white',
    'W': 'bg-gray-200 text-gray-500',
    'U': 'bg-gray-400 text-white',
  };

  return colorMap[status] || 'bg-gray-400 text-white';
};

/**
 * Get status tooltip text
 */
export const getStatusTooltip = (status: string): string => {
  const tooltipMap: Record<string, string> = {
    'P': 'Present',
    'A': 'Absent',
    'L': 'Late',
    'OL': 'On Leave',
    'LV': 'On Leave',
    'HD': 'Half Day',
    'H': 'Half Day',
    'WFH': 'Work From Home',
    'W': 'Weekend',
    'U': 'Unknown',
  };

  return tooltipMap[status] || 'Unknown Status';
};

/**
 * Get attendance trend color and icon
 */
export const getAttendanceTrend = (trend: EmployeeMonthlyRecord['trend']) => {
  const trendMap = {
    'excellent': {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: '📈',
      label: 'Excellent',
    },
    'good': {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: '👍',
      label: 'Good',
    },
    'average': {
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: '📊',
      label: 'Average',
    },
    'poor': {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: '📉',
      label: 'Needs Improvement',
    },
  };

  return trendMap[trend] || trendMap['average'];
};

/**
 * Calculate working days in a month
 */
export const calculateWorkingDays = (year: number, month: number): number => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    // 0 = Sunday, 6 = Saturday
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      workingDays++;
    }
  }

  return workingDays;
};

/**
 * Get month navigation data
 */
export const getMonthNavigation = (year: number, month: number) => {
  const currentDate = new Date(year, month - 1, 1);
  
  // Previous month
  const previousMonth = new Date(currentDate);
  previousMonth.setMonth(currentDate.getMonth() - 1);
  
  // Next month
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(currentDate.getMonth() + 1);
  
  // Today
  const today = new Date();

  return {
    current: {
      year,
      month,
      name: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    },
    previous: {
      year: previousMonth.getFullYear(),
      month: previousMonth.getMonth() + 1,
      name: previousMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    },
    next: {
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth() + 1,
      name: nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    },
    today: {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    },
  };
};

/**
 * Format calendar day for display
 */
export const formatCalendarDay = (day: CalendarDay) => {
  return {
    ...day,
    displayClass: day.is_weekend 
      ? 'bg-gray-50 text-gray-400' 
      : day.is_today 
        ? 'bg-primary text-primary-foreground' 
        : '',
    attendanceClass: 
      day.attendance_percentage >= 90 ? 'text-green-600' :
      day.attendance_percentage >= 80 ? 'text-orange-600' :
      day.attendance_percentage > 0 ? 'text-red-600' : 'text-gray-400',
  };
};

/**
 * Generate department colors for charts
 */
export const getDepartmentColors = (departmentName: string): string => {
  const colors = [
    '#10b981', // green
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
  ];

  // Simple hash function to consistently assign colors
  const hash = departmentName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Export monthly data to CSV format
 */
export const exportMonthlyDataToCSV = (data: MonthlyRegisterResponse): string => {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Total Present',
    'Total Absent',
    'Total Late',
    'Total On Leave',
    'Total Working Days',
    'Attendance Percentage',
    'Trend',
  ];

  const rows = data.employee_records.map(record => [
    record.employee_id,
    record.employee_name,
    record.department,
    record.total_present.toString(),
    record.total_absent.toString(),
    record.total_late.toString(),
    record.total_on_leave.toString(),
    record.total_working_days.toString(),
    record.attendance_percentage.toString() + '%',
    record.trend,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
};