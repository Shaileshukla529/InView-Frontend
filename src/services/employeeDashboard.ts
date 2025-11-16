import { employeeApi } from './employee';

// Types for employee dashboard API responses
export interface AttendanceRateResponse {
  overall_rate: number;
  current_month_rate: number;
  previous_month_rate: number;
  yearly_rate: number;
  total_working_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  trend: "up" | "down" | "neutral";
  trend_percentage: number;
}

export interface DaysStatisticsResponse {
  current_month: {
    present: number;
    absent: number;
    late: number;
  };
  last_month: {
    present: number;
    absent: number;
    late: number;
  };
  last_3_months: Array<{
    month: string;
    year: number;
    present: number;
    absent: number;
    late: number;
  }>;
  yearly_total: {
    present: number;
    absent: number;
    late: number;
  };
}

export interface WorkHoursCalendarItem {
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number | null;
  overtime_hours: number | null;
  status: string;
  is_weekend: boolean;
  is_holiday: boolean;
}

export interface WorkHoursCalendarResponse {
  month: string;
  year: number;
  days: WorkHoursCalendarItem[];
  total_work_hours: number;
  total_overtime_hours: number;
  average_daily_hours: number;
}

export interface ClockHistoryItem {
  date: string;
  day: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  status: string;
  total_hours: number | null;
  is_late: boolean;
  late_duration: number | null;
  location: { lat: number; lng: number } | null;
}

export interface ClockHistoryResponse {
  history: ClockHistoryItem[];
  summary: {
    avg_clock_in: string | null;
    avg_hours: number;
    late_days: number;
    total_work_days: number;
    attendance_rate: number;
  };
}

export interface WeeklyComparisonItem {
  day: string;
  date: string;
  this_week_status: string;
  last_week_status: string;
  this_week_hours: number | null;
  last_week_hours: number | null;
}

export interface WeeklyComparisonResponse {
  this_week_data: WeeklyComparisonItem[];
  this_week_summary: {
    present: number;
    absent: number;
    late: number;
    on_leave: number;
  };
  last_week_summary: {
    present: number;
    absent: number;
    late: number;
    on_leave: number;
  };
  improvement_areas: string[];
}

export interface MonthlyTrendItem {
  month: string;
  year: number;
  attendance_rate: number;
  present_days: number;
  total_working_days: number;
  average_work_hours: number;
  late_arrivals: number;
}

export interface MonthlyTrendsResponse {
  trends: MonthlyTrendItem[];
  best_month: {
    month: string;
    year: number;
    attendance_rate: number;
  };
  improvement_needed: boolean;
  trend_direction: "improving" | "declining" | "stable";
}

export interface FaceRegistrationResponse {
  message: string;
  employee_id: string;
  employee_name: string;
  saved_files: string[];
  folder_path: string;
}

/**
 * Employee Dashboard Service
 * Provides functions to interact with the employee dashboard API endpoints
 */
