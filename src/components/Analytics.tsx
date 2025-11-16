import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Filter,
  CalendarDays,
  ChevronDown,
  Bell,
  AlertTriangle,
  FileText,
  Camera,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const WEEKLY_COMPARISON = [
  { day: 'Mon', thisWeek: 215, lastWeek: 208 },
  { day: 'Tue', thisWeek: 218, lastWeek: 210 },
  { day: 'Wed', thisWeek: 220, lastWeek: 215 },
  { day: 'Thu', thisWeek: 222, lastWeek: 218 },
  { day: 'Fri', thisWeek: 218, lastWeek: 220 },
];

const DEPARTMENT_DATA = [
  { department: 'Engineering', present: 45, total: 50, percentage: 90 },
  { department: 'Marketing', present: 28, total: 33, percentage: 85 },
  { department: 'Sales', present: 30, total: 36, percentage: 83 },
  { department: 'HR', present: 18, total: 20, percentage: 90 },
  { department: 'Finance', present: 22, total: 25, percentage: 88 },
  { department: 'Operations', present: 37, total: 40, percentage: 93 },
];

const MONTHLY_TREND = [
  { month: 'Jan', present: 220, absent: 20, onLeave: 10 },
  { month: 'Feb', present: 225, absent: 15, onLeave: 8 },
  { month: 'Mar', present: 218, absent: 18, onLeave: 12 },
  { month: 'Apr', present: 230, absent: 12, onLeave: 6 },
  { month: 'May', present: 228, absent: 14, onLeave: 8 },
  { month: 'Jun', present: 222, absent: 16, onLeave: 10 },
];

const STATUS_BREAKDOWN = [
  { status: 'Present', count: 218, percentage: 89, color: '#10b981' },
  { status: 'Absent', count: 15, percentage: 6, color: '#ef4444' },
  { status: 'On Leave', count: 8, percentage: 3, color: '#f59e0b' },
  { status: 'Half Day', count: 4, percentage: 2, color: '#8b5cf6' },
];

const ALERTS = [
  { id: 1, type: 'warning', message: '3 employees absent for 2+ days', icon: AlertTriangle },
  { id: 2, type: 'info', message: '5 pending leave requests', icon: FileText },
  { id: 3, type: 'error', message: 'Camera system offline (Floor 2)', icon: Camera },
];

const TOP_PERFORMERS = [
  {
    id: 'EMP001',
    name: 'John Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    attendance: '100%',
    rank: 1,
  },
  {
    id: 'EMP012',
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    attendance: '100%',
    rank: 2,
  },
  {
    id: 'EMP025',
    name: 'Emily Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    attendance: '100%',
    rank: 3,
  },
];

const LATE_ARRIVALS = [
  {
    id: 'EMP034',
    name: 'Michael Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    count: '5 times',
  },
  {
    id: 'EMP047',
    name: 'David Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    count: '5 times',
  },
  {
    id: 'EMP056',
    name: 'Robert Anderson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    count: '5 times',
  },
];

const FREQUENT_ABSENCES = [
  {
    id: 'EMP078',
    name: 'Lisa Martinez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    days: '3 days',
  },
  {
    id: 'EMP089',
    name: 'James Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    days: '3 days',
  },
  {
    id: 'EMP092',
    name: 'Anna Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    days: '3 days',
  },
];

