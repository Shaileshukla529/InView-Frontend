import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  PieChart,
  BarChart3,
  Download,
  Filter,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';

interface DepartmentLeaveData {
  department: string;
  totalEmployees: number;
  leavesTaken: number;
  avgPerEmployee: number;
  sickLeave: number;
  vacation: number;
  personal: number;
}

interface EmployeeLeaveRecord {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  totalLeaves: number;
  sick: number;
  vacation: number;
  personal: number;
  emergency: number;
  remaining: number;
  allocated: number;
}

export function LeaveAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const monthlyTrend = [
    { month: 'Jan', leaves: 45, year: 2025 },
    { month: 'Feb', leaves: 38, year: 2025 },
    { month: 'Mar', leaves: 52, year: 2025 },
    { month: 'Apr', leaves: 41, year: 2025 },
    { month: 'May', leaves: 48, year: 2025 },
    { month: 'Jun', leaves: 55, year: 2025 },
    { month: 'Jul', leaves: 62, year: 2025 },
    { month: 'Aug', leaves: 47, year: 2025 },
    { month: 'Sep', leaves: 43, year: 2025 },
    { month: 'Oct', leaves: 51, year: 2025 },
  ];

  const leaveTypeDistribution = [
    { type: 'Sick Leave', count: 45, color: 'bg-red-500', percentage: 32, trend: '+5%' },
    { type: 'Vacation', count: 78, color: 'bg-blue-500', percentage: 55, trend: '+12%' },
    { type: 'Personal Leave', count: 19, color: 'bg-purple-500', percentage: 13, trend: '-3%' },
  ];

  const departmentData: DepartmentLeaveData[] = [
    { department: 'Engineering', totalEmployees: 85, leavesTaken: 48, avgPerEmployee: 0.56, sickLeave: 18, vacation: 22, personal: 8 },
    { department: 'Marketing', totalEmployees: 32, leavesTaken: 25, avgPerEmployee: 0.78, sickLeave: 10, vacation: 12, personal: 3 },
    { department: 'Sales', totalEmployees: 64, leavesTaken: 38, avgPerEmployee: 0.59, sickLeave: 14, vacation: 18, personal: 6 },
    { department: 'HR', totalEmployees: 18, leavesTaken: 12, avgPerEmployee: 0.67, sickLeave: 5, vacation: 5, personal: 2 },
    { department: 'Finance', totalEmployees: 46, leavesTaken: 19, avgPerEmployee: 0.41, sickLeave: 7, vacation: 9, personal: 3 },
    { department: 'Operations', totalEmployees: 55, leavesTaken: 32, avgPerEmployee: 0.58, sickLeave: 12, vacation: 15, personal: 5 },
  ];

  const employeeLeaveRecords: EmployeeLeaveRecord[] = [
    { id: '1', name: 'John Smith', employeeId: 'EMP-001', department: 'Engineering', totalLeaves: 8, sick: 2, vacation: 5, personal: 1, emergency: 0, remaining: 12, allocated: 20 },
    { id: '2', name: 'Sarah Johnson', employeeId: 'EMP-002', department: 'Marketing', totalLeaves: 12, sick: 3, vacation: 7, personal: 2, emergency: 0, remaining: 8, allocated: 20 },
    { id: '3', name: 'Michael Brown', employeeId: 'EMP-003', department: 'Sales', totalLeaves: 6, sick: 1, vacation: 4, personal: 1, emergency: 0, remaining: 14, allocated: 20 },
    { id: '4', name: 'Emily Davis', employeeId: 'EMP-004', department: 'Engineering', totalLeaves: 10, sick: 4, vacation: 5, personal: 1, emergency: 0, remaining: 10, allocated: 20 },
    { id: '5', name: 'David Wilson', employeeId: 'EMP-005', department: 'HR', totalLeaves: 7, sick: 2, vacation: 4, personal: 1, emergency: 0, remaining: 13, allocated: 20 },
    { id: '6', name: 'Jennifer Lee', employeeId: 'EMP-006', department: 'Finance', totalLeaves: 5, sick: 1, vacation: 3, personal: 1, emergency: 0, remaining: 15, allocated: 20 },
    { id: '7', name: 'Robert Garcia', employeeId: 'EMP-007', department: 'Operations', totalLeaves: 9, sick: 3, vacation: 5, personal: 1, emergency: 0, remaining: 11, allocated: 20 },
    { id: '8', name: 'Lisa Anderson', employeeId: 'EMP-008', department: 'Engineering', totalLeaves: 11, sick: 2, vacation: 7, personal: 2, emergency: 0, remaining: 9, allocated: 20 },
  ];

  const filteredEmployees = employeeLeaveRecords.filter((emp) => {
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const filteredDepartments = departmentData.filter((dept) => {
    return departmentFilter === 'all' || dept.department === departmentFilter;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 70) return 'text-red-600 bg-red-50';
    if (percentage >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const maxLeaves = Math.max(...monthlyTrend.map((m) => m.leaves));

  return (
    <main className="space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <PieChart className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1>Leave History & Analytics</h1>
              <p className="text-[14px] text-muted-foreground">
                Comprehensive leave patterns, trends, and employee records
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="default" className="gap-2 transition-all duration-200 hover:bg-accent">
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        </div>
      </header>

      {/* Summary Statistics */}
      <section aria-label="Leave summary statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-background p-4 md:p-6 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Total Leaves</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-primary">142</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  <span className="text-[11px] font-semibold">+8%</span>
                </Badge>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">vs last month</p>
              </div>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-red-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Sick Leave</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-red-600">45</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 bg-red-50 text-red-700">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  <span className="text-[11px] font-semibold">+5%</span>
                </Badge>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">from previous</p>
              </div>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Vacation</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-blue-600">78</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  <span className="text-[11px] font-semibold">+12%</span>
                </Badge>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">from previous</p>
              </div>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-purple-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Personal</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <FileText className="h-5 w-5 text-purple-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-purple-600">19</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700">
                  <TrendingDown className="h-3 w-3" aria-hidden="true" />
                  <span className="text-[11px] font-semibold">-3%</span>
                </Badge>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">from previous</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section aria-label="Leave analytics charts">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Leave Type Distribution */}
          <Card className="border-2 shadow-sm">
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-semibold leading-tight tracking-tight">Leave Type Distribution</h3>
                <PieChart className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {leaveTypeDistribution.map((item) => (
                  <div key={item.type} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded ${item.color}`}></div>
                        <span className="text-[14px] font-medium">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={`text-[11px] font-semibold ${
                            item.trend.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {item.trend}
                        </Badge>
                        <span className="text-[14px] font-semibold tabular-nums">
                          {item.count} <span className="text-[12px] text-muted-foreground">({item.percentage}%)</span>
                        </span>
                      </div>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Monthly Trend */}
          <Card className="border-2 shadow-sm">
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-semibold leading-tight tracking-tight">Monthly Trend (2025)</h3>
                <BarChart3 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex h-64 items-end justify-between gap-2">
                {monthlyTrend.map((item) => {
                  const height = (item.leaves / maxLeaves) * 100;
                  return (
                    <div key={item.month} className="group flex flex-1 flex-col items-center gap-3">
                      <div className="relative w-full">
                        <div
                          className="w-full rounded-t-lg bg-linear-to-t from-primary to-primary/70 transition-all duration-300 hover:from-primary hover:to-primary/90"
                          style={{ height: `${height * 2.2}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-lg bg-foreground px-2 py-1 text-[11px] font-semibold text-background shadow-lg group-hover:block">
                            {item.leaves}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[12px] font-medium text-foreground">{item.month}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
                <div className="h-3 w-3 rounded-sm bg-primary"></div>
                <span>Total Leaves per Month</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Department-wise Leave Usage */}
      <section aria-label="Department leave statistics">
        <Card className="border-2 shadow-sm">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h3 className="text-[18px] font-semibold leading-tight tracking-tight">Department-wise Leave Usage</h3>
              <div className="flex items-center gap-3">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Department</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Total Employees</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Leaves Taken</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Breakdown</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Avg per Employee</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDepartments.map((row) => (
                  <tr key={row.department} className="transition-colors duration-200 hover:bg-muted/50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <span className="text-[15px] font-semibold">{row.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] font-medium tabular-nums">{row.totalEmployees}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] font-semibold tabular-nums text-primary">{row.leavesTaken}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[12px]">
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                          S: {row.sickLeave}
                        </Badge>
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                          V: {row.vacation}
                        </Badge>
                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                          P: {row.personal}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-semibold tabular-nums">{row.avgPerEmployee.toFixed(2)}</span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-green-500 to-green-600"
                            style={{ width: `${Math.min(row.avgPerEmployee * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Employee Leave Records */}
      <section aria-label="Employee leave records">
        <Card className="border-2 shadow-sm">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h3 className="text-[18px] font-semibold leading-tight tracking-tight">Employee Leave Records</h3>
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {filteredEmployees.map((employee) => {
                const utilizationPercentage = Math.round((employee.totalLeaves / employee.allocated) * 100);
                return (
                  <Card key={employee.id} className="border border-border p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Employee Info */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-border">
                          <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
                            <span className="text-[14px] font-semibold text-primary">{getInitials(employee.name)}</span>
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[16px] font-semibold leading-tight">{employee.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                            <span>{employee.employeeId}</span>
                            <span>•</span>
                            <span>{employee.department}</span>
                          </div>
                        </div>
                      </div>

                      {/* Leave Stats */}
                      <div className="flex flex-1 items-center gap-6">
                        <div className="flex flex-1 items-center gap-4 text-[12px]">
                          <div className="text-center">
                            <p className="font-semibold text-red-600">{employee.sick}</p>
                            <p className="text-muted-foreground">Sick</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-blue-600">{employee.vacation}</p>
                            <p className="text-muted-foreground">Vacation</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-purple-600">{employee.personal}</p>
                            <p className="text-muted-foreground">Personal</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-orange-600">{employee.emergency}</p>
                            <p className="text-muted-foreground">Emergency</p>
                          </div>
                        </div>

                        {/* Utilization */}
                        <div className="min-w-40 space-y-2">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-muted-foreground">Utilization</span>
                            <Badge variant="secondary" className={`text-[11px] font-semibold ${getUtilizationColor(utilizationPercentage)}`}>
                              {utilizationPercentage}%
                            </Badge>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                utilizationPercentage >= 70
                                  ? 'bg-red-600'
                                  : utilizationPercentage >= 50
                                  ? 'bg-orange-600'
                                  : 'bg-green-600'
                              }`}
                              style={{ width: `${utilizationPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {employee.totalLeaves} of {employee.allocated} days used • {employee.remaining} remaining
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
