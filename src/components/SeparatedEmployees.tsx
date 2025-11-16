import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Calendar,
  FileText,
  UserX,
  TrendingDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Building2,
  Briefcase,
  Clock,
  CalendarDays,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { employeeService } from '@/services/employee';
import { EmployeeResponse, EmployeeStatsResponse, DepartmentFilter } from '@/services/employee';

export function SeparatedEmployees() {
  // State management
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [stats, setStats] = useState<EmployeeStatsResponse | null>(null);
  const [departments, setDepartments] = useState<DepartmentFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState({
    search: '',
    department: 'all'
  });

  // Fetch employees data
  const fetchEmployees = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeService.getSeparatedEmployees({
        search: filterParams.search || undefined,
        department: filterParams.department !== 'all' ? filterParams.department : undefined
      });
      setEmployees(response.employees);
    } catch (err) {
      console.error('Error fetching separated employees:', err);
      
      // Retry logic for temporary backend issues
      if (retryCount < 2) {
        console.log(`Retrying separated employees fetch (attempt ${retryCount + 2}/3)...`);
        setTimeout(() => fetchEmployees(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      setError('Failed to load separated employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await employeeService.getEmployeeStatistics();
      setStats(response);
    } catch (err) {
      console.error('Error fetching employee statistics:', err);
    }
  };

  // Fetch filter options
  const fetchFilters = async () => {
    try {
      const response = await employeeService.getEmployeeFilters();
      setDepartments(response.departments);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await employeeService.exportEmployeeData({
        format: 'csv',
        isActive: false,
        department: filterParams.department !== 'all' ? filterParams.department : undefined
      });
      // In a real app, you'd handle the download URL here
      console.log('Export initiated:', response.download_url);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  // Calculate tenure from joining date
  const calculateTenure = (joiningDate: string) => {
    const joinDate = new Date(joiningDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return months > 0 ? `${years}.${months} years` : `${years} years`;
    }
    return `${months} months`;
  };

  // Effect to fetch data on mount and when filters change
  useEffect(() => {
    fetchEmployees();
  }, [filterParams]);

  useEffect(() => {
    // Load data sequentially to avoid race conditions
    const initializeData = async () => {
      try {
        await fetchStats();
        await fetchFilters();
      } catch (error) {
        console.warn('Failed to initialize separated employees data:', error);
      }
    };
    
    initializeData();
  }, []);

  // Calculate derived stats
  const thisMonthCount = employees.filter(emp => {
    const sepDate = new Date(emp.joining_date);
    const now = new Date();
    return sepDate.getMonth() === now.getMonth() && sepDate.getFullYear() === now.getFullYear();
  }).length;

  const last3MonthsCount = employees.filter(emp => {
    const sepDate = new Date(emp.joining_date);
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    return sepDate >= threeMonthsAgo;
  }).length;

  const displayStats = [
    {
      label: 'Total Separated',
      value: employees.length.toString(),
      change: last3MonthsCount > 0 ? `${last3MonthsCount} in last 3 months` : 'No recent exits',
      icon: UserX,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      cardBorder: 'border-l-red-600'
    },
    {
      label: 'This Month',
      value: thisMonthCount.toString(),
      subtext: thisMonthCount === 0 ? 'No separations' : 'Employees',
      icon: Calendar,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      cardBorder: 'border-l-orange-600'
    },
    {
      label: 'Last 3 Months',
      value: last3MonthsCount.toString(),
      subtext: 'Total exits',
      icon: TrendingDown,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      cardBorder: 'border-l-purple-600'
    },
    {
      label: 'Avg. Tenure',
      value: stats ? (stats.average_tenure.value / 12).toFixed(1) : '0.0',
      subtext: 'Years before exit',
      icon: Clock,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      cardBorder: 'border-l-blue-600'
    },
  ];

  return (
    <div className="pb-0">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] tracking-tight">Separated Employees</h1>
          <p className="text-[16px] text-muted-foreground">View and manage employees who have left the organization</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="h-10 gap-2 text-[14px]">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Nov 12, 2025
            <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
          </Button>
          <Button variant="outline" className="h-10 gap-2 text-[14px]" onClick={handleExport}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
        </div>
      </header>

      {/* Key Metrics */}
      <section aria-label="Key metrics" className="mb-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className={`relative overflow-hidden border-l-4 ${stat.cardBorder} bg-linear-to-br from-gray-50/50 to-transparent p-6 transition-all duration-200 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[14px] text-muted-foreground">{stat.label}</p>
                    <p className="text-[32px] tracking-tight">{stat.value}</p>
                    {stat.change && (
                      <p className="text-[12px] text-muted-foreground">{stat.change}</p>
                    )}
                    {stat.subtext && (
                      <p className="text-[12px] text-muted-foreground">{stat.subtext}</p>
                    )}
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} aria-hidden="true" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Filters Section */}
      <section aria-label="Filters" className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-[14px] text-muted-foreground">Filters:</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={filterParams.search}
              onChange={(e) => setFilterParams(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by name, ID, or department..."
              className="h-10 pl-9 text-[14px]"
            />
          </div>

          {/* Department Filter */}
          <Select value={filterParams.department} onValueChange={(value: string) => setFilterParams(prev => ({ ...prev, department: value }))}>
            <SelectTrigger className="h-10 w-full text-[14px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(filterParams.search || filterParams.department !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-full text-[14px] text-muted-foreground hover:text-foreground lg:w-auto"
              onClick={() => setFilterParams({ search: '', department: 'all' })}
            >
              Clear Filters
            </Button>
          )}

          {/* Export Button */}
          <Button
            variant="outline"
            className="h-10 gap-2 text-[14px]"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
        </div>
      </section>

      {/* Separated Employees Grid */}
      <section aria-label="Separated employees list">
        {loading ? (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-[16px]">Loading separated employees...</p>
                <p className="text-[14px] text-muted-foreground">
                  Please wait while we fetch the data
                </p>
              </div>
            </div>
          </Card>
        ) : error ? (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="space-y-1">
                <p className="text-[16px]">Failed to load employees</p>
                <p className="text-[14px] text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEmployees()}
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : employees.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {employees.map((employee) => (
              <Card
                key={employee.id}
                className="overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                {/* Compact Red Gradient Stripe */}
                <div className="h-2 bg-linear-to-r from-red-400 via-red-500 to-orange-500" />

                {/* Card Content - More Compact */}
                <div className="p-4">
                  {/* Profile Section - Horizontal Layout */}
                  <div className="mb-4 flex items-start gap-3">
                    <Avatar className="h-14 w-14 border-2 border-red-100">
                      <AvatarImage src={employee.avatar_url} alt={employee.name} />
                      <AvatarFallback className="text-[16px]">
                        {employee.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[16px]">{employee.name}</h3>
                          <p className="text-[12px] text-muted-foreground">{employee.employee_id}</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem className="gap-2 text-[13px]">
                              <Eye className="h-3.5 w-3.5" />
                              View History
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[13px]">
                              <FileText className="h-3.5 w-3.5" />
                              Download Records
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-[13px] text-green-600 focus:text-green-600">
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[11px] px-2 py-0">
                          Separated
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Details - Compact List */}
                  <div className="space-y-2 border-t pt-3">
                    {/* Position & Department */}
                    <div className="flex items-center gap-2 text-[13px]">
                      <Briefcase className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
                      <span className="truncate text-muted-foreground">{employee.position || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[13px]">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-purple-600" aria-hidden="true" />
                      <span className="truncate text-muted-foreground">{employee.department?.name || 'N/A'}</span>
                    </div>

                    {/* Joining Date (as separation date) */}
                    <div className="flex items-center gap-2 text-[13px]">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true" />
                      <span className="text-muted-foreground">
                        Separated: {new Date(employee.joining_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Tenure */}
                    <div className="flex items-center gap-2 text-[13px]">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden="true" />
                      <span className="text-muted-foreground">Tenure: {calculateTenure(employee.joining_date)}</span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-3 flex gap-2 border-t pt-3">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-[12px] h-8">
                      <Eye className="h-3 w-3" />
                      History
                    </Button>
                    <Button size="sm" className="flex-1 gap-1.5 bg-[#10B981] text-[12px] h-8 hover:bg-[#059669]">
                      <RotateCcw className="h-3 w-3" />
                      Reactivate
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <UserX className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-[16px]">No separated employees found</p>
                <p className="text-[14px] text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterParams({ search: '', department: 'all' })}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Results Count */}
      {employees.length > 0 && (
        <div className="flex items-center justify-between text-[14px] text-muted-foreground">
          <p>
            Showing <span className="font-medium text-foreground">{employees.length}</span> separated employees
          </p>
        </div>
      )}
    </div>
  );
}
