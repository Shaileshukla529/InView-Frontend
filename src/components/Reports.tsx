import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import {
  Download,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  UserX,
  Building2,
  BarChart3,
  FileSpreadsheet,
  Filter,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  File,
  CalendarClock,
  Repeat,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: typeof Calendar;
  color: string;
  bgColor: string;
  category: 'attendance' | 'leave' | 'performance' | 'analytics';
}

interface RecentReport {
  id: string;
  name: string;
  date: string;
  size: string;
  status: 'completed' | 'processing' | 'failed';
  format: 'PDF' | 'Excel' | 'CSV';
}

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleReport, setScheduleReport] = useState('');

  const reports: ReportCard[] = [
    {
      id: 'monthly-attendance',
      title: 'Monthly Attendance Report',
      description: 'Complete attendance summary for the month',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      category: 'attendance',
    },
    {
      id: 'employee-performance',
      title: 'Employee Performance Report',
      description: 'Individual employee attendance metrics',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      category: 'performance',
    },
    {
      id: 'department-summary',
      title: 'Department Summary',
      description: 'Department-wise attendance analytics',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      category: 'analytics',
    },
    {
      id: 'leave-balance',
      title: 'Leave Balance Report',
      description: 'Current leave balances for all employees',
      icon: CalendarDays,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      category: 'leave',
    },
    {
      id: 'late-arrivals',
      title: 'Late Arrivals Report',
      description: 'Track employees with late arrivals',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      category: 'attendance',
    },
    {
      id: 'absenteeism',
      title: 'Absenteeism Report',
      description: 'Detailed absenteeism analysis',
      icon: UserX,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      category: 'analytics',
    },
  ];

  const recentReports: RecentReport[] = [
    {
      id: '1',
      name: 'Monthly Attendance - September 2025',
      date: '2025-10-01',
      size: '2.4 MB',
      status: 'completed',
      format: 'PDF',
    },
    {
      id: '2',
      name: 'Department Summary - Q3 2025',
      date: '2025-09-30',
      size: '1.8 MB',
      status: 'completed',
      format: 'Excel',
    },
    {
      id: '3',
      name: 'Leave Balance Report - September',
      date: '2025-09-28',
      size: '856 KB',
      status: 'completed',
      format: 'CSV',
    },
    {
      id: '4',
      name: 'Employee Performance - Q3 2025',
      date: '2025-09-25',
      size: '3.2 MB',
      status: 'completed',
      format: 'PDF',
    },
  ];

  const filteredReports = reports.filter((report) => {
    if (selectedCategory === 'all') return true;
    return report.category === selectedCategory;
  });

  const handleGenerateReport = (reportTitle: string) => {
    toast.success('Report generation started', {
      description: `Generating ${reportTitle}. You'll be notified when it's ready.`,
    });
  };

  const handleDownloadReport = (reportName: string) => {
    toast.success('Download started', {
      description: `Downloading ${reportName}`,
    });
  };

  const handleToggleReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const handleToggleAll = () => {
    if (selectedReports.length === recentReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(recentReports.map((r) => r.id));
    }
  };

  const handleDownloadSelected = () => {
    if (selectedReports.length === 0) {
      toast.error('No reports selected', {
        description: 'Please select at least one report to download.',
      });
      return;
    }
    toast.success('Bulk download started', {
      description: `Downloading ${selectedReports.length} report(s)`,
    });
    setSelectedReports([]);
  };

  const handleScheduleReport = (reportTitle: string) => {
    setScheduleReport(reportTitle);
    setShowScheduleDialog(true);
  };

  const handleSaveSchedule = () => {
    toast.success('Report scheduled', {
      description: `${scheduleReport} will be generated ${scheduleFrequency}`,
    });
    setShowScheduleDialog(false);
    setScheduleReport('');
    setScheduleFrequency('daily');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: <CheckCircle2 className="h-3 w-3" aria-hidden="true" />,
        label: 'Completed',
      },
      processing: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Clock className="h-3 w-3" aria-hidden="true" />,
        label: 'Processing',
      },
      failed: {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <AlertCircle className="h-3 w-3" aria-hidden="true" />,
        label: 'Failed',
      },
    };
    const variant = variants[status as keyof typeof variants];
    return (
      <Badge variant="outline" className={`gap-1 border px-2 py-0.5 ${variant.color}`}>
        {variant.icon}
        <span className="text-[11px] font-semibold">{variant.label}</span>
      </Badge>
    );
  };

  const getFormatBadge = (format: string) => {
    const colors = {
      PDF: 'bg-red-50 text-red-700',
      Excel: 'bg-green-50 text-green-700',
      CSV: 'bg-blue-50 text-blue-700',
    };
    return (
      <Badge variant="secondary" className={colors[format as keyof typeof colors]}>
        <span className="text-[11px] font-semibold">{format}</span>
      </Badge>
    );
  };

  return (
    <main className="space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1>Reports</h1>
              <p className="text-[14px] text-muted-foreground">
                Generate and download various attendance reports
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
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
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="leave">Leave</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Summary Cards */}
      <section aria-label="Report summary statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Total Reports</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-blue-600">6</p>
              <p className="text-[11px] md:text-[12px] text-muted-foreground">Report Templates Available</p>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Generated</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold leading-none tracking-tight text-green-600">24</p>
              <p className="text-[11px] md:text-[12px] text-muted-foreground">This month</p>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-purple-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Most Popular</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <TrendingUp className="h-5 w-5 text-purple-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[14px] md:text-[16px] font-semibold leading-tight tracking-tight text-purple-600">
                Monthly Attendance
              </p>
              <p className="text-[11px] md:text-[12px] text-muted-foreground">15 downloads</p>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">Last Generated</p>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                  <Clock className="h-5 w-5 text-orange-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-[14px] md:text-[16px] font-semibold leading-tight tracking-tight text-orange-600">
                2 hours ago
              </p>
              <p className="text-[11px] md:text-[12px] text-muted-foreground">Department Summary</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Report Cards Grid */}
      <section aria-label="Available reports">
        <Card className="border-2 shadow-sm">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <h3 className="text-[18px] font-semibold leading-tight tracking-tight">Available Reports</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Select a report to generate and download
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '20px' }}>
              {filteredReports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card
                    key={report.id}
                    className="border-2 border-border shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md flex flex-col"
                  >
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-6 flex flex-1 items-start gap-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${report.bgColor}`}>
                          <Icon className={`h-7 w-7 ${report.color}`} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[16px] font-semibold leading-tight tracking-tight">{report.title}</h4>
                          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 gap-2 transition-all duration-200 hover:scale-[0.98]"
                          onClick={() => handleGenerateReport(report.title)}
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Generate
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 transition-all duration-200 hover:scale-[0.98]"
                          onClick={() => handleScheduleReport(report.title)}
                          title="Schedule Report"
                        >
                          <CalendarClock className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredReports.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Filter className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-[16px] font-medium">No reports found</p>
                  <p className="text-[14px]">Try adjusting your category filter</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Recent Reports */}
      <section aria-label="Recent reports">
        <Card className="border-2 shadow-sm">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-[18px] font-semibold leading-tight tracking-tight">Recent Reports</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Previously generated reports available for download
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedReports.length > 0 && (
                  <Button
                    onClick={handleDownloadSelected}
                    className="gap-2"
                    size="default"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download Selected ({selectedReports.length})
                  </Button>
                )}
                <Badge variant="secondary" className="gap-1.5">
                  <File className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-[12px] font-semibold">{recentReports.length} Reports</span>
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {/* Select All Row */}
              <div 
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-muted/70 hover:border-primary/30"
                onClick={handleToggleAll}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleAll();
                  }
                }}
                aria-label={`Select all reports. Currently ${selectedReports.length === recentReports.length ? 'all selected' : selectedReports.length + ' of ' + recentReports.length + ' selected'}`}
              >
                <Checkbox
                  id="select-all"
                  checked={selectedReports.length === recentReports.length}
                  onCheckedChange={handleToggleAll}
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={-1}
                />
                <Label
                  htmlFor="select-all"
                  className="text-[14px] font-medium cursor-pointer flex-1 pointer-events-none"
                >
                  Select All ({recentReports.length} reports)
                </Label>
                {selectedReports.length > 0 && (
                  <span className="text-[13px] text-muted-foreground">
                    {selectedReports.length} selected
                  </span>
                )}
              </div>

              {/* Report Items */}
              {recentReports.map((report) => (
                <Card
                  key={report.id}
                  className={`border border-border p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md cursor-pointer ${
                    selectedReports.includes(report.id) ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() => handleToggleReport(report.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleReport(report.id);
                    }
                  }}
                  aria-label={`${selectedReports.includes(report.id) ? 'Deselect' : 'Select'} ${report.name}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <Checkbox
                        id={`report-${report.id}`}
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={() => handleToggleReport(report.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                        tabIndex={-1}
                      />
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted pointer-events-none">
                        <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0 pointer-events-none">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-[15px] font-semibold leading-tight">{report.name}</h4>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          {getFormatBadge(report.format)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="default"
                      className="gap-2 transition-all duration-200 hover:bg-accent sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReport(report.name);
                      }}
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Repeat className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              Schedule Report
            </DialogTitle>
            <DialogDescription>
              Set up automatic generation for "{scheduleReport}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="frequency" className="text-[14px] font-medium">
                Frequency
              </Label>
              <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <span>Daily</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>Weekly</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      <span>Monthly</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="quarterly">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" aria-hidden="true" />
                      <span>Quarterly</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  <CheckCircle2 className="h-3 w-3 text-white" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-medium text-blue-900">
                    Scheduled Report Details
                  </p>
                  <p className="text-[12px] text-blue-800">
                    This report will be automatically generated {scheduleFrequency} and sent to your email.
                    You can modify or cancel this schedule anytime from Settings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} className="gap-2">
              <Repeat className="h-4 w-4" aria-hidden="true" />
              Schedule Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
