import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Card } from './ui/card';
import { 
  Download, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  Printer,
  ChevronDown,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  getMonthlyRegister,
  exportMonthlyDataToCSV,
  type MonthlyRegisterResponse,
  type EmployeeMonthlyRecord,
} from '../services/monthlyRegister';
import { useDebounce } from '../utils/performance';

// --- Helper Functions ---

// Get day of week for each date
const getDayOfWeek = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

// Check if a day is a weekend
const isWeekend = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  return date.getDay() === 0 || date.getDay() === 6;
};

// Get initials from name
const getInitials = (name: string) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

type StatusSize = 'sm' | 'md';

const STATUS_VARIANTS: Record<string, {
  color: string;
  text: string;
  tooltip: string;
  textColor: string;
}> = {
  P: {
    color: 'bg-green-600 hover:bg-green-700',
    text: 'P',
    tooltip: 'Present',
    textColor: 'text-white',
  },
  A: {
    color: 'bg-red-600 hover:bg-red-700',
    text: 'A',
    tooltip: 'Absent',
    textColor: 'text-white',
  },
  L: {
    color: 'bg-orange-600 hover:bg-orange-700',
    text: 'L',
    tooltip: 'Late',
    textColor: 'text-white',
  },
  H: {
    color: 'bg-purple-600 hover:bg-purple-700',
    text: 'H',
    tooltip: 'Half Day',
    textColor: 'text-white',
  },
  LV: {
    color: 'bg-blue-600 hover:bg-blue-700',
    text: 'LV',
    tooltip: 'On Leave',
    textColor: 'text-white',
  },
  W: {
    color: 'bg-gray-200 hover:bg-gray-300',
    text: '-',
    tooltip: 'Weekend',
    textColor: 'text-gray-500',
  },
};

const DEFAULT_STATUS_VARIANT = {
  color: 'bg-gray-100 hover:bg-gray-200',
  text: '?',
  tooltip: 'Unknown',
  textColor: 'text-gray-600',
};

const sizeClassMap: Record<StatusSize, string> = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-[12px]',
};

const StatusBadge = memo(({ status, size = 'md' }: { status: string; size?: StatusSize }) => {
  const variant = STATUS_VARIANTS[status] || DEFAULT_STATUS_VARIANT;
  const sizeClasses = sizeClassMap[size];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`flex items-center justify-center rounded-full font-semibold leading-none transition-all duration-200 ${sizeClasses} ${variant.color} ${variant.textColor}`}
        >
          {variant.text}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-[13px] font-medium">{variant.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
});
StatusBadge.displayName = 'StatusBadge';

type DayMeta = {
  day: number;
  isWeekendDay: boolean;
  weekdayLabel: string;
};

const EMPLOYEES_PER_PAGE = 15;


// --- Loading and Error Components ---

const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Card className="border-red-200 bg-red-50 p-6">
    <div className="flex items-center gap-3 mb-4">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <h3 className="text-red-800 font-medium">Error Loading Data</h3>
    </div>
    <p className="text-red-700 mb-4">{message}</p>
    <Button variant="outline" onClick={onRetry} className="gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      Retry
    </Button>
  </Card>
);

// --- Main Component ---

