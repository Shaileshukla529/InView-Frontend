// src/services/analytics.ts
import { attendanceApi } from "./api";

// ==================== INTERFACES ====================

export interface KeyMetric {
  value: number | string;
  change: string;
  change_percentage: number;
  trend: 'up' | 'down' | 'neutral';
  comparison_period: string;
  icon?: string;
}

export interface WeeklyComparisonItem {
  day: string;
  this_week: number;
  last_week: number;
  percentage_change: number;
}

export interface DepartmentPerformanceItem {
  department: string;
  present: number;
  total: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface MonthlyTrendItem {
  month: string;
  present: number;
  absent: number;
  on_leave: number;
  total: number;
  attendance_rate: number;
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  icon: string;
  timestamp?: string;
}

export interface EmployeePerformanceItem {
  id: string;
  name: string;
  avatar: string;
  attendance: string;
  rank?: number;
  count?: string;
  days?: string;
  metric_type: 'top_performer' | 'late_arrival' | 'frequent_absence';
}

export interface FiltersData {
  departments: Array<{ value: string; label: string }>;
  date_ranges: Array<{ value: string; label: string }>;
  status_options: Array<{ value: string; label: string }>;
}

export interface AnalyticsResponse {
  date: string;
  period: string;
  key_metrics: Record<string, KeyMetric>;
  weekly_comparison: WeeklyComparisonItem[];
  department_performance: DepartmentPerformanceItem[];
  monthly_trends: MonthlyTrendItem[];
  status_breakdown: StatusBreakdownItem[];
  alerts: AlertItem[];
  top_performers: EmployeePerformanceItem[];
  late_arrivals: EmployeePerformanceItem[];
  frequent_absences: EmployeePerformanceItem[];
  filters: FiltersData;
}

export interface AnalyticsParams {
  target_date?: string;  // Keep for backward compatibility, maps to selected_date
  department?: string;
  period?: 'today' | 'week' | 'month';
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch comprehensive analytics data
 */
export const getAnalytics = async (
  params: AnalyticsParams = {}
): Promise<AnalyticsResponse> => {
  try {
    const response = await attendanceApi.get<AnalyticsResponse>('/analytics/', {
      params: {
        selected_date: params.target_date || new Date().toLocaleDateString('en-CA'),
        department: params.department || undefined,
        period: params.period || 'today',
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.detail || 'Failed to fetch analytics data';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch key metrics only (lightweight endpoint)
 */
export const getKeyMetrics = async (
  target_date?: string
): Promise<Record<string, KeyMetric>> => {
  try {
    const response = await attendanceApi.get<Record<string, KeyMetric>>('/analytics/metrics', {
      params: {
        selected_date: target_date || new Date().toISOString().split('T')[0],
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.detail || 'Failed to fetch key metrics';
    throw new Error(errorMessage);
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format key metrics for display
 */
export const formatKeyMetric = (metric: KeyMetric) => {
  const isPositiveTrend = metric.trend === 'up';
  const isNeutralTrend = metric.trend === 'neutral';
  
  return {
    ...metric,
    trendIcon: isNeutralTrend ? '📊' : isPositiveTrend ? '📈' : '📉',
    trendColor: isNeutralTrend ? 'text-gray-600' : isPositiveTrend ? 'text-green-600' : 'text-red-600',
    bgColor: isNeutralTrend ? 'bg-gray-50' : isPositiveTrend ? 'bg-green-50' : 'bg-red-50',
    borderColor: isNeutralTrend ? 'border-gray-200' : isPositiveTrend ? 'border-green-200' : 'border-red-200',
  };
};

/**
 * Get alert styling based on type
 */
export const getAlertStyling = (type: AlertItem['type']) => {
  const stylingMap = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-500',
    },
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      iconColor: 'text-orange-500',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-500',
    },
  };

  return stylingMap[type];
};

/**
 * Get department performance color based on percentage
 */
export const getDepartmentPerformanceColor = (percentage: number): string => {
  if (percentage >= 95) return '#16a34a'; // green-600
  if (percentage >= 90) return '#84cc16'; // lime-500
  if (percentage >= 85) return '#eab308'; // yellow-500
  if (percentage >= 80) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};

/**
 * Format weekly comparison data for charts
 */
export const formatWeeklyComparisonData = (data: WeeklyComparisonItem[]) => {
  return data.map(item => ({
    ...item,
    changeColor: item.percentage_change >= 0 ? '#10b981' : '#ef4444',
    changeIcon: item.percentage_change >= 0 ? '↗️' : '↘️',
    formattedChange: `${item.percentage_change >= 0 ? '+' : ''}${item.percentage_change.toFixed(1)}%`,
  }));
};

/**
 * Calculate status breakdown total
 */
export const calculateStatusBreakdownTotal = (breakdown: StatusBreakdownItem[]): number => {
  return breakdown.reduce((total, item) => total + item.count, 0);
};

/**
 * Format employee performance based on metric type
 */
export const formatEmployeePerformance = (employee: EmployeePerformanceItem) => {
  const typeConfig = {
    top_performer: {
      badgeColor: 'bg-green-600',
      displayValue: employee.attendance,
      prefix: '#',
      suffix: '',
    },
    late_arrival: {
      badgeColor: 'bg-orange-600',
      displayValue: employee.count || '0 times',
      prefix: '',
      suffix: '',
    },
    frequent_absence: {
      badgeColor: 'bg-red-600',
      displayValue: employee.days || '0 days',
      prefix: '',
      suffix: '',
    },
  };

  const config = typeConfig[employee.metric_type];
  
  return {
    ...employee,
    badgeColor: config.badgeColor,
    displayValue: config.displayValue,
    formattedRank: employee.rank ? `${config.prefix}${employee.rank}` : '',
  };
};

/**
 * Generate chart colors for various data visualizations
 */
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors by varying opacity
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const baseIndex = i % baseColors.length;
    const opacity = 1 - (Math.floor(i / baseColors.length) * 0.2);
    colors.push(baseColors[baseIndex] + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
  }

  return colors;
};

/**
 * Format monthly trends for line chart
 */
export const formatMonthlyTrendsData = (trends: MonthlyTrendItem[]) => {
  return trends.map(item => ({
    ...item,
    attendance_rate_formatted: `${item.attendance_rate.toFixed(1)}%`,
    total_employees: item.present + item.absent + item.on_leave,
    productivity_score: Math.min(100, item.attendance_rate * 1.1), // Example productivity calculation
  }));
};

/**
 * Export analytics data to CSV
 */
export const exportAnalyticsToCSV = (data: AnalyticsResponse): string => {
  // Department Performance CSV
  const deptHeaders = ['Department', 'Present', 'Total', 'Attendance %', 'Trend'];
  const deptRows = data.department_performance.map(dept => [
    dept.department,
    dept.present.toString(),
    dept.total.toString(),
    `${dept.percentage}%`,
    dept.trend,
  ]);

  const deptCSV = [deptHeaders, ...deptRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return deptCSV;
};

/**
 * Calculate attendance improvement recommendations
 */
export const generateRecommendations = (data: AnalyticsResponse): string[] => {
  const recommendations: string[] = [];

  // Check overall attendance rate
  const avgAttendance = parseFloat(data.key_metrics.average_attendance?.value.toString() || '0');
  if (avgAttendance < 85) {
    recommendations.push('Consider implementing attendance improvement programs');
  }

  // Check late arrivals
  const lateArrivals = data.key_metrics.late_arrivals?.value || 0;
  if (typeof lateArrivals === 'number' && lateArrivals > 20) {
    recommendations.push('Review flexible working hours to reduce late arrivals');
  }

  // Check department performance variance
  const deptPerformances = data.department_performance.map(d => d.percentage);
  const maxPerf = Math.max(...deptPerformances);
  const minPerf = Math.min(...deptPerformances);
  if (maxPerf - minPerf > 15) {
    recommendations.push('Address attendance disparities between departments');
  }

  // Check alerts
  const criticalAlerts = data.alerts.filter(alert => alert.type === 'error');
  if (criticalAlerts.length > 0) {
    recommendations.push('Resolve critical system alerts affecting attendance tracking');
  }

  return recommendations;
};

/**
 * Calculate period-over-period growth rates
 */
export const calculateGrowthRates = (current: number, previous: number): {
  growth: number;
  growthFormatted: string;
  isPositive: boolean;
  isSignificant: boolean;
} => {
  if (previous === 0) {
    return {
      growth: 0,
      growthFormatted: '0%',
      isPositive: true,
      isSignificant: false,
    };
  }

  const growth = ((current - previous) / previous) * 100;
  const isPositive = growth >= 0;
  const isSignificant = Math.abs(growth) >= 5; // 5% threshold for significance

  return {
    growth,
    growthFormatted: `${isPositive ? '+' : ''}${growth.toFixed(1)}%`,
    isPositive,
    isSignificant,
  };
};