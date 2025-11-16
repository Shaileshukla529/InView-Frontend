import { useState, useEffect, useCallback, useDeferredValue, useMemo } from 'react';
import { Card } from './ui/card';
import { 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  Clock,
  UserX,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  getDailyAttendance, 
  getLiveClock, 
  getAttendanceRateChange,
  getEmployeeAvatarUrl,
  getEmployeeInitials,
  type DailyAttendanceResponse,
  type AttendanceRecordResponse,
  type LiveClockResponse
} from '../services/dailyAttendance';
import { useDebounce } from '../utils/performance';

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

// Error component
const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Card className="border-red-200 bg-red-50 p-6">
    <div className="flex items-center gap-3 mb-4">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <h3 className="text-red-800 font-medium">Error Loading Data</h3>
    </div>
    <p className="text-red-700 mb-4">{message}</p>
    <Button 
      variant="outline" 
      onClick={onRetry}
      className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
    >
      <RefreshCw className="h-4 w-4" />
      Retry
    </Button>
  </Card>
);

export function DailyAttendance() {
  const [searchQuery, setSearchQuery] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD format
  
  // Debounce search query to reduce API calls
  const debouncedSearch = useDebounce(searchQuery, 300);
  const deferredSearch = useDeferredValue(searchQuery);
  const normalizedSearch = useMemo(() => deferredSearch.trim().toLowerCase(), [deferredSearch]);
  const normalizedStatus = useMemo(() => statusFilter.toLowerCase(), [statusFilter]);
  
  // API data states
  const [attendanceData, setAttendanceData] = useState<DailyAttendanceResponse | null>(null);
  const [liveClockData, setLiveClockData] = useState<LiveClockResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 15;

  // Fetch daily attendance data
  const fetchAttendanceData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const data = await getDailyAttendance({
        selected_date: selectedDate,
        search: debouncedSearch || undefined,
        status_filter: statusFilter === 'all' ? undefined : statusFilter as any,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });

      setAttendanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate, debouncedSearch, statusFilter, page]);

  // Fetch live clock data
  const fetchLiveClockData = useCallback(async () => {
    try {
      const clockData = await getLiveClock();
      setLiveClockData(clockData);
    } catch (err) {
      console.warn('Failed to fetch live clock data:', err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, selectedDate]);

  // Live clock updates
  useEffect(() => {
    fetchLiveClockData();
    const interval = setInterval(fetchLiveClockData, 1000);
    return () => clearInterval(interval);
  }, [fetchLiveClockData]);

  // Auto refresh attendance data every 5 minutes for current date
  useEffect(() => {
    const isToday = selectedDate === new Date().toLocaleDateString('en-CA');
    if (!isToday) return;

    const interval = setInterval(() => {
      fetchAttendanceData(false);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [selectedDate, fetchAttendanceData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendanceData(false);
  };

  const handleNextPage = () => {
    if (!attendanceData) return;
    const totalRecords = attendanceData.total_records;
    const maxPage = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
    setPage((prev) => Math.min(prev + 1, maxPage));
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleRetry = () => {
    setError(null);
    fetchAttendanceData();
  };

  const getStatusBadge = (status: AttendanceRecordResponse['status']) => {
    const variants = {
      'Present': { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
      'Absent': { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
      'Late': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle },
      'On Leave': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Calendar },
      'Half Day': { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Clock },
      'WFH': { color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: Activity },
    };

    const variant = variants[status] || variants['Present'];
    const Icon = variant.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${variant.color}`}>
        <Icon className="h-3 w-3" aria-hidden="true" />
        {status}
      </div>
    );
  };

  // Filter attendance records
  const filteredData = useMemo(() => {
    if (!attendanceData?.records) return [];

    return attendanceData.records.filter((record) => {
      const matchesSearch =
        normalizedSearch === '' ||
        record.name.toLowerCase().includes(normalizedSearch) ||
        record.employee_id.toLowerCase().includes(normalizedSearch) ||
        record.department.toLowerCase().includes(normalizedSearch);

      const matchesStatus = normalizedStatus === 'all' || record.status.toLowerCase() === normalizedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [attendanceData?.records, normalizedSearch, normalizedStatus]);

  // Calculate rate change for display
  const rateChange = useMemo(() => {
    return attendanceData?.stats ? getAttendanceRateChange(attendanceData.stats) : null;
  }, [attendanceData?.stats]);

  const totalRecords = attendanceData?.total_records ?? 0;
  const pageCount = totalRecords > 0 ? Math.ceil(totalRecords / PAGE_SIZE) : 1;
  const startIndex = totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = filteredData.length === 0
    ? (totalRecords === 0 ? 0 : Math.max(startIndex - 1, 0))
    : Math.min(startIndex + filteredData.length - 1, totalRecords);
  const coveredCount = totalRecords === 0 ? 0 : Math.min(page * PAGE_SIZE, totalRecords);

  if (error && !attendanceData) {
    return (
      <main className="space-y-8">
        <ErrorDisplay message={error} onRetry={handleRetry} />
      </main>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header with Real-time Clock */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1>Today's Check In</h1>
              <p className="text-muted-foreground">
                Real-time employee attendance tracking
              </p>
            </div>
          </div>
        </div>
        
        {/* Live Clock Card */}
        <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-6 shadow-lg">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-4 w-4 animate-pulse text-primary" aria-hidden="true" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Live</span>
            </div>
            <div className="space-y-1">
              <p className="text-[28px] leading-none tabular-nums tracking-tight text-primary">
                {liveClockData?.formatted_time || '--:--:-- --'}
              </p>
              <p className="text-sm text-muted-foreground">
                {liveClockData?.formatted_date || 'Loading...'}
              </p>
            </div>
          </div>
        </Card>
      </header>

      {/* Enhanced Summary Stats */}
      <section aria-label="Attendance summary">
        {loading && !attendanceData ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <LoadingSkeleton />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {/* Attendance Rate - Spanning 2 columns */}
            <Card className="sm:col-span-2 border-2 border-primary/20 bg-linear-to-br from-primary/5 to-background p-6 shadow-md transition-all duration-200 hover:shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-[40px] leading-none tracking-tight text-primary">
                        {attendanceData?.stats.attendance_rate || 0}%
                      </p>
                      {rateChange && (
                        <div className={`flex items-center gap-1 text-sm ${rateChange.colorClass}`}>
                          {rateChange.isPositive ? (
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span>{rateChange.value}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      vs. yesterday ({attendanceData?.stats.previous_rate || 0}%)
                    </p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                    <TrendingUp className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[32px] leading-none tracking-tight">{attendanceData?.stats.total || 0}</p>
              </div>
            </Card>

            <Card className="border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Present</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[32px] leading-none tracking-tight text-green-600">{attendanceData?.stats.present || 0}</p>
              </div>
            </Card>

            <Card className="border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Late</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <AlertCircle className="h-5 w-5 text-orange-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[32px] leading-none tracking-tight text-orange-600">{attendanceData?.stats.late || 0}</p>
              </div>
            </Card>

            <Card className="border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-red-200 hover:shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <UserX className="h-5 w-5 text-red-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[32px] leading-none tracking-tight text-red-600">{attendanceData?.stats.absent || 0}</p>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Enhanced Filters */}
      <section aria-label="Filters and search">
        <Card className="border-2 p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Date Picker */}
            <div className="space-y-2">
              <label htmlFor="date-picker" className="text-sm text-muted-foreground">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input 
                  id="date-picker"
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm text-muted-foreground">
                Filter by Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="WFH">Work From Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label htmlFor="search-input" className="text-sm text-muted-foreground">
                Search Employees
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input 
                  id="search-input"
                  placeholder="Name, ID, or department..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
            <Button 
              variant="outline" 
              size="default" 
              className="gap-2 transition-all duration-200 hover:bg-accent"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              Refresh
            </Button>
            <Button variant="outline" size="default" className="gap-2 transition-all duration-200 hover:bg-accent">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
            <Button size="default" className="gap-2 transition-all duration-200 hover:scale-[0.98]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Mark Attendance
            </Button>
          </div>
        </Card>
      </section>

      {/* Enhanced Attendance Table */}
      <section aria-label="Attendance records">
        <Card className="border-2 shadow-sm">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg">Employee Check-In Records</h3>
                <p className="text-sm text-muted-foreground">
                  {totalRecords === 0
                    ? 'No employees to display'
                    : `Showing ${startIndex}-${endIndex} of ${totalRecords} employees`}
                </p>
              </div>
              {error && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Error
                </Badge>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-60">Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><LoadingSkeleton /></TableCell>
                      <TableCell><LoadingSkeleton /></TableCell>
                      <TableCell><LoadingSkeleton /></TableCell>
                      <TableCell><LoadingSkeleton /></TableCell>
                      <TableCell><LoadingSkeleton /></TableCell>
                      <TableCell><LoadingSkeleton /></TableCell>
                    </TableRow>
                  ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((record) => (
                    <TableRow key={record.id} className="transition-colors duration-200 hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarImage 
                              src={getEmployeeAvatarUrl(record.name, record.photo)} 
                              alt={record.name}
                            />
                            <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
                              <span className="text-sm text-primary">{getEmployeeInitials(record.name)}</span>
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="leading-none">{record.name}</p>
                            <p className="text-sm text-muted-foreground">{record.employee_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {record.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${record.check_in ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <Clock className={`h-4 w-4 ${record.check_in ? 'text-green-600' : 'text-muted-foreground'}`} aria-hidden="true" />
                          </div>
                          <span className="text-sm">{record.check_in || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${record.check_out ? 'bg-blue-50' : 'bg-gray-50'}`}>
                            <Clock className={`h-4 w-4 ${record.check_out ? 'text-blue-600' : 'text-muted-foreground'}`} aria-hidden="true" />
                          </div>
                          <span className="text-sm">{record.check_out || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.hours.includes('Progress') ? (
                            <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                              {record.hours}
                            </Badge>
                          ) : (
                            <span className="text-sm tabular-nums">{record.hours}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <Search className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                          <p>No records found</p>
                          <p className="text-sm">Try adjusting your filters or search query</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      {totalRecords > 0 && (
        <section aria-label="Attendance pagination" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Viewed {coveredCount} of {totalRecords} employees ({PAGE_SIZE} per page)
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Page {page} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= pageCount || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