export function MonthlyRegister() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounce search to reduce filtering operations
  const debouncedSearch = useDebounce(searchQuery, 300);
  const normalizedSearch = useMemo(() => debouncedSearch.trim().toLowerCase(), [debouncedSearch]);
  
  // API data states
  const [monthlyData, setMonthlyData] = useState<MonthlyRegisterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch monthly register data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMonthlyRegister({
        year: selectedYear,
        month: selectedMonth + 1, // API expects 1-based month
        include_employees: true,
        include_departments: true,
      });
      setMonthlyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation handlers
  const handlePreviousMonth = useCallback(() => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }, [selectedMonth, selectedYear]);

  const handleNextMonth = useCallback(() => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }, [selectedMonth, selectedYear]);

  // Memoized filtering - only recalculate when dependencies change
  const filteredEmployees = useMemo(() => {
    return monthlyData?.employee_records.filter(emp => {
      const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesSearch = 
        normalizedSearch === '' ||
        emp.employee_name.toLowerCase().includes(normalizedSearch) ||
        emp.employee_id.toLowerCase().includes(normalizedSearch);
      return matchesDepartment && matchesSearch;
    }) || [];
  }, [monthlyData?.employee_records, departmentFilter, normalizedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [departmentFilter, normalizedSearch, monthlyData?.employee_records]);

  const totalEmployees = filteredEmployees.length;
  const pageCount = totalEmployees > 0 ? Math.ceil(totalEmployees / EMPLOYEES_PER_PAGE) : 1;

  useEffect(() => {
    setCurrentPage(prev => {
      const clamped = Math.min(Math.max(prev, 1), pageCount);
      return clamped;
    });
  }, [pageCount]);

  const paginatedEmployees = useMemo(() => {
    if (totalEmployees === 0) return [];
    const start = (currentPage - 1) * EMPLOYEES_PER_PAGE;
    return filteredEmployees.slice(start, start + EMPLOYEES_PER_PAGE);
  }, [filteredEmployees, currentPage, totalEmployees]);

  const startIndex = totalEmployees === 0 ? 0 : (currentPage - 1) * EMPLOYEES_PER_PAGE + 1;
  const endIndex = totalEmployees === 0 ? 0 : Math.min(currentPage * EMPLOYEES_PER_PAGE, totalEmployees);
  const noResults = totalEmployees === 0;
  const coveredEmployees = noResults ? 0 : endIndex;

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, pageCount));
  }, [pageCount]);

  // Get unique departments for filter - memoized
  const departments = useMemo(() => 
    Array.from(new Set(monthlyData?.employee_records.map(emp => emp.department) || []))
  , [monthlyData?.employee_records]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = monthlyData?.working_days_in_month || new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const daysMeta = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const weekend = isWeekend(selectedYear, selectedMonth, day);

        return {
          day,
          isWeekendDay: weekend,
          weekdayLabel: getDayOfWeek(selectedYear, selectedMonth, day),
        };
      }),
    [daysInMonth, selectedMonth, selectedYear],
  );

  // CSV Export
  const exportToCSV = () => {
    if (!monthlyData) return;
    const csvContent = exportMonthlyDataToCSV(monthlyData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-register-${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error && !monthlyData) {
    return (
      <TooltipProvider delayDuration={100}>
        <main className="space-y-6 md:space-y-8">
          <ErrorDisplay message={error} onRetry={fetchData} />
        </main>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <main className="space-y-6 md:space-y-8">
        {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1>Monthly Attendance Register</h1>
              <p className="text-[14px] text-muted-foreground">
                Comprehensive monthly attendance tracking and reporting
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="default" className="gap-2 transition-all duration-200 hover:bg-accent">
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" size="default" className="gap-2 transition-all duration-200 hover:bg-accent">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">View Report</span>
          </Button>
          <Button 
            size="default" 
            className="gap-2 transition-all duration-200 hover:scale-[0.98]"
            onClick={exportToCSV} 
            disabled={loading || !monthlyData}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </header>

      {/* Summary Statistics */}
      <section aria-label="Monthly summary statistics">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 md:p-6"><LoadingSkeleton /></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-background p-4 md:p-6 shadow-md transition-all duration-200 hover:shadow-lg">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] md:text-[14px] text-muted-foreground">Attendance Rate</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[28px] md:text-[32px] leading-none tracking-tight text-primary">
                  {monthlyData?.monthly_stats.average_attendance_rate || 0}%
                </p>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">for this month</p>
              </div>
            </Card>

            <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] md:text-[14px] text-muted-foreground">Total Present</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[28px] md:text-[32px] leading-none tracking-tight text-green-600">
                  {monthlyData?.monthly_stats.total_present || 0}
                </p>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">days</p>
              </div>
            </Card>

            <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-red-200 hover:shadow-md">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] md:text-[14px] text-muted-foreground">Total Absent</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[28px] md:text-[32px] leading-none tracking-tight text-red-600">
                  {monthlyData?.monthly_stats.total_absent || 0}
                </p>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">days</p>
              </div>
            </Card>

            <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] md:text-[14px] text-muted-foreground">On Leave</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[28px] md:text-[32px] leading-none tracking-tight text-blue-600">
                  {monthlyData?.monthly_stats.total_on_leave || 0}
                </p>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">days</p>
              </div>
            </Card>

            <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] md:text-[14px] text-muted-foreground">Late Arrivals</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <Clock className="h-5 w-5 text-orange-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[28px] md:text-[32px] leading-none tracking-tight text-orange-600">
                  {monthlyData?.monthly_stats.total_late || 0}
                </p>
                <p className="text-[11px] md:text-[12px] text-muted-foreground">days</p>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Filters and Controls */}
      <section aria-label="Filters and controls">
        <Card className="border-2 p-4 md:p-6 shadow-sm">
          <div className="space-y-4 md:space-y-6">
            {/* Month Navigation */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="h-10 w-10 transition-all duration-200 hover:bg-accent"
                  aria-label="Previous month"
                  disabled={loading}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </Button>
                
                <div className="flex items-center gap-2 rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-2">
                  <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-[16px] md:text-[18px] tracking-tight font-medium">
                    {monthNames[selectedMonth]} {selectedYear}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-10 w-10 transition-all duration-200 hover:bg-accent"
                  aria-label="Next month"
                  disabled={loading}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>{totalEmployees} employees</span>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 md:grid-cols-2 md:pt-6">
              {/* Department Filter */}
              <div className="space-y-2">
                <label htmlFor="department-filter" className="text-[13px] md:text-[14px] text-muted-foreground font-medium">
                  Filter by Department
                </label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter} disabled={loading}>
                  <SelectTrigger id="department-filter">
                    <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label htmlFor="search-input" className="text-[13px] md:text-[14px] text-muted-foreground font-medium">
                  Search Employees
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input 
                    id="search-input"
                    placeholder="Search by name or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {!noResults && (
        <section
          aria-label="Register pagination"
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Viewed {coveredEmployees} of {totalEmployees} employees ({EMPLOYEES_PER_PAGE} per page)
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= pageCount || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Attendance Records - Mobile View */}
      <section aria-label="Attendance records mobile" className="block md:hidden">
        <div className="space-y-4">
          {/* Legend */}
          <Card className="border border-border p-4 shadow-sm">
            <p className="mb-3 text-[14px] font-semibold">Legend</p>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-green-600"></div>
                <span className="font-medium">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-red-600"></div>
                <span className="font-medium">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-orange-600"></div>
                <span className="font-medium">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-purple-600"></div>
                <span className="font-medium">Half Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-600"></div>
                <span className="font-medium">Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-gray-200"></div>
                <span className="font-medium">Weekend</span>
              </div>
            </div>
          </Card>

          {/* Employee Cards */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4"><LoadingSkeleton /></Card>
              ))
            ) : totalEmployees > 0 ? (
              paginatedEmployees.map((employee) => (
                <MobileEmployeeCard
                  key={employee.employee_id}
                  employee={employee}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  daysInMonth={daysInMonth}
                />
              ))
            ) : (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Search className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-[16px] font-medium">No employees found</p>
                    <p className="text-[14px]">Try adjusting your filters or search query</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Attendance Grid - Desktop/Tablet View */}
      <section aria-label="Attendance grid" className="hidden md:block">
        <Card className="border-2 shadow-sm">
          {/* Table Header */}
          <div className="border-b border-border bg-muted/30 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <h3 className="text-[20px] font-semibold leading-tight tracking-tight">Attendance Records</h3>
                <p className="text-[14px] text-muted-foreground">
                  {noResults
                    ? 'No employees to display'
                    : `Showing ${startIndex}-${endIndex} of ${totalEmployees} employees`}
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 text-[14px]">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-green-600"></div>
                  <span className="font-medium text-foreground">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-red-600"></div>
                  <span className="font-medium text-foreground">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-orange-600"></div>
                  <span className="font-medium text-foreground">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-purple-600"></div>
                  <span className="font-medium text-foreground">Half Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-blue-600"></div>
                  <span className="font-medium text-foreground">Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-gray-200"></div>
                  <span className="font-medium text-foreground">Weekend</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted/50">
                <tr className="border-b-2 border-border">
                  <th className="sticky left-0 z-20 min-w-[260px] bg-muted/50 px-6 py-5 text-left backdrop-blur-sm">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Employee</span>
                  </th>
                  {daysMeta.map((meta) => (
                    <th
                      key={meta.day}
                      className={`min-w-12 px-2 py-5 text-center ${meta.isWeekendDay ? 'bg-gray-50' : ''}`}
                    >
                      <div className="space-y-1.5">
                        <div className={`text-[14px] font-semibold leading-none ${meta.isWeekendDay ? 'text-gray-400' : 'text-foreground'}`}>
                          {meta.day}
                        </div>
                        <div className={`text-[11px] font-medium uppercase leading-none tracking-wide ${meta.isWeekendDay ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          {meta.weekdayLabel}
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="sticky right-0 z-20 min-w-[150px] bg-muted/50 px-6 py-5 text-left backdrop-blur-sm">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Summary</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="sticky left-0 z-10 bg-card px-6 py-5 backdrop-blur-sm">
                        <LoadingSkeleton />
                      </td>
                      {daysMeta.map((meta) => (
                        <td key={`skeleton-${meta.day}`} className="px-2 py-5 text-center">
                          <div className="h-9 w-9 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
                        </td>
                      ))}
                      <td className="sticky right-0 z-10 bg-card px-6 py-5 backdrop-blur-sm">
                        <LoadingSkeleton />
                      </td>
                    </tr>
                  ))
                ) : !noResults ? (
                  paginatedEmployees.map((employee) => (
                    <EmployeeRow
                      key={employee.employee_id}
                      employee={employee}
                      daysMeta={daysMeta}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={daysInMonth + 2} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <Search className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[16px] font-medium">No employees found</p>
                          <p className="text-[14px]">Try adjusting your filters or search query</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </main>
    </TooltipProvider>
  );
}

const EmployeeRow = memo(({ employee, daysMeta }: { employee: EmployeeMonthlyRecord; daysMeta: DayMeta[] }) => {
  const dailyRecordsByDay = useMemo(() => {
    const map = new Map<number, string>();
    Object.entries(employee.daily_records).forEach(([date, status]) => {
      const day = new Date(date).getDate();
      map.set(day, status);
    });
    return map;
  }, [employee.daily_records]);

  return (
    <tr className="border-b border-border transition-colors duration-200 hover:bg-muted/50">
      <td className="sticky left-0 z-10 bg-card px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-border">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.employee_name}`} />
            <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
              <span className="text-[14px] font-semibold text-primary">{getInitials(employee.employee_name)}</span>
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <p className="text-[16px] font-medium leading-tight tracking-tight">{employee.employee_name}</p>
            <div className="flex items-center gap-2">
              <p className="text-[13px] leading-tight text-muted-foreground">{employee.employee_id}</p>
              <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5 leading-tight">
                {employee.department}
              </Badge>
            </div>
          </div>
        </div>
      </td>
      {daysMeta.map((meta) => {
        const resolvedStatus = dailyRecordsByDay.get(meta.day) || (meta.isWeekendDay ? 'W' : 'A');
        return (
          <td
            key={`${employee.employee_id}-${meta.day}`}
            className={`px-2 py-5 text-center ${meta.isWeekendDay ? 'bg-gray-50/50' : ''}`}
          >
            <StatusBadge status={resolvedStatus} />
          </td>
        );
      })}
      <td className="sticky right-0 z-10 bg-card px-6 py-5 backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-medium text-muted-foreground">P:</span>
            <span className="text-[14px] font-semibold tabular-nums text-green-600">{employee.total_present}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-medium text-muted-foreground">A:</span>
            <span className="text-[14px] font-semibold tabular-nums text-red-600">{employee.total_absent}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-medium text-muted-foreground">%:</span>
            <span className="text-[14px] font-semibold tabular-nums text-primary-600">{employee.attendance_percentage}%</span>
          </div>
        </div>
      </td>
    </tr>
  );
});
EmployeeRow.displayName = 'EmployeeRow';