export function Analytics() {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('today');

  return (
    <div className="space-y-8">
      {/* Header with Filters */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] tracking-tight">Analytics</h1>
          <p className="text-[16px] text-muted-foreground">Comprehensive attendance insights and trends</p>
        </div>

        {/* Date Selector */}
        <Button 
          variant="outline" 
          className="h-10 gap-2 border-2 px-4 text-[14px] transition-all hover:border-primary"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <span>Oct 24, 2025</span>
          <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
        </Button>
      </header>

      {/* Filters Section - Responsive */}
      <section aria-label="Filters" className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-[14px] text-muted-foreground">Filters:</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-10 w-full text-[14px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full text-[14px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="onleave">On Leave</SelectItem>
              <SelectItem value="halfday">Half Day</SelectItem>
              <SelectItem value="late">Late Arrival</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="h-10 w-full text-[14px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="thisweek">This Week</SelectItem>
              <SelectItem value="lastweek">Last Week</SelectItem>
              <SelectItem value="thismonth">This Month</SelectItem>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {(departmentFilter !== 'all' || statusFilter !== 'all' || selectedDate !== 'today') && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 w-full text-[14px] text-muted-foreground hover:text-foreground lg:w-auto"
              onClick={() => {
                setDepartmentFilter('all');
                setStatusFilter('all');
                setSelectedDate('today');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </section>

      {/* Key Metrics */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-l-4 border-l-green-600 bg-linear-to-br from-green-50/50 to-transparent p-6 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[14px] text-muted-foreground">Avg. Attendance</p>
                <p className="text-[32px] tracking-tight">89%</p>
                <div className="flex items-center gap-1 text-[12px] text-green-600">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  <span>+2.5% from last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <BarChart3 className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-blue-600 bg-linear-to-br from-blue-50/50 to-transparent p-6 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[14px] text-muted-foreground">On-Time Rate</p>
                <p className="text-[32px] tracking-tight">92%</p>
                <div className="flex items-center gap-1 text-[12px] text-green-600">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  <span>+1.2% from last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-purple-600 bg-linear-to-br from-purple-50/50 to-transparent p-6 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[14px] text-muted-foreground">Avg. Work Hours</p>
                <p className="text-[32px] tracking-tight">9.2h</p>
                <p className="text-[12px] text-muted-foreground">Per employee/day</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" aria-hidden="true" />
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-orange-600 bg-linear-to-br from-orange-50/50 to-transparent p-6 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[14px] text-muted-foreground">Active Today</p>
                <p className="text-[32px] tracking-tight">218</p>
                <p className="text-[12px] text-muted-foreground">Out of 245 employees</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" aria-hidden="true" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Weekly Attendance Comparison with Alerts */}
      <section aria-label="Weekly attendance comparison">
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Chart Section */}
            <div className="lg:col-span-3">
              <div className="mb-6 space-y-1">
                <h2 className="text-[18px]">Weekly Attendance Comparison</h2>
                <p className="text-[14px] text-muted-foreground">This week vs last week performance</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={WEEKLY_COMPARISON} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      padding: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px', paddingTop: '16px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="thisWeek" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="This Week"
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lastWeek" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Last Week"
                    dot={{ fill: '#94a3b8', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Alerts Sidebar */}
            <div className="space-y-4 lg:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <Bell className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="text-[18px]">Alerts</h3>
              </div>
              <div className="space-y-3">
                {ALERTS.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div 
                      key={alert.id} 
                      className={`flex items-start gap-3 rounded-lg border p-4 transition-all hover:shadow-md ${
                        alert.type === 'error' ? 'border-red-200 bg-red-50' : 
                        alert.type === 'warning' ? 'border-amber-200 bg-amber-50' : 
                        'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <Icon className={`mt-1 h-5 w-5 shrink-0 ${
                        alert.type === 'error' ? 'text-red-500' : 
                        alert.type === 'warning' ? 'text-orange-500' : 'text-blue-500'
                      }`} aria-hidden="true" />
                      <p className="text-[14px] leading-relaxed text-gray-900">{alert.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Department Performance - Vertical Bar Chart */}
      <section aria-label="Department performance">
        <Card className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-[18px]">Department Performance</h2>
              <p className="text-[14px] text-muted-foreground">Today's attendance by department</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-[12px]">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={DEPARTMENT_DATA}
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
                label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  padding: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(_value: any, _name: string, props: any) => {
                  const dept = props.payload;
                  const absent = dept.total - dept.present;
                  const onLeave = Math.floor(dept.total * 0.05);
                  return [
                    <div key="tooltip" className="space-y-2">
                      <div className="border-b border-gray-200 pb-2">
                        <strong className="text-[16px]">{dept.department}</strong>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-green-600">Present:</span>
                          <strong>{dept.present}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-red-600">Absent:</span>
                          <strong>{absent - onLeave}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-purple-600">On Leave:</span>
                          <strong>{onLeave}</strong>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between gap-4">
                          <span>Attendance Rate:</span>
                          <strong className={dept.percentage >= 90 ? 'text-green-600' : dept.percentage >= 85 ? 'text-lime-600' : 'text-orange-600'}>
                            {dept.percentage}%
                          </strong>
                        </div>
                      </div>
                    </div>,
                    ''
                  ];
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="percentage" 
                radius={[8, 8, 0, 0]}
                label={{ 
                  position: 'top', 
                  formatter: (value: number) => `${value}%`,
                  fontSize: 12,
                  fill: '#374151'
                }}
              >
                {DEPARTMENT_DATA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.percentage >= 90 ? '#16a34a' : 
                      entry.percentage >= 85 ? '#84cc16' : 
                      '#f97316'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Monthly Trend & Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card className="p-6">
          <div className="mb-6 space-y-1">
            <h2 className="text-[18px]">6-Month Attendance Trend</h2>
            <p className="text-[14px] text-muted-foreground">Monthly breakdown by status</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MONTHLY_TREND} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
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
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  padding: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '14px', paddingTop: '16px' }}
              />
              <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" radius={[0, 0, 0, 0]} />
              <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" radius={[0, 0, 0, 0]} />
              <Bar dataKey="onLeave" stackId="a" fill="#f59e0b" name="On Leave" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Breakdown */}
        <Card className="p-6">
          <div className="mb-6 space-y-1">
            <h2 className="text-[18px]">Today's Status Breakdown</h2>
            <p className="text-[14px] text-muted-foreground">Real-time employee status distribution</p>
          </div>
          <div className="space-y-6">
            {STATUS_BREAKDOWN.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between text-[14px]">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-foreground">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.count} employees</span>
                    <span className="min-w-12 text-right font-medium">{item.percentage}%</span>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="text-center">
              <p className="text-[12px] text-muted-foreground">Total Employees</p>
              <p className="text-[24px] tracking-tight">245</p>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-muted-foreground">Attendance Rate</p>
              <p className="text-[24px] tracking-tight text-green-600">89%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Lists with Avatars and Employee IDs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Performers */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <UserCheck className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="text-[18px]">Top Performers</h3>
          </div>
          <div className="space-y-3">
            {TOP_PERFORMERS.map((employee) => (
              <div 
                key={employee.id} 
                className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-accent hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-[11px] text-green-700">
                    #{employee.rank}
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-green-200">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-[14px]">{employee.name}</span>
                    <span className="text-[12px] text-muted-foreground">{employee.id}</span>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white hover:bg-green-600">{employee.attendance}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Late Arrivals */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" aria-hidden="true" />
            </div>
            <h3 className="text-[18px]">Late Arrivals</h3>
          </div>
          <div className="space-y-3">
            {LATE_ARRIVALS.map((employee) => (
              <div 
                key={employee.id} 
                className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-accent hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-orange-200">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-[14px]">{employee.name}</span>
                    <span className="text-[12px] text-muted-foreground">{employee.id}</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-orange-600 text-orange-600">
                  {employee.count}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Frequent Absences */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <UserX className="h-5 w-5 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-[18px]">Frequent Absences</h3>
          </div>
          <div className="space-y-3">
            {FREQUENT_ABSENCES.map((employee) => (
              <div 
                key={employee.id} 
                className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-accent hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-red-200">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-[14px]">{employee.name}</span>
                    <span className="text-[12px] text-muted-foreground">{employee.id}</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-red-600 text-red-600">
                  {employee.days}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
