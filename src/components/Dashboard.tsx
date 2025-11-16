import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ElementType,
} from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  Download,
  Camera,
  FileText,
  Bell,
  ChevronDown,
  AlertTriangle,
  CalendarIcon,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import api from "@/services/api";
import { useDashboard } from "@/contexts/DashboardContext";
import { format } from "date-fns"; // You'll need to install this: npm install date-fns
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { env } from "@/config/env";

type Trend = "up" | "down" | "neutral";
type ActivityStatus = "On Time" | "Late";
type ActivityFilter = "all" | "late" | "early";

// API Response Types
type ApiStatData = {
  value: number;
  trend: Trend;
  change: string;
  change_label: string;
  percentage?: number;
};

type ApiDashboardResponse = {
  stats: {
    total_employees: ApiStatData;
    present_today: ApiStatData;
    absent_today: ApiStatData;
    on_leave: ApiStatData;
  };
  weekly_comparison: Array<{
    day: string;
    this_week: number;
    last_week: number;
  }>;
  alerts: Array<{
    id: string;
    type: "warning" | "info" | "error";
    message: string;
    action_url: string;
  }>;
  department_performance: Array<{
    department: string;
    attendance_rate: number;
    trend: Trend;
  }>;
};

type StatCard = {
  label: string;
  value: string;
  change: string;
  trend: Trend;
  percentage: number;
  comparisonText: string;
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  cardBg: string;
};

type ActivityItem = {
  id: number;
  name: string;
  department: string;
  time: string;
  status: ActivityStatus;
  avatar: string;
};

type DepartmentDatum = {
  department: string;
  present: number;
  total: number;
  percentage: number;
};

type AlertMeta = {
  id: number;
  type: "warning" | "info" | "error";
  message: string;
  icon: typeof AlertTriangle;
};

type QuickAction = {
  id: string;
  label: string;
  icon: ElementType;
  variant?: "outline" | "default";
  badge?: number;
};

const STATS_TEMPLATE: ReadonlyArray<StatCard> = [
  {
    label: "Total Employees",
    value: "245",
    change: "+12",
    trend: "up",
    percentage: 100,
    comparisonText: "vs last month",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    cardBg: "bg-linear-to-br from-blue-50/50 to-transparent",
  },
  {
    label: "Present Today",
    value: "218",
    change: "+2.1%",
    trend: "up",
    percentage: 89.2,
    comparisonText: "vs yesterday",
    icon: UserCheck,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    cardBg: "bg-linear-to-br from-green-50/50 to-transparent",
  },
  {
    label: "Absent Today",
    value: "27",
    change: "-1.5%",
    trend: "down",
    percentage: 11.0,
    comparisonText: "vs yesterday",
    icon: UserX,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    cardBg: "bg-linear-to-br from-red-50/50 to-transparent",
  },
  {
    label: "On Leave",
    value: "12",
    change: "0.5%",
    trend: "down",
    percentage: 4.9,
    comparisonText: "vs last week",
    icon: CalendarIcon,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    cardBg: "bg-linear-to-br from-purple-50/50 to-transparent",
  },
];