// --- Mobile Employee Card Component - Memoized for better performance ---

const MobileEmployeeCard = memo(({ 
  employee,
  selectedYear,
  selectedMonth,
  daysInMonth
}: { 
  employee: EmployeeMonthlyRecord; 
  selectedYear: number;
  selectedMonth: number;
  daysInMonth: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Memoize the daily records lookup to avoid recreation on every render
  const dailyRecordsByDay = useMemo(() => 
    Object.entries(employee.daily_records).reduce(
      (acc, [date, status]) => {
        const day = new Date(date).getDate();
        acc[day] = status;
        return acc;
      }, 
      {} as Record<number, string>
    ),
    [employee.daily_records]
  );

  // Memoize day grid to avoid unnecessary recalculations
  const dayGrid = useMemo(() => 
    Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const status = dailyRecordsByDay[day] || (isWeekend(selectedYear, selectedMonth, day) ? 'W' : 'A');
      const dayOfWeek = getDayOfWeek(selectedYear, selectedMonth, day);
      return { day, status, dayOfWeek };
    }),
    [daysInMonth, dailyRecordsByDay, selectedYear, selectedMonth]
  );

  return (
    <Card className="border border-border shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.employee_name}`} />
                <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
                  <span className="text-[14px] font-semibold text-primary">{getInitials(employee.employee_name)}</span>
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-[16px] font-medium leading-tight">{employee.employee_name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-[12px] text-muted-foreground">{employee.employee_id}</p>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {employee.department}
                  </Badge>
                </div>
              </div>
            </div>
            <ChevronDown 
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              aria-hidden="true"
            />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-[20px] font-semibold text-green-600">{employee.total_present}</p>
                <p className="text-[11px] font-medium text-green-600">Present</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-[20px] font-semibold text-red-600">{employee.total_absent}</p>
                <p className="text-[11px] font-medium text-red-600">Absent</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-[20px] font-semibold text-primary">{employee.attendance_percentage}%</p>
                <p className="text-[11px] font-medium text-primary">Rate</p>
              </div>
            </div>

            {/* Attendance Grid */}
            <div className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Daily Attendance</p>
              <div className="grid grid-cols-7 gap-2">
                {dayGrid.map(({ day, status, dayOfWeek }) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div className="text-[10px] font-medium text-muted-foreground">
                      {dayOfWeek.substring(0, 1)}
                    </div>
                    <div className="text-[11px] font-medium text-foreground">
                      {day}
                    </div>
                    <StatusBadge status={status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
});
