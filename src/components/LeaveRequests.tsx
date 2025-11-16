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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Check,
  X,
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  Download,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface LeaveRequest {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  type: 'Sick Leave' | 'Vacation' | 'Personal Leave' | 'Emergency Leave' | 'Maternity/Paternity' | 'Unpaid Leave';
  from: string;
  to: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  appliedOn: string;
  contactNumber: string;
}

export function LeaveRequests() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const allRequests: LeaveRequest[] = [
    {
      id: 1,
      employeeId: 'EMP-001',
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Engineering',
      position: 'Senior Developer',
      type: 'Sick Leave',
      from: '2025-10-28',
      to: '2025-10-29',
      days: 2,
      status: 'pending',
      reason: 'Medical appointment and recovery. Need to visit the hospital for a scheduled checkup.',
      appliedOn: '2025-10-25',
      contactNumber: '+1 (555) 123-4567',
    },
    {
      id: 2,
      employeeId: 'EMP-002',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      department: 'Marketing',
      position: 'Marketing Manager',
      type: 'Vacation',
      from: '2025-11-05',
      to: '2025-11-10',
      days: 6,
      status: 'pending',
      reason: 'Family vacation planned for the holidays. All work will be completed before departure.',
      appliedOn: '2025-10-20',
      contactNumber: '+1 (555) 234-5678',
    },
    {
      id: 3,
      employeeId: 'EMP-003',
      name: 'Michael Brown',
      email: 'mbrown@company.com',
      department: 'Sales',
      position: 'Sales Executive',
      type: 'Personal Leave',
      from: '2025-10-30',
      to: '2025-10-30',
      days: 1,
      status: 'pending',
      reason: 'Personal matters that require immediate attention.',
      appliedOn: '2025-10-26',
      contactNumber: '+1 (555) 345-6789',
    },
    {
      id: 4,
      employeeId: 'EMP-004',
      name: 'Emily Davis',
      email: 'emily.d@company.com',
      department: 'Engineering',
      position: 'DevOps Engineer',
      type: 'Emergency Leave',
      from: '2025-10-27',
      to: '2025-10-27',
      days: 1,
      status: 'approved',
      reason: 'Family emergency requiring immediate attention.',
      appliedOn: '2025-10-26',
      contactNumber: '+1 (555) 456-7890',
    },
    {
      id: 5,
      employeeId: 'EMP-005',
      name: 'David Wilson',
      email: 'dwilson@company.com',
      department: 'HR',
      position: 'HR Specialist',
      type: 'Vacation',
      from: '2025-11-15',
      to: '2025-11-20',
      days: 6,
      status: 'approved',
      reason: 'Pre-planned vacation with family.',
      appliedOn: '2025-10-15',
      contactNumber: '+1 (555) 567-8901',
    },
    {
      id: 6,
      employeeId: 'EMP-006',
      name: 'Jennifer Lee',
      email: 'jlee@company.com',
      department: 'Finance',
      position: 'Financial Analyst',
      type: 'Sick Leave',
      from: '2025-10-24',
      to: '2025-10-24',
      days: 1,
      status: 'rejected',
      reason: 'Not feeling well, need rest.',
      appliedOn: '2025-10-24',
      contactNumber: '+1 (555) 678-9012',
    },
  ];

  const filteredRequests = allRequests.filter((request) => {
    const matchesTab = request.status === activeTab;
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    const matchesDepartment = departmentFilter === 'all' || request.department === departmentFilter;
    return matchesTab && matchesSearch && matchesType && matchesDepartment;
  });

  const pendingCount = allRequests.filter((r) => r.status === 'pending').length;

  const handleAction = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (selectedRequest && actionType) {
      const actionText = actionType === 'approve' ? 'approved' : 'rejected';
      toast.success(`Leave request ${actionText}`, {
        description: `${selectedRequest.name}'s leave request has been ${actionText} successfully.`,
      });
      setShowDialog(false);
      setSelectedRequest(null);
      setActionType(null);
    }
  };


  return (
    <main className="space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1>Leave Requests</h1>
              <p className="text-[14px] text-muted-foreground">
                Review and manage employee leave applications
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="default" className="gap-2 transition-all duration-200 hover:bg-accent">
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
          <Button size="default" className="gap-2 transition-all duration-200 hover:scale-[0.98]">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Leave Calendar</span>
          </Button>
        </div>
      </header>

      {/* Summary Statistics */}
      <section aria-label="Leave request summary">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-yellow-200 bg-linear-to-br from-yellow-50 to-background p-4 md:p-6 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Pending Requests</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-yellow-600">
                {pendingCount}
              </p>
              <p className="text-[11px] md:text-[12px] text-muted-foreground">Awaiting review</p>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Approved Today</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-green-600">5</p>
              <p className="text-[11px] md:text-[12px] text-muted-foreground">Last 24 hours</p>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-red-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Rejected Today</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-red-600">1</p>
              <p className="text-[11px] md:text-[12px] text-muted-foreground">Last 24 hours</p>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Total This Month</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <TrendingUp className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-blue-600">24</p>
              <p className="text-[11px] md:text-[12px] text-muted-foreground">All requests</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Filters and Tabs */}
      <section aria-label="Filters and tabs">
        <Card className="border-2 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Headers */}
            <div className="border-b border-border bg-muted/30 px-4 md:px-6 pt-4 md:pt-5">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">Pending</span>
                  {pendingCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-[11px]">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Approved</span>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Rejected</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Filters */}
            <div className="border-b border-border p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Search */}
                <div className="space-y-2">
                  <label htmlFor="search-input" className="text-[13px] md:text-[14px] font-medium text-muted-foreground">
                    Search Requests
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="search-input"
                      placeholder="Search by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Leave Type Filter */}
                <div className="space-y-2">
                  <label htmlFor="type-filter" className="text-[13px] md:text-[14px] font-medium text-muted-foreground">
                    Leave Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Vacation">Vacation</SelectItem>
                      <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                      <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                      <SelectItem value="Maternity/Paternity">Maternity/Paternity</SelectItem>
                      <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label htmlFor="dept-filter" className="text-[13px] md:text-[14px] font-medium text-muted-foreground">
                    Department
                  </label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger id="dept-filter">
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

            {/* Tab Content */}
            <div className="p-4 md:p-6">
              <TabsContent value="pending" className="mt-0">
                <RequestList requests={filteredRequests} onAction={handleAction} showActions={true} />
              </TabsContent>
              <TabsContent value="approved" className="mt-0">
                <RequestList requests={filteredRequests} onAction={handleAction} showActions={false} />
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                <RequestList requests={filteredRequests} onAction={handleAction} showActions={false} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </section>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Leave Request?' : 'Reject Leave Request?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to {actionType} the leave request from{' '}
                  <span className="font-semibold text-foreground">{selectedRequest?.name}</span>?
                </p>
                {selectedRequest && (
                  <div className="rounded-lg border border-border bg-muted/50 p-4 text-[13px] space-y-2">
                    <p>
                      <span className="font-medium text-foreground">Leave Type:</span> {selectedRequest.type}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Duration:</span>{' '}
                      {new Date(selectedRequest.from).toLocaleDateString()} -{' '}
                      {new Date(selectedRequest.to).toLocaleDateString()} ({selectedRequest.days} days)
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

// Request List Component
function RequestList({
  requests,
  onAction,
  showActions,
}: {
  requests: LeaveRequest[];
  onAction: (request: LeaveRequest, action: 'approve' | 'reject') => void;
  showActions: boolean;
}) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      'Sick Leave': 'bg-red-50 text-red-700 border-red-200',
      'Vacation': 'bg-blue-50 text-blue-700 border-blue-200',
      'Personal Leave': 'bg-purple-50 text-purple-700 border-purple-200',
      'Emergency Leave': 'bg-orange-50 text-orange-700 border-orange-200',
      'Maternity/Paternity': 'bg-green-50 text-green-700 border-green-200',
      'Unpaid Leave': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Search className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[16px] font-medium">No requests found</p>
          <p className="text-[14px]">Try adjusting your filters or search query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card
          key={request.id}
          className="border border-border p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Employee Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-border">
                  <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
                    <span className="text-[16px] font-semibold text-primary">{getInitials(request.name)}</span>
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[18px] font-semibold leading-tight tracking-tight">{request.name}</h3>
                    <Badge variant="outline" className={`border px-2.5 py-0.5 ${getLeaveTypeColor(request.type)}`}>
                      <span className="text-[12px] font-semibold">{request.type}</span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-[13px] md:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{request.employeeId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{request.department} • {request.position}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{request.contactNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">From Date</p>
                      <p className="text-[14px] font-semibold">{new Date(request.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">To Date</p>
                      <p className="text-[14px] font-semibold">{new Date(request.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-background p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <CalendarDays className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Duration</p>
                    <p className="text-[14px] font-semibold text-blue-600">
                      {request.days} {request.days === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Applied On</p>
                    <p className="text-[13px] font-medium">{new Date(request.appliedOn).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Reason</p>
                  <p className="text-[14px] leading-relaxed text-foreground">{request.reason}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex flex-row gap-3 lg:flex-col lg:gap-2">
                <Button
                  onClick={() => onAction(request, 'approve')}
                  className="flex-1 gap-2 bg-green-600 transition-all duration-200 hover:bg-green-700 lg:flex-initial"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Approve
                </Button>
                <Button
                  onClick={() => onAction(request, 'reject')}
                  variant="outline"
                  className="flex-1 gap-2 border-red-200 text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 lg:flex-initial"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