export const employeeDashboardService = {
  /**
   * Get employee's attendance rate statistics
   */
  async getAttendanceRate(
    employeeId?: string, 
    targetMonth?: number, 
    targetYear?: number
  ): Promise<AttendanceRateResponse> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    if (targetMonth) params.append('target_month', targetMonth.toString());
    if (targetYear) params.append('target_year', targetYear.toString());
    
    const queryString = params.toString();
    const url = `/employee-dashboard/attendance-rate${queryString ? `?${queryString}` : ''}`;
    
    const response = await employeeApi.get(url);
    return response.data as AttendanceRateResponse;
  },

  /**
   * Get employee's days statistics (present, absent, late)
   */
  async getDaysStatistics(employeeId?: string): Promise<DaysStatisticsResponse> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    
    const queryString = params.toString();
    const url = `/employee-dashboard/days-statistics${queryString ? `?${queryString}` : ''}`;
    
    const response = await employeeApi.get(url);
    return response.data as DaysStatisticsResponse;
  },

  /**
   * Get work hours calendar for a specific month
   */
  async getWorkHoursCalendar(
    employeeId?: string,
    month?: number,
    year?: number
  ): Promise<WorkHoursCalendarResponse> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    const url = `/employee-dashboard/work-hours-calendar${queryString ? `?${queryString}` : ''}`;
    
    const response = await employeeApi.get(url);
    return response.data as WorkHoursCalendarResponse;
  },

  /**
   * Get employee's clock in/out history
   */
  async getClockHistory(employeeId?: string, days?: number): Promise<ClockHistoryResponse> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    if (days) params.append('days', days.toString());
    
    const queryString = params.toString();
    const url = `/employee-dashboard/clock-history${queryString ? `?${queryString}` : ''}`;
    
    const response = await employeeApi.get(url);
    return response.data as ClockHistoryResponse;
  },

  /**
   * Get weekly attendance comparison
   */
  async getWeeklyComparison(
    employeeId?: string,
    targetDate?: string
  ): Promise<WeeklyComparisonResponse> {
    const response = await employeeApi.get('/employee-dashboard/weekly-comparison', {
      params: {
        employee_id: employeeId,
        selected_date: targetDate,
      },
    });
    
    return response.data as WeeklyComparisonResponse;
  },

  /**
   * Get monthly attendance trends
   */
  async getMonthlyTrends(
    employeeId?: string,
    monthsBack?: number
  ): Promise<MonthlyTrendsResponse> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    if (monthsBack) params.append('months_back', monthsBack.toString());
    
    const queryString = params.toString();
    const url = `/employee-dashboard/monthly-trends${queryString ? `?${queryString}` : ''}`;
    
    const response = await employeeApi.get(url);
    return response.data as MonthlyTrendsResponse;
  },

  /**
   * Get comprehensive dashboard summary
   */
  async getDashboardSummary(employeeId?: string) {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    
    const queryString = params.toString();
    const url = `/employee-dashboard/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await employeeApi.get(url);
    return response.data;
  },

  /**
   * Upload face images for AI recognition
   */
  async uploadFaceImages(formData: FormData): Promise<FaceRegistrationResponse> {
    const response = await employeeApi.post('/attendance/my-face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Increase timeout for file uploads
      timeout: 60000,
    });
    return response.data as FaceRegistrationResponse;
  },
};

/**
 * Utility functions for dashboard data processing
 */
export const dashboardUtils = {
  /**
   * Calculate attendance percentage
   */
  calculateAttendancePercentage(present: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((present / total) * 100 * 10) / 10; // Round to 1 decimal
  },

  /**
   * Format trend percentage for display
   */
  formatTrendPercentage(percentage: number, trend: string): string {
    const sign = trend === 'up' ? '+' : trend === 'down' ? '-' : '';
    return `${sign}${Math.abs(percentage).toFixed(1)}%`;
  },

  /**
   * Get status color based on attendance status
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'present':
        return 'green';
      case 'late':
        return 'orange';
      case 'absent':
        return 'red';
      case 'on_leave':
      case 'leave':
        return 'blue';
      case 'weekend':
        return 'gray';
      case 'holiday':
        return 'purple';
      default:
        return 'gray';
    }
  },

  /**
   * Format work hours for display
   */
  formatWorkHours(hours: number | null): string {
    if (hours === null || hours === undefined) return 'N/A';
    if (hours === 0) return '0h';
    
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) {
      return `${wholeHours}h`;
    } else if (wholeHours === 0) {
      return `${minutes}m`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  },

  /**
   * Format time for display (HH:MM format)
   */
  formatTime(timeString: string | null): string {
    if (!timeString) return 'N/A';
    
    try {
      // Handle both "HH:MM" and "HH:MM:SS" formats
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  },

  /**
   * Calculate working days in a month (excluding weekends)
   */
  getWorkingDaysInMonth(year: number, month: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Monday = 1, Sunday = 0. Working days are Mon-Fri (1-5)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    
    return workingDays;
  },

  /**
   * Check if a date is today
   */
  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  /**
   * Get relative date string (e.g., "Today", "Yesterday", "3 days ago")
   */
  getRelativeDateString(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  },

  /**
   * Validate image files for face registration
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WEBP are allowed.`
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 5MB.`
      };
    }

    return { valid: true };
  },

  /**
   * Generate color palette for charts
   */
  getChartColors(count: number): string[] {
    const baseColors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Orange
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#EC4899', // Pink
      '#6366F1', // Indigo
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // If we need more colors, generate variations
    const colors = [...baseColors];
    while (colors.length < count) {
      const baseIndex = (colors.length - baseColors.length) % baseColors.length;
      const baseColor = baseColors[baseIndex];
      // Create a lighter variation
      const variation = baseColor + '80'; // Add alpha
      colors.push(variation);
    }

    return colors.slice(0, count);
  },
};

export default employeeDashboardService;