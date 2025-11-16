import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar as CalendarComponent } from "./ui/calendar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Award,
  MapPin,
  RefreshCw,
  UserCheck,
  UserX,
  CalendarDays,
  Timer,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, parseISO, isSameDay } from "date-fns";
import {
  employeeDashboardService,
  type AttendanceRateResponse,
  type DaysStatisticsResponse,
  type WorkHoursCalendarResponse,
  type ClockHistoryResponse,
  type WeeklyComparisonResponse,
  type MonthlyTrendsResponse,
} from "@/services/employeeDashboard";

// KPI Card Type
interface KPICard {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  percentage: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  bgGradient: string;
}

interface EmployeeDashboardData {
  attendance_rate: AttendanceRateResponse;
  days_statistics: DaysStatisticsResponse;
  work_hours_calendar: WorkHoursCalendarResponse;
  clock_history: ClockHistoryResponse;
  weekly_comparison: WeeklyComparisonResponse;
  monthly_trends: MonthlyTrendsResponse;
}

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
  const [faceImages, setFaceImages] = useState<File[]>([]);
  const [facePreviewUrls, setFacePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [
        attendanceRate,
        daysStats,
        workHoursCalendar,
        clockHistory,
        weeklyComparison,
        monthlyTrends,
      ] = await Promise.allSettled([
        employeeDashboardService.getAttendanceRate(),
        employeeDashboardService.getDaysStatistics(),
        employeeDashboardService.getWorkHoursCalendar(),
        employeeDashboardService.getClockHistory(undefined, 14),
        employeeDashboardService.getWeeklyComparison(),
        employeeDashboardService.getMonthlyTrends(undefined, 6),
      ]);

      setDashboardData({
        attendance_rate: attendanceRate.status === 'fulfilled' ? attendanceRate.value : mockAttendanceRate(),
        days_statistics: daysStats.status === 'fulfilled' ? daysStats.value : mockDaysStatistics(),
        work_hours_calendar: workHoursCalendar.status === 'fulfilled' ? workHoursCalendar.value : mockWorkHoursCalendar(),
        clock_history: clockHistory.status === 'fulfilled' ? clockHistory.value : mockClockHistory(),
        weekly_comparison: weeklyComparison.status === 'fulfilled' ? weeklyComparison.value : mockWeeklyComparison(),
        monthly_trends: monthlyTrends.status === 'fulfilled' ? monthlyTrends.value : mockMonthlyTrends(),
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setDashboardData({
        attendance_rate: mockAttendanceRate(),
        days_statistics: mockDaysStatistics(),
        work_hours_calendar: mockWorkHoursCalendar(),
        clock_history: mockClockHistory(),
        weekly_comparison: mockWeeklyComparison(),
        monthly_trends: mockMonthlyTrends(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle face image upload
  const handleFaceImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPEG, PNG, and WEBP are allowed.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setFaceImages(validFiles);
    
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setFacePreviewUrls(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return previewUrls;
    });
  }, []);

  // Upload face images
  const handleFaceImageSubmit = useCallback(async () => {
    if (faceImages.length === 0) {
      toast.error("Please select at least one face image");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      faceImages.forEach(file => formData.append('files', file));

      const result = await employeeDashboardService.uploadFaceImages(formData);
      
      toast.success(result.message);
      setFaceImages([]);
      setFacePreviewUrls(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
    } catch (error: any) {
      console.error("Failed to upload face images:", error);
      toast.error(error?.response?.data?.detail || "Failed to upload face images");
    } finally {
      setIsUploading(false);
    }
  }, [faceImages]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      facePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [facePreviewUrls]);

  // Generate KPI Cards
  const kpiCards: KPICard[] = useMemo(() => {
    if (!dashboardData) return [];
    
    return [
      {
        label: "Attendance Rate",
        value: `${dashboardData.attendance_rate.current_month_rate.toFixed(1)}%`,
        change: `${Math.abs(dashboardData.attendance_rate.trend_percentage).toFixed(1)}%`,
        trend: dashboardData.attendance_rate.trend,
        percentage: dashboardData.attendance_rate.current_month_rate,
        icon: Award,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        bgGradient: "from-blue-50/80 to-blue-100/20",
      },
      {
        label: "Present Days",
        value: dashboardData.attendance_rate.present_days.toString(),
        change: `${dashboardData.attendance_rate.total_working_days} days`,
        trend: "neutral",
        percentage: (dashboardData.attendance_rate.present_days / dashboardData.attendance_rate.total_working_days) * 100,
        icon: UserCheck,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        bgGradient: "from-green-50/80 to-green-100/20",
      },
      {
        label: "Absent Days",
        value: dashboardData.attendance_rate.absent_days.toString(),
        change: "This month",
        trend: dashboardData.attendance_rate.absent_days > 2 ? "up" : "down",
        percentage: (dashboardData.attendance_rate.absent_days / dashboardData.attendance_rate.total_working_days) * 100,
        icon: UserX,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        bgGradient: "from-red-50/80 to-red-100/20",
      },
      {
        label: "Late Arrivals",
        value: dashboardData.attendance_rate.late_days.toString(),
        change: "This month",
        trend: dashboardData.attendance_rate.late_days > 3 ? "up" : "down",
        percentage: (dashboardData.attendance_rate.late_days / dashboardData.attendance_rate.total_working_days) * 100,
        icon: Timer,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        bgGradient: "from-orange-50/80 to-orange-100/20",
      },
      {
        label: "Avg Work Hours",
        value: `${dashboardData.work_hours_calendar.average_daily_hours.toFixed(1)}h`,
        change: "Daily average",
        trend: dashboardData.work_hours_calendar.average_daily_hours >= 8 ? "up" : "down",
        percentage: (dashboardData.work_hours_calendar.average_daily_hours / 10) * 100,
        icon: Clock,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        bgGradient: "from-purple-50/80 to-purple-100/20",
      },
      {
        label: "Total Hours",
        value: `${dashboardData.work_hours_calendar.total_work_hours.toFixed(0)}h`,
        change: "This month",
        trend: "neutral",
        percentage: 100,
        icon: BarChart3,
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        bgGradient: "from-indigo-50/80 to-indigo-100/20",
      },
    ];
  }, [dashboardData]);

  // Get calendar day modifiers for coloring
  const getCalendarModifiers = useMemo(() => {
    if (!dashboardData) return undefined;

    const presentDays: Date[] = [];
    const absentDays: Date[] = [];
    const lateDays: Date[] = [];

    dashboardData.work_hours_calendar.days.forEach(day => {
      try {
        const date = parseISO(day.date);
        const normalizedStatus = (day.status || '').toLowerCase();
        
        if (normalizedStatus === 'present') {
          presentDays.push(date);
        } else if (normalizedStatus === 'absent') {
          absentDays.push(date);
        } else if (normalizedStatus === 'late') {
          lateDays.push(date);
        }
      } catch (error) {
        console.error('Error parsing date for calendar:', day.date, error);
      }
    });

    return {
      present: presentDays,
      absent: absentDays,
      late: lateDays,
    };
  }, [dashboardData]);

  const getCalendarModifiersClassNames = {
    present: "bg-green-100 text-green-900 hover:bg-green-200 font-semibold",
    absent: "bg-red-100 text-red-900 hover:bg-red-200 font-semibold",
    late: "bg-orange-100 text-orange-900 hover:bg-orange-200 font-semibold",
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your attendance, performance, and register for facial recognition
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardData}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className={`relative overflow-hidden bg-linear-to-br ${card.bgGradient} border-0 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                    <div className="flex items-center mt-2 gap-2">
                      {card.trend !== "neutral" && (
                        <span className={`flex items-center text-sm ${
                          card.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}>
                          {card.trend === "up" ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          {card.change}
                        </span>
                      )}
                      {card.trend === "neutral" && (
                        <span className="text-sm text-gray-600">{card.change}</span>
                      )}
                    </div>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar with colored days */}
        <Card className="p-6 lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Attendance Calendar</h3>
            </div>
            
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={getCalendarModifiers}
              modifiersClassNames={getCalendarModifiersClassNames}
              className="rounded-md border w-full"
            />

            {/* Legend */}
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium text-gray-700">Legend</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                  <span className="text-sm text-gray-600">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
                  <span className="text-sm text-gray-600">Late</span>
                </div>
              </div>
            </div>

            {/* Selected Day Info */}
            {(() => {
              const dayRecord = dashboardData?.work_hours_calendar?.days?.find(
                day => {
                  try {
                    return isSameDay(parseISO(day.date), selectedDate);
                  } catch (error) {
                    console.error('Error parsing date:', day.date, error);
                    return false;
                  }
                }
              );
              
              if (dayRecord) {
                // Normalize status to lowercase for consistent comparison
                const normalizedStatus = (dayRecord.status || '').toLowerCase();
                
                return (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <p className="font-medium text-sm text-gray-900">
                      {format(selectedDate, 'EEEE, MMM d, yyyy')}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Clock In</p>
                        <p className="font-semibold">{dayRecord.clock_in || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Clock Out</p>
                        <p className="font-semibold">{dayRecord.clock_out || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Hours</p>
                        <p className="font-semibold">
                          {dayRecord.total_hours ? `${dayRecord.total_hours.toFixed(1)}h` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <Badge variant={
                          normalizedStatus === "present" ? "default" :
                          normalizedStatus === "late" ? "secondary" :
                          "destructive"
                        }>
                          {dayRecord.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
                  No data for {format(selectedDate, 'MMM d, yyyy')}
                </div>
              );
            })()}
          </div>
        </Card>

        {/* Recent Check-ins */}
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Recent Check-ins</h3>
                  <p className="text-sm text-gray-600">Last 14 days</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {dashboardData.clock_history.summary.total_work_days} work days
              </Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dashboardData.clock_history.history.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      record.status === "present" ? "bg-green-500" :
                      record.status === "late" ? "bg-orange-500" :
                      "bg-red-500"
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm">
                        {format(parseISO(record.date), 'EEE, MMM d')}
                      </p>
                      <p className="text-xs text-gray-600">{record.day}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-gray-600">In: {record.clock_in_time || 'N/A'}</p>
                      <p className="text-gray-600">Out: {record.clock_out_time || 'N/A'}</p>
                    </div>
                    {record.total_hours && (
                      <div className="text-right min-w-16">
                        <p className="font-semibold">{record.total_hours.toFixed(1)}h</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {record.location && (
                        <MapPin className="w-4 h-4 text-gray-400" />
                      )}
                      <Badge
                        variant={
                          record.status === "present" ? "default" :
                          record.status === "late" ? "secondary" :
                          "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                      {record.is_late && record.late_duration && (
                        <Badge variant="destructive" className="text-xs">
                          +{record.late_duration}m
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Attendance Trends</h3>
                <p className="text-sm text-gray-600">Last 6 months</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.monthly_trends.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                    padding: "12px",
                  }}
                  formatter={(value: any) => [`${value}%`, 'Attendance Rate']} 
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance_rate" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-900">Best Month</p>
                <p className="text-xs text-purple-700">
                  {dashboardData.monthly_trends.best_month.month} {dashboardData.monthly_trends.best_month.year}
                </p>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {dashboardData.monthly_trends.best_month.attendance_rate}%
              </p>
            </div>
          </div>
        </Card>

        {/* Weekly Comparison */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Weekly Comparison</h3>
                <p className="text-sm text-gray-600">This week vs last week</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.weekly_comparison.this_week_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                    padding: "12px",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "14px", paddingTop: "16px" }}
                />
                <Bar dataKey="this_week_hours" fill="#3b82f6" name="This Week" radius={[8, 8, 0, 0]} />
                <Bar dataKey="last_week_hours" fill="#94a3b8" name="Last Week" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {dashboardData.weekly_comparison.improvement_areas.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Insights</p>
                {dashboardData.weekly_comparison.improvement_areas.map((area, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    {area}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Face Registration Section */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <Camera className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Face Registration for AI Recognition</h3>
              <p className="text-sm text-gray-600">
                Upload photos to enable automatic attendance tracking
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              id="faceImages"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFaceImageUpload}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("faceImages")?.click()}
              className="mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Face Images
            </Button>
            <p className="text-sm text-gray-500">
              Upload 3-5 clear photos of your face. JPEG, PNG, or WEBP. Max 5MB each.
            </p>
          </div>

          {facePreviewUrls.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Selected Images ({facePreviewUrls.length})</h4>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {facePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Face ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleFaceImageSubmit}
                  disabled={isUploading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Register Face Images
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFaceImages([]);
                    setFacePreviewUrls(prev => {
                      prev.forEach(url => URL.revokeObjectURL(url));
                      return [];
                    });
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-medium text-indigo-900 mb-2">How Face Recognition Works</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Upload 3-5 clear photos showing different angles of your face</li>
              <li>• AI model processes and learns your facial features</li>
              <li>• System automatically recognizes you during attendance check-ins</li>
              <li>• Recognition accuracy improves with more diverse photos</li>
              <li>• Your data is securely stored and used only for attendance tracking</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Mock data functions (for development/fallback)
function mockAttendanceRate(): AttendanceRateResponse {
  return {
    overall_rate: 92.5,
    current_month_rate: 95.2,
    previous_month_rate: 89.1,
    yearly_rate: 91.8,
    total_working_days: 22,
    present_days: 21,
    absent_days: 1,
    late_days: 3,
    trend: "up",
    trend_percentage: 6.1,
  };
}

function mockDaysStatistics(): DaysStatisticsResponse {
  return {
    current_month: { present: 21, absent: 1, late: 3 },
    last_month: { present: 19, absent: 3, late: 2 },
    last_3_months: [
      { month: "Sep", year: 2025, present: 20, absent: 2, late: 1 },
      { month: "Oct", year: 2025, present: 19, absent: 3, late: 2 },
      { month: "Nov", year: 2025, present: 21, absent: 1, late: 3 },
    ],
    yearly_total: { present: 245, absent: 15, late: 18 },
  };
}

function mockWorkHoursCalendar(): WorkHoursCalendarResponse {
  const days = Array.from({ length: 30 }, (_, i) => ({
    date: format(new Date(2025, 10, i + 1), 'yyyy-MM-dd'),
    clock_in: i % 7 < 5 ? "09:15" : null,
    clock_out: i % 7 < 5 ? "18:30" : null,
    total_hours: i % 7 < 5 ? 8.25 : null,
    overtime_hours: Math.random() > 0.8 ? 1.5 : null,
    status: i % 7 < 5 ? (Math.random() > 0.9 ? "late" : "present") : "weekend",
    is_weekend: i % 7 >= 5,
    is_holiday: false,
  }));

  return {
    month: "November",
    year: 2025,
    days,
    total_work_hours: 173.25,
    total_overtime_hours: 12.5,
    average_daily_hours: 8.25,
  };
}

function mockClockHistory(): ClockHistoryResponse {
  const history = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEEE'),
      clock_in_time: !isWeekend ? "09:15" : null,
      clock_out_time: !isWeekend ? "18:30" : null,
      status: !isWeekend ? (Math.random() > 0.9 ? "late" : "present") : "weekend",
      total_hours: !isWeekend ? 8.25 : null,
      is_late: !isWeekend && Math.random() > 0.8,
      late_duration: !isWeekend && Math.random() > 0.8 ? 15 : null,
      location: { lat: 12.9716, lng: 77.5946 },
    };
  });

  return {
    history,
    summary: {
      avg_clock_in: "09:15",
      avg_hours: 8.2,
      late_days: 2,
      total_work_days: 10,
      attendance_rate: 95.0,
    },
  };
}

function mockWeeklyComparison(): WeeklyComparisonResponse {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return {
    this_week_data: days.map(day => ({
      day,
      date: format(new Date(), 'yyyy-MM-dd'),
      this_week_status: day === 'Sat' || day === 'Sun' ? 'weekend' : 'present',
      last_week_status: day === 'Sat' || day === 'Sun' ? 'weekend' : 'present',
      this_week_hours: day === 'Sat' || day === 'Sun' ? null : 8.5,
      last_week_hours: day === 'Sat' || day === 'Sun' ? null : 8.2,
    })),
    this_week_summary: { present: 5, absent: 0, late: 1, on_leave: 0 },
    last_week_summary: { present: 4, absent: 1, late: 0, on_leave: 0 },
    improvement_areas: ["Great job this week!"],
  };
}

function mockMonthlyTrends(): MonthlyTrendsResponse {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  
  return {
    trends: months.map((month) => ({
      month,
      year: 2025,
      attendance_rate: 85 + Math.random() * 15,
      present_days: 18 + Math.floor(Math.random() * 5),
      total_working_days: 22,
      average_work_hours: 8.0 + Math.random() * 1.5,
      late_arrivals: Math.floor(Math.random() * 5),
    })),
    best_month: { month: "Nov", year: 2025, attendance_rate: 95.2 },
    improvement_needed: false,
    trend_direction: "improving" as const,
  };
}