const RECENT_ACTIVITY: ReadonlyArray<ActivityItem> = Object.freeze([
  {
    id: 1,
    name: "Sarah Johnson",
    department: "Engineering",
    time: "2 minutes ago",
    status: "On Time",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: 2,
    name: "Michael Brown",
    department: "Sales",
    time: "5 minutes ago",
    status: "Late",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
  },
  {
    id: 3,
    name: "Emily Davis",
    department: "Engineering",
    time: "8 minutes ago",
    status: "On Time",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
  },
  {
    id: 4,
    name: "David Wilson",
    department: "HR",
    time: "12 minutes ago",
    status: "On Time",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
  {
    id: 5,
    name: "Jennifer Lee",
    department: "Finance",
    time: "15 minutes ago",
    status: "On Time",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer",
  },
]);

const ATTENDANCE_TREND = Object.freeze([
  { date: "Jan 1", present: 220, absent: 25, onLeave: 10, projected: null },
  { date: "Jan 5", present: 225, absent: 15, onLeave: 5, projected: null },
  { date: "Jan 10", present: 218, absent: 20, onLeave: 7, projected: null },
  { date: "Jan 15", present: 230, absent: 10, onLeave: 5, projected: null },
  { date: "Jan 20", present: 228, absent: 12, onLeave: 5, projected: null },
  { date: "Jan 25", present: 215, absent: 22, onLeave: 8, projected: null },
  { date: "Jan 30", present: 222, absent: 18, onLeave: 5, projected: 225 },
  { date: "Feb 5", present: null, absent: null, onLeave: null, projected: 228 },
]);

const DEPARTMENT_DATA: ReadonlyArray<DepartmentDatum> = Object.freeze([
  { department: "Engineering", present: 45, total: 50, percentage: 90 },
  { department: "Marketing", present: 28, total: 33, percentage: 85 },
  { department: "Sales", present: 30, total: 36, percentage: 83 },
  { department: "HR", present: 18, total: 20, percentage: 90 },
  { department: "Finance", present: 22, total: 25, percentage: 88 },
  { department: "Operations", present: 37, total: 40, percentage: 93 },
]);

const WEEKLY_COMPARISON = Object.freeze([
  { day: "Mon", thisWeek: 215, lastWeek: 208 },
  { day: "Tue", thisWeek: 218, lastWeek: 210 },
  { day: "Wed", thisWeek: 220, lastWeek: 215 },
  { day: "Thu", thisWeek: 222, lastWeek: 218 },
  { day: "Fri", thisWeek: 218, lastWeek: 220 },
]);

const PUNCTUALITY_DATA = Object.freeze({
  onTime: { count: 182, percentage: 85 },
  late: { count: 22, percentage: 10 },
  leftEarly: { count: 8, percentage: 4 },
});

const ALERTS: ReadonlyArray<AlertMeta> = Object.freeze([
  {
    id: 1,
    type: "warning",
    message: "3 employees absent for 2+ days",
    icon: AlertTriangle,
  },
  { id: 2, type: "info", message: "5 pending leave requests", icon: FileText },
  {
    id: 3,
    type: "error",
    message: "Camera system offline (Floor 2)",
    icon: Camera,
  },
]);

const QUICK_ACTIONS: ReadonlyArray<QuickAction> = [
  { id: "attendance", label: "Mark Attendance", icon: Clock },
  {
    id: "add-employee",
    label: "Add Employee",
    icon: UserCheck,
    variant: "outline",
  },
  {
    id: "reports",
    label: "View Reports",
    icon: TrendingUp,
    variant: "outline",
  },
  {
    id: "leave",
    label: "Leave Requests",
    icon: CalendarIcon,
    variant: "outline",
    badge: 3,
  },
];

const getAttendanceColor = (percentage: number) => {
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 75) return "text-lime-600";
  if (percentage >= 50) return "text-yellow-600";
  return "text-orange-600";
};

const getTrendColor = (trend: Trend, label: string) => {
  if (trend === "neutral") {
    return "text-muted-foreground";
  }
  const isAbsentMetric = label.includes("Absent");
  const isPositive = trend === "up" && !isAbsentMetric;
  return isPositive || (isAbsentMetric && trend === "down")
    ? "text-green-600"
    : "text-red-600";
};

const getAlertStyles = (type: AlertMeta["type"]) => {
  if (type === "error") {
    return {
      container: "border-red-200 bg-red-50",
      icon: "text-red-500",
    };
  }
  if (type === "warning") {
    return {
      container: "border-amber-200 bg-amber-50",
      icon: "text-orange-500",
    };
  }
  return {
    container: "border-blue-200 bg-blue-50",
    icon: "text-blue-500",
  };
};

