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
  Search, User, Mail, Phone, Users, UserCheck, Calendar, TrendingUp,
  Filter, Download, Building2, Briefcase, MoreHorizontal, Eye, Edit, Trash2, Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { employeeService } from '@/services/employee';
import type {
  EmployeeResponse,
  EmployeeStatsResponse,
  FiltersResponse,
  EmployeeListResponse
} from '@/services/employee';

interface FilterParams {
  search: string;
  department: string;
  status: string;
  page: number;
}

interface AppState {
  employees: EmployeeResponse[];
  stats: EmployeeStatsResponse | null;
  filters: FiltersResponse | null;
  pagination: EmployeeListResponse['pagination'];
  loading: boolean;
  error: string | null;
}

export function ActiveEmployees() {
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
    status: 'active',
    page: 1
  });

  const fetchEmployees = async (retryCount = 0) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const data = await employeeService.getActiveEmployees({
        search: filterParams.search || undefined,
        department: filterParams.department || undefined,
        page: filterParams.page,
        limit: 20
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
        console.log(`Retrying employee fetch (attempt ${retryCount + 2}/3)...`);
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

  const fetchStats = async () => {
    try {
      const data = await employeeService.getEmployeeStatistics();
      setState(prev => ({ ...prev, stats: data }));
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error to user for stats - it's not critical
      // Set default stats to prevent UI issues
      setState(prev => ({ 
        ...prev, 
        stats: {
          total_active: { value: 0, change: '0', change_percentage: 0, trend: 'neutral' as const, comparison_period: '' },
          new_this_month: { value: 0, change: '0', trend: 'neutral' as const, details: [] },
          average_attendance: { value: 0, change: '0', trend: 'neutral' as const, department_breakdown: {} },
          average_tenure: { value: 0, unit: 'years', median: 0, trend: 'stable' }
        }
      }));
    }
  };

  const fetchFilters = async () => {
    try {
      const data = await employeeService.getEmployeeFilters();
      setState(prev => ({ ...prev, filters: data }));
    } catch (error) {
      console.error('Error fetching filters:', error);
      // Fallback filters
      setState(prev => ({
        ...prev,
        filters: {
          departments: [],
          statuses: [
            { value: 'active', label: 'Active', count: 0 },
            { value: 'inactive', label: 'Inactive', count: 0 }
          ]
        }
      }));
    }
  };

  const handleExport = async () => {
    try {
      const data = await employeeService.exportEmployeeData({
        format: 'csv',
        columns: ['name', 'email', 'department', 'attendance_rate', 'phone', 'status', 'joining_date'],
        department: filterParams.department || undefined,
        status: filterParams.status || undefined,
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
  }, [filterParams.page, filterParams.search, filterParams.department, filterParams.status]);

  useEffect(() => {
    // Load data sequentially to avoid race conditions
    const initializeData = async () => {
      try {
        // First, check if we can connect to the backend
        await employeeService.healthCheck();
        
        // Then load stats and filters in sequence, not parallel
        await fetchStats();
        await fetchFilters();
      } catch (error) {
        console.warn('Backend initialization failed:', error);
        // Don't set error state here - let individual functions handle their errors
      }
    };
    
    initializeData();
  }, []);

  const updateFilter = (key: keyof FilterParams, value: string | number) => {
    setFilterParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilterParams({ search: '', department: '', status: 'active', page: 1 });
  };

  const getAttendanceBadge = (rate: number) => {
    const numRate = Number(rate) || 0;
    if (numRate >= 98) return 'bg-green-100 text-green-700 hover:bg-green-100';
    if (numRate >= 95) return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700 hover:bg-green-100' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-100';
  };

  const statConfig = [
    { key: 'total_active' as const, label: 'Total Active', icon: Users, bg: 'bg-blue-100', color: 'text-blue-600', border: 'border-l-blue-600' },
    { key: 'new_this_month' as const, label: 'New This Month', icon: UserCheck, bg: 'bg-green-100', color: 'text-green-600', border: 'border-l-green-600' },
    { key: 'custom' as const, label: 'Avg. Attendance', icon: Calendar, bg: 'bg-purple-100', color: 'text-purple-600', border: 'border-l-purple-600', custom: true, value: '97.5%', change: '+1.2%' },
    { key: 'average_tenure' as const, label: 'Avg. Tenure', icon: Building2, bg: 'bg-orange-100', color: 'text-orange-600', border: 'border-l-orange-600' }
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Employees</h1>
          <p className="text-muted-foreground mt-1">Manage and view all currently active employees</p>
        </div>
        <Button onClick={handleExport} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </header>

      {/* Stats Cards */}
      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((config) => {
          const Icon = config.icon;
          
          let statData = null;
          if (!config.custom && state.stats) {
            switch (config.key) {
              case 'total_active':
                statData = state.stats.total_active;
                break;
              case 'new_this_month':
                statData = state.stats.new_this_month;
                break;
              case 'average_tenure':
                statData = state.stats.average_tenure;
                break;
              default:
                statData = null;
            }
          }
          
          const value = config.custom ? config.value : (statData?.value ?? 0);
          
          // Handle different stat types
          let change = undefined;
          let subtext = undefined;
          
          if (config.custom) {
            change = config.change;
          } else if (statData) {
            if ('change' in statData) {
              change = statData.change;
            }
            if ('unit' in statData) {
              subtext = statData.unit;
            }
          }

          return (
            <Card key={config.key} className={`border-l-4 ${config.border} p-6 transition-shadow hover:shadow-lg`}>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                  <p className="text-3xl font-bold">{value}</p>
                  {change && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>{change} from last month</span>
                    </div>
                  )}
                  {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${config.bg}`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Filters */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filterParams.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by name, ID, or department..."
              className="pl-10"
            />
          </div>

          <Select value={filterParams.department || "all"} onValueChange={(v: string) => updateFilter('department', v === "all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {state.filters?.departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterParams.search || filterParams.department) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </section>

      {/* Employee Table */}
      <Card>
        {state.loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : state.error ? (
          <div className="p-12 text-center">
            <p className="text-red-600">Error: {state.error}</p>
            <Button onClick={() => fetchEmployees()} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {['Employee', 'Contact', 'Department', 'Position', 'Attendance', 'Status', 'Actions'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {state.employees.length > 0 ? (
                    state.employees.map((emp) => (
                      <tr key={emp.id} className="transition-colors hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={emp.avatar_url} alt={emp.name} />
                              <AvatarFallback>
                                {emp.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-sm text-muted-foreground">{emp.employee_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">{emp.email}</span>
                            </div>
                            {emp.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">{emp.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{emp.department?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{emp.position}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getAttendanceBadge(emp.attendance_rate)}>
                            {emp.attendance_rate}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusBadge(emp.status)}>
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit className="h-4 w-4" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-red-600">
                                <Trash2 className="h-4 w-4" />Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-2 text-muted-foreground">No employees found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {state.pagination && state.employees.length > 0 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{state.employees.length}</span> of{' '}
                  <span className="font-medium">{state.pagination.total_count}</span> employees
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!state.pagination.has_previous}
                    onClick={() => setFilterParams(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!state.pagination.has_next}
                    onClick={() => setFilterParams(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}