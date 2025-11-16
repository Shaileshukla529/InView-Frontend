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
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  MapPin,
  Users,
  Building2,
  TrendingUp,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  CalendarDays,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { employeeService } from '@/services/employee';
import type {
  EmployeeResponse,
  EmployeeStatsResponse,
  FiltersResponse,
  EmployeeListResponse
} from '@/services/employee';

interface AppState {
  employees: EmployeeResponse[];
  stats: EmployeeStatsResponse | null;
  filters: FiltersResponse | null;
  pagination: EmployeeListResponse['pagination'];
  loading: boolean;
  error: string | null;
}

interface FilterParams {
  search: string;
  department: string;
  page: number;
  limit: number;
}

export function EmployeeDetails() {
  const [state, setState] = useState<AppState>({
    employees: [],
    stats: null,
    filters: null,
    pagination: {
      current_page: 1,
      total_pages: 1,
      total_count: 0,
      per_page: 20,
      has_next: false,
      has_previous: false
    },
    loading: true,
    error: null
  });

  const [filterParams, setFilterParams] = useState<FilterParams>({
    search: '',
    department: '',
    page: 1,
    limit: 50 // Show more employees in grid view
  });

  const fetchEmployees = async (retryCount = 0) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const data = await employeeService.getActiveEmployees({
        search: filterParams.search || undefined,
        department: filterParams.department || undefined,
        page: filterParams.page,
        limit: filterParams.limit
      });

      setState(prev => ({
        ...prev,
        employees: data.employees,
        pagination: data.pagination,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      
      // Retry logic for temporary backend issues
      if (retryCount < 2) {
        console.log(`Retrying employee details fetch (attempt ${retryCount + 2}/3)...`);
        setTimeout(() => fetchEmployees(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to load employee data. Please try again.',
        employees: []
      }));
    }
  };

  const fetchStats = async (retryCount = 0) => {
    try {
      const data = await employeeService.getEmployeeStatistics();
      setState(prev => ({ ...prev, stats: data }));
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      // Retry logic for stats
      if (retryCount < 2) {
        console.log(`Retrying stats fetch (attempt ${retryCount + 2}/3)...`);
        setTimeout(() => fetchStats(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      // Use default stats on failure
      setState(prev => ({
        ...prev,
        stats: {
          total_active: { value: 0, change: '0', change_percentage: 0, trend: 'neutral', comparison_period: 'last_month' },
          new_this_month: { value: 0, change: '0', trend: 'neutral', details: [] },
          average_attendance: { value: 0, change: '0', trend: 'neutral', department_breakdown: {} },
          average_tenure: { value: 0, unit: 'months', median: 0, trend: 'neutral' }
        }
      }));
    }
  };

  const fetchFilters = async (retryCount = 0) => {
    try {
      const data = await employeeService.getEmployeeFilters();
      setState(prev => ({ ...prev, filters: data }));
    } catch (error) {
      console.error('Error fetching filters:', error);
      
      // Retry logic for filters
      if (retryCount < 2) {
        console.log(`Retrying filters fetch (attempt ${retryCount + 2}/3)...`);
        setTimeout(() => fetchFilters(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      // Use default filters on failure
      setState(prev => ({
        ...prev,
        filters: {
          departments: [],
          statuses: []
        }
      }));
    }
  };

  const handleExport = async () => {
    try {
      const data = await employeeService.exportEmployeeData({
        format: 'csv',
        columns: ['name', 'email', 'department', 'position', 'phone', 'status', 'joining_date'],
        department: filterParams.department || undefined,
        isActive: true
      });

      if (data.download_url) {
        window.open(data.download_url, '_blank');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filterParams.page, filterParams.search, filterParams.department]);

  useEffect(() => {
    const initializeData = async () => {
      // Load filters first (for department filtering)
      await fetchFilters();
      
      // Then load stats
      await fetchStats();
    };
    
    initializeData();
  }, []);

  const updateFilter = (key: keyof FilterParams, value: string | number) => {
    setFilterParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilterParams({ search: '', department: '', page: 1, limit: 50 });
  };

  // Calculate tenure from joining date
  const calculateTenure = (joiningDate: string) => {
    const joinDate = new Date(joiningDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return `${diffYears.toFixed(1)} years`;
  };

  // Get unique locations from employees (since API doesn't provide locations)
  const locations = Array.from(new Set(state.employees.map(emp => emp.department?.name).filter(Boolean)));

  const stats = [
    {
      label: 'Total Employees',
      value: state.pagination?.total_count?.toString() || '0',
      change: state.stats?.total_active?.change || '+0',
      trend: state.stats?.total_active?.trend || 'neutral',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      cardBorder: 'border-l-blue-600'
    },
    {
      label: 'Departments',
      value: state.filters?.departments?.length?.toString() || '0',
      subtext: 'Active teams',
      icon: Building2,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      cardBorder: 'border-l-purple-600'
    },
    {
      label: 'Office Locations',
      value: locations.length.toString(),
      subtext: '+ Remote workforce',
      icon: MapPin,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      cardBorder: 'border-l-green-600'
    },
    {
      label: 'Avg. Tenure',
      value: state.stats?.average_tenure?.value?.toString() || '0',
      subtext: state.stats?.average_tenure?.unit || 'Years',
      icon: Calendar,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      cardBorder: 'border-l-orange-600'
    },
  ];

  return (
    <div className="pb-0">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] tracking-tight">Employee Directory</h1>
          <p className="text-[16px] text-muted-foreground">Complete employee information and profiles</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 gap-2 text-[14px]">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Oct 24, 2025
            <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
          </Button>
          <Button className="h-10 gap-2 bg-[#0066CC] text-[14px] hover:bg-[#0052A3]" onClick={handleExport}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
        </div>
      </header>

      {/* Key Metrics */}
      <section aria-label="Key metrics" className="mb-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
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
                      <div className="flex items-center gap-1 text-[12px] text-green-600">
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        <span>{stat.change} this year</span>
                      </div>
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
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="h-10 pl-9 text-[14px]"
            />
          </div>

          {/* Department Filter */}
          <Select value={filterParams.department || "all"} onValueChange={(v: string) => updateFilter('department', v === "all" ? "" : v)}>
            <SelectTrigger className="h-10 w-full text-[14px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {state.filters?.departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Filter - Note: API doesn't provide locations, so we'll hide this for now */}
          {/* <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="h-10 w-full text-[14px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          {/* Clear Filters */}
          {(filterParams.search || filterParams.department) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 w-full text-[14px] text-muted-foreground hover:text-foreground lg:w-auto"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </section>

      {/* Employee Cards Grid */}
      <section aria-label="Employee profiles">
        {state.loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : state.error ? (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[16px] text-red-600">Error loading employees</p>
                <p className="text-[14px] text-muted-foreground">{state.error}</p>
              </div>
              <Button onClick={() => fetchEmployees()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </Card>
        ) : state.employees.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {state.employees.map((employee) => (
              <Card 
                key={employee.id} 
                className="overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                <div className="h-2 bg-linear-to-r from-blue-500 via-blue-600 to-indigo-600" />
                
                <div className="p-4">
                  {/* Profile Section - Horizontal Layout */}
                  <div className="mb-4 flex items-start gap-3">
                    <Avatar className="h-14 w-14 border-2 border-blue-100">
                      <AvatarImage src={employee.avatar_url} alt={employee.name} />
                      <AvatarFallback className="text-[16px]">
                        {employee.name.split(' ').map(n => n[0]).join('')}
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
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[13px]">
                              <Edit className="h-3.5 w-3.5" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[13px]">
                              <FileText className="h-3.5 w-3.5" />
                              Attendance
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[11px] px-2 py-0">
                        {employee.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Details - Compact Grid */}
                  <div className="space-y-2 border-t pt-3">
                    {/* Position & Department */}
                    <div className="flex items-center gap-2 text-[13px]">
                      <Briefcase className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
                      <span className="truncate text-muted-foreground">{employee.position || 'Employee'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[13px]">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-purple-600" aria-hidden="true" />
                      <span className="truncate text-muted-foreground">{employee.department?.name || 'N/A'}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-[13px]">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-green-600" aria-hidden="true" />
                      <span className="truncate text-muted-foreground">{employee.email}</span>
                    </div>

                    {/* Phone */}
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-[13px]">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden="true" />
                        <span className="text-muted-foreground">{employee.phone}</span>
                      </div>
                    )}

                    {/* Joining Date */}
                    <div className="flex items-center gap-2 text-[13px]">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden="true" />
                      <span className="text-muted-foreground">
                        {new Date(employee.joining_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })} · {calculateTenure(employee.joining_date)}
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-3 flex gap-2 border-t pt-3">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-[12px] h-8">
                      <Eye className="h-3 w-3" />
                      Profile
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-[12px] h-8">
                      <FileText className="h-3 w-3" />
                      Attendance
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
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-[16px]">No employees found</p>
                <p className="text-[14px] text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Results Count */}
      {state.employees.length > 0 && (
        <div className="flex items-center justify-between text-[14px] text-muted-foreground">
          <p>
            Showing <span className="font-medium text-foreground">{state.employees.length}</span> of{' '}
            <span className="font-medium text-foreground">{state.pagination.total_count}</span> employees
          </p>
        </div>
      )}
    </div>
  );
}