const QuickActions = memo(() => (
  <Card className="p-6">
    <h2 className="mb-6 text-[18px]">Quick Actions</h2>
    <nav className="space-y-3">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        const variant = action.variant ?? "default";
        return (
          <Button
            key={action.id}
            variant={variant}
            className={`relative h-12 w-full justify-start gap-3 text-[16px] transition-all duration-200 ${
              variant === "default"
                ? "hover:scale-[0.98] active:scale-[0.96]"
                : "hover:bg-accent"
            }`}
            size="lg"
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {action.label}
            {typeof action.badge === "number" && (
              <Badge className="absolute right-3 h-5 w-5 rounded-full bg-red-600 p-0 text-[11px] text-white">
                {action.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  </Card>
));

QuickActions.displayName = "QuickActions";

export const Dashboard = memo(function Dashboard() {
  const [timeRange, setTimeRange] = useState("week");
  const [activityFilter, setActivityFilter] =
    useState<ActivityFilter>("all");
  const { selectedDate, setSelectedDate } = useDashboard();
  const [metricCards, setMetricCards] = useState<StatCard[]>(() =>
    STATS_TEMPLATE.map((card) => ({ ...card }))
  );
  
  // Dynamic data states
  const [weeklyComparison, setWeeklyComparison] = useState(WEEKLY_COMPARISON);
  const [alerts, setAlerts] = useState(ALERTS);
  const [departmentData, setDepartmentData] = useState(DEPARTMENT_DATA);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
                const dateString = selectedDate.toLocaleDateString('en-CA');
                console.log("Fetching dashboard summary for date:", selectedDate); // Debug log
        const { data } = await api.get(
          `${env.attendanceApiUrl}/summary/dashboard`,
          {
            params: {
        selected_date: dateString  
      },
            headers: { Authorization: `Bearer Token` }
          }
        ) as { data: ApiDashboardResponse };

        console.log("Dashboard API Response:", data); // Debug log

        // Map API response to metric cards
        if (data?.stats) {
          const apiStats = data.stats;
          
          const updatedCards = STATS_TEMPLATE.map((card) => {
            let apiData = null;
            
            // Map each card to corresponding API data
            switch (card.label) {
              case "Total Employees":
                apiData = apiStats.total_employees;
                break;
              case "Present Today":
                apiData = apiStats.present_today;
                break;
              case "Absent Today":
                apiData = apiStats.absent_today;
                break;
              case "On Leave":
                apiData = apiStats.on_leave;
                break;
              default:
                return { ...card };
            }

            if (!apiData) return { ...card };

            return {
              ...card,
              value: String(apiData.value ?? card.value),
              change: apiData.change ?? card.change,
              trend: (apiData.trend === "up" || apiData.trend === "down" || apiData.trend === "neutral")
                ? apiData.trend
                : card.trend,
              percentage: typeof apiData.percentage === "number" 
                ? apiData.percentage 
                : card.percentage,
              comparisonText: apiData.change_label ?? card.comparisonText,
            } satisfies StatCard;
          });

          setMetricCards(updatedCards);
        } else {
          console.warn("No stats found in API response");
          setMetricCards(STATS_TEMPLATE.map((card) => ({ ...card })));
        }

        // Update weekly comparison data
        if (data?.weekly_comparison) {
          setWeeklyComparison(data.weekly_comparison.map((item: any) => ({
            day: item.day,
            thisWeek: item.this_week,
            lastWeek: item.last_week,
          })));
        }

        // Update alerts
        if (data?.alerts) {
          setAlerts(data.alerts.map((alert: any) => ({
            id: parseInt(alert.id),
            type: alert.type,
            message: alert.message,
            icon: AlertTriangle, // Default icon, you can map different icons based on type
          })));
        }

        // Update department data
        if (data?.department_performance && Array.isArray(data.department_performance)) {
          setDepartmentData(data.department_performance.map((dept: any) => {
            // Get actual values from API
            const present = dept.present ?? 0;
            const absent = dept.absent ?? 0;
            const onLeave = dept.on_leave ?? 0;
            const total = present + absent + onLeave;
            
            // Calculate percentage
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
            
            return {
              department: dept.department || dept.name || "Unknown",
              present: present,
              total: total,
              percentage: percentage,
            };
          }));
        }
      } catch (error) {
        console.error("Failed to load attendance summary", error);
        setMetricCards(STATS_TEMPLATE.map((card) => ({ ...card })));
      }
    };

    fetchSummary();
  }, [selectedDate]);

  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") {
      return RECENT_ACTIVITY;
    }
    if (activityFilter === "late") {
      return RECENT_ACTIVITY.filter((activity) => activity.status === "Late");
    }
    return RECENT_ACTIVITY.filter((activity) => activity.status !== "Late");
  }, [activityFilter]);

  const weeklyComparisonData = useMemo(
    () => weeklyComparison.map((item) => ({ ...item })),
    [weeklyComparison]
  );
  const attendanceTrendData = useMemo(
    () => ATTENDANCE_TREND.map((item) => ({ ...item })),
    []
  );
  const departmentPerformance = useMemo(
    () => departmentData.map((item) => ({ ...item })),
    [departmentData]
  );

  const handleActivityChange = useCallback((value: string) => {
    setActivityFilter(value as ActivityFilter);
  }, []);

  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value);
  }, []);

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] leading-none tracking-tight">
              Dashboard
            </h1>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Activity className="h-3 w-3" aria-hidden="true" />
              Live
            </Badge>
          </div>
          <p className="text-[16px] text-muted-foreground">Today's Summary</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 ...">
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium">
                {format(selectedDate, "MMM dd, yyyy")}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
              <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date?: Date) => {
                // When a user clicks a date, update the global state!
                if (date) {
                  setSelectedDate(date);
                  // You might need to close the popover here, too
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </header>

      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((stat) => {
            const Icon = stat.icon;
            const trendColor = getTrendColor(stat.trend, stat.label);
            return (
              <Card
                key={stat.label}
                className={`relative overflow-hidden p-6 transition-all duration-200 hover:shadow-lg ${stat.cardBg}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[20px] antialiased font-stretch-ultra-expanded">
                      {stat.label}
                    </p>
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
                    >
                      <Icon
                        className={`h-6 w-6 ${stat.iconColor}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p
                      className="text-[40px] leading-none tracking-tight sm:text-[48px]"
                    >
                      {stat.value}
                    </p>
                    {stat.label.includes("Present") && (
                      <p
                        className={`text-[32px] leading-none tracking-tight sm:text-[40px] ${getAttendanceColor(
                          stat.percentage
                        )}`}
                      >
                        {stat.percentage.toFixed(1)}%
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`flex items-center gap-1 text-[14px] ${trendColor}`}
                      >
                        {stat.trend === "up" && (
                          <TrendingUp className="h-6 w-6" />
                        )}
                        {stat.trend === "down" && (
                          <TrendingDown className="h-6 w-6" />
                        )}
                        {stat.change}
                      </span>
                      <span className="text-[14px] text-muted-foreground">
                        {stat.comparisonText}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-label="Weekly attendance comparison">
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="mb-6 space-y-1">
                <h2 className="text-[18px]">Weekly Attendance Comparison</h2>
                <p className="text-[14px] text-muted-foreground">
                  This week vs last week performance
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={weeklyComparisonData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
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
                    domain={[200, 230]}
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
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="thisWeek"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="This Week"
                    dot={{ fill: "#10b981", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lastWeek"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Last Week"
                    dot={{ fill: "#94a3b8", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <Bell className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="text-[18px]">Alerts</h3>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const Icon = alert.icon;
                  const styles = getAlertStyles(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 rounded-lg border p-4 transition-all hover:shadow-md ${styles.container}`}
                    >
                      <Icon
                        className={`mt-1 h-5 w-5 shrink-0 ${styles.icon}`}
                        aria-hidden="true"
                      />
                      <p className="text-[14px] leading-relaxed text-gray-900">
                        {alert.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2" aria-label="Recent attendance">
          <Card className="p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px]">Live Check-ins</h2>
                  <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-[11px] text-green-700">
                    <Activity
                      className="h-3 w-3 animate-pulse"
                      aria-hidden="true"
                    />
                    Auto-refresh
                  </div>
                </div>
                <p className="text-[14px] text-muted-foreground">
                  Last 30 minutes • Updates every 30s
                </p>
              </div>
              <Tabs
                value={activityFilter}
                onValueChange={handleActivityChange}
                className="w-auto"
              >
                <TabsList className="h-9">
                  <TabsTrigger value="all" className="text-[12px]">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="late" className="text-[12px]">
                    Late
                  </TabsTrigger>
                  <TabsTrigger value="early" className="text-[12px]">
                    Early
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-3">
              {filteredActivity.map((activity) => (
                <article
                  key={activity.id}
                  className="flex items-center gap-4 rounded-lg border border-transparent p-4 transition-all duration-200 hover:border-border hover:bg-accent"
                >
                  <img
                    src={activity.avatar}
                    alt={activity.name}
                    className="h-12 w-12 shrink-0 rounded-full border-2 border-background shadow-sm"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-[16px] leading-none">{activity.name}</p>
                    <p className="text-[14px] text-muted-foreground">
                      {activity.department} • {activity.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.status === "On Time" ? (
                      <CheckCircle2
                        className="h-5 w-5 text-green-600"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertCircle
                        className="h-5 w-5 text-orange-600"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={`text-[14px] ${
                        activity.status === "On Time"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </section>

        <aside className="space-y-6" aria-label="Quick actions">
          <QuickActions />
          <Card className="p-6">
            <h2 className="mb-6 text-[18px]">Punctuality This Week</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-muted-foreground">On Time</span>
                  <span className="text-foreground">
                    {PUNCTUALITY_DATA.onTime.count} (
                    {PUNCTUALITY_DATA.onTime.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all duration-500"
                    style={{ width: `${PUNCTUALITY_DATA.onTime.percentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-muted-foreground">Late</span>
                  <span className="text-foreground">
                    {PUNCTUALITY_DATA.late.count} (
                    {PUNCTUALITY_DATA.late.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-orange-600 transition-all duration-500"
                    style={{ width: `${PUNCTUALITY_DATA.late.percentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-muted-foreground">Left Early</span>
                  <span className="text-foreground">
                    {PUNCTUALITY_DATA.leftEarly.count} (
                    {PUNCTUALITY_DATA.leftEarly.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-500"
                    style={{
                      width: `${PUNCTUALITY_DATA.leftEarly.percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <section aria-label="Department performance">
        <Card className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-[18px]">Department Performance</h2>
              <p className="text-[14px] text-muted-foreground">
                Today's attendance by department
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-[12px]">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={departmentPerformance}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="department"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
                label={{
                  value: "Attendance %",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "16px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
                formatter={(_: unknown, __: unknown, props: any) => {
                  const dept = props.payload as DepartmentDatum;
                  const absent = dept.total - dept.present;
                  const onLeave = Math.floor(dept.total * 0.05);
                  return [
                    <div key="tooltip" className="space-y-2">
                      <div className="border-b border-gray-200 pb-2">
                        <strong className="text-[16px]">
                          {dept.department}
                        </strong>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-green-600">Present:</span>
                          <strong>{dept.present}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-red-600">Absent:</span>
                          <strong>{Math.max(absent - onLeave, 0)}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-purple-600">On Leave:</span>
                          <strong>{onLeave}</strong>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between gap-4">
                          <span>Attendance Rate:</span>
                          <strong
                            className={getAttendanceColor(dept.percentage)}
                          >
                            {dept.percentage}%
                          </strong>
                        </div>
                      </div>
                    </div>,
                    "",
                  ];
                }}
                labelFormatter={() => ""}
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              />
              <Bar
                dataKey="percentage"
                radius={[8, 8, 0, 0]}
                label={{
                  position: "top",
                  formatter: (value: number) => `${value}%`,
                  fontSize: 12,
                  fill: "#374151",
                }}
              >
                {departmentPerformance.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.department}-${index}`}
                    fill={
                      entry.percentage >= 90
                        ? "#16a34a"
                        : entry.percentage >= 85
                        ? "#84cc16"
                        : "#f97316"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      <section aria-label="Attendance analytics">
        <Card className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-[18px]">Attendance Trend</h2>
              <p className="text-[14px] text-muted-foreground">
                Historical data with projections
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Tabs
                value={timeRange}
                onValueChange={handleTimeRangeChange}
                className="w-auto"
              >
                <TabsList className="h-9">
                  <TabsTrigger value="today" className="text-[12px]">
                    Today
                  </TabsTrigger>
                  <TabsTrigger value="week" className="text-[12px]">
                    This Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-[12px]">
                    This Month
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="text-[12px]">
                    Custom
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" className="gap-2 text-[12px]">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={attendanceTrendData}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                dy={10}
              />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} dx={-10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "12px",
                }}
              />
              <ReferenceLine
                y={220}
                stroke="#3b82f6"
                strokeDasharray="5 5"
                label={{
                  value: "Target 90%",
                  position: "insideTopRight",
                  fill: "#3b82f6",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="present"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorPresent)"
                strokeWidth={2}
                name="Present"
              />
              <Area
                type="monotone"
                dataKey="absent"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorAbsent)"
                strokeWidth={2}
                name="Absent"
              />
              <Line
                type="monotone"
                dataKey="onLeave"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="On Leave"
                dot={{ fill: "#8b5cf6", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Projected"
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full bg-green-600"
                aria-hidden="true"
              />
              <span className="text-[14px] text-muted-foreground">
                Present:{" "}
                <span className="text-[16px] text-foreground">215</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full bg-red-600"
                aria-hidden="true"
              />
              <span className="text-[14px] text-muted-foreground">
                Absent: <span className="text-[16px] text-foreground">22</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full bg-purple-600"
                aria-hidden="true"
              />
              <span className="text-[14px] text-muted-foreground">
                On Leave: <span className="text-[16px] text-foreground">8</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full border-2 border-blue-600 bg-transparent"
                aria-hidden="true"
              />
              <span className="text-[14px] text-muted-foreground">
                Projected:{" "}
                <span className="text-[16px] text-foreground">220</span>{" "}
                <span className="text-[12px]">(Target 90%)</span>
              </span>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
});

Dashboard.displayName = "Dashboard";
