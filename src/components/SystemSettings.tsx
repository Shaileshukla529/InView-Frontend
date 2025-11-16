import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
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
import { Slider } from './ui/slider';
import {
  Settings,
  Building2,
  Clock,
  Camera,
  Bell,
  Shield,
  Palette,
  Mail,
  Globe,
  Users,
  CalendarClock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Info,
  Save,
  RotateCcw,
  Download,
  Upload,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Languages,
  MapPin,
  DollarSign,
  FileText,
  Lock,
  Key,
  UserCheck,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // General Settings State
  const [companyName, setCompanyName] = useState('In View Systems');
  const [timezone, setTimezone] = useState('UTC-05:00');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

  // Attendance Settings State
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [lateThreshold, setLateThreshold] = useState(15);
  const [gracePeriod, setGracePeriod] = useState(5);
  const [earlyLeaveThreshold, setEarlyLeaveThreshold] = useState(15);
  const [autoClockOut, setAutoClockOut] = useState(true);
  const [overtimeTracking, setOvertimeTracking] = useState(true);
  const [breakTimeTracking, setBreakTimeTracking] = useState(false);

  // Face Recognition Settings State
  const [enableFaceRecognition, setEnableFaceRecognition] = useState(true);
  const [autoVerifyAttendance, setAutoVerifyAttendance] = useState(true);
  const [unknownFaceAlerts, setUnknownFaceAlerts] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState([85]);
  const [liveDetection, setLiveDetection] = useState(true);
  const [antiSpoofing, setAntiSpoofing] = useState(true);
  const [multipleDetections, setMultipleDetections] = useState(true);

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);
  const [lateArrivalAlerts, setLateArrivalAlerts] = useState(true);
  const [leaveRequestAlerts, setLeaveRequestAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Security Settings State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [passwordExpiry, setPasswordExpiry] = useState(90);
  const [loginAttempts, setLoginAttempts] = useState(5);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [auditLogging, setAuditLogging] = useState(true);

  // Appearance Settings State
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const handleSaveChanges = () => {
    toast.success('Settings saved successfully', {
      description: 'Your changes have been applied to the system.',
    });
    setHasChanges(false);
  };

  const handleResetToDefaults = () => {
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    // Reset all settings to defaults
    setCompanyName('In View Systems');
    setTimezone('UTC-05:00');
    setWorkStartTime('09:00');
    setWorkEndTime('18:00');
    setLateThreshold(15);
    setGracePeriod(5);
    setConfidenceThreshold([85]);
    setTheme('light');
    
    toast.success('Settings reset', {
      description: 'All settings have been restored to default values.',
    });
    setShowResetDialog(false);
    setHasChanges(false);
  };

  const handleExportSettings = () => {
    toast.success('Settings exported', {
      description: 'Configuration file has been downloaded.',
    });
  };

  const handleImportSettings = () => {
    setShowImportDialog(true);
  };

  const confirmImport = () => {
    toast.success('Settings imported', {
      description: 'Configuration has been loaded successfully.',
    });
    setShowImportDialog(false);
  };

  const handleApplyChanges = () => {
    toast.success('Settings applied', {
      description: 'Changes applied. Click "Save & Close" to finalize.',
    });
  };

  return (
    <main className="mx-auto w-full max-w-full space-y-4 sm:space-y-6 md:space-y-8 lg:max-w-6xl">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
              <Settings className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="wrap-break-words">System Settings</h1>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                Configure system preferences, security, and operational settings
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <TooltipProvider>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="gap-2 transition-all duration-200 hover:bg-accent"
                  onClick={handleImportSettings}
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-[13px]">Upload previously exported settings file</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="gap-2 transition-all duration-200 hover:bg-accent"
                  onClick={handleExportSettings}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-[13px]">Download all system settings as JSON</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </header>

      {/* Settings Tabs */}
      <Card className="border-2 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="border-b border-border bg-muted/30">
            <div className="scrollbar-hide overflow-x-auto">
              <TabsList className="inline-flex h-auto w-full min-w-max justify-start rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="general"
                  className="gap-1.5 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-[13px] sm:gap-2 sm:px-3 sm:py-3 sm:text-[14px] md:px-4 md:py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Settings className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">General</span>
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="gap-1.5 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-[13px] sm:gap-2 sm:px-3 sm:py-3 sm:text-[14px] md:px-4 md:py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <CalendarClock className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">Attendance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="face-recognition"
                  className="gap-1.5 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-[13px] sm:gap-2 sm:px-3 sm:py-3 sm:text-[14px] md:px-4 md:py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <UserCheck className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">Face Recognition</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="gap-1.5 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-[13px] sm:gap-2 sm:px-3 sm:py-3 sm:text-[14px] md:px-4 md:py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Bell className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">Notifications</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="gap-1.5 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-[13px] sm:gap-2 sm:px-3 sm:py-3 sm:text-[14px] md:px-4 md:py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">Security</span>
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="gap-1.5 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-[13px] sm:gap-2 sm:px-3 sm:py-3 sm:text-[14px] md:px-4 md:py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Palette className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">Appearance</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* General Settings */}
            <TabsContent value="general" className="mt-0 space-y-6 sm:space-y-8">
              {/* Company Information */}
              <section>
                <div className="mb-4 flex items-start gap-2 sm:mb-6 sm:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                    <Building2 className="h-4 w-4 text-primary sm:h-5 sm:w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-semibold leading-tight tracking-tight sm:text-[18px]">Company Information</h3>
                    <p className="mt-1 text-[12px] text-muted-foreground sm:text-[13px]">
                      Configure your organization's basic details and branding
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-[13px] font-medium sm:text-[14px]">
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="Enter company name"
                      />
                      <p className="text-[11px] text-muted-foreground sm:text-[12px]">This will appear on reports and documents</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-[13px] font-medium sm:text-[14px]">
                        Language
                      </Label>
                      <Select value={language} onValueChange={(val: string) => { setLanguage(val); setHasChanges(true); }}>
                        <SelectTrigger id="language">
                          <Languages className="mr-2 h-4 w-4" aria-hidden="true" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="en-gb">English (UK)</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-[13px] font-medium sm:text-[14px]">
                        Timezone
                      </Label>
                      <Select value={timezone} onValueChange={(val: string) => { setTimezone(val); setHasChanges(true); }}>
                        <SelectTrigger id="timezone">
                          <Globe className="mr-2 h-4 w-4" aria-hidden="true" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-12:00">UTC-12:00 (Baker Island)</SelectItem>
                          <SelectItem value="UTC-11:00">UTC-11:00 (American Samoa)</SelectItem>
                          <SelectItem value="UTC-10:00">UTC-10:00 (Hawaii)</SelectItem>
                          <SelectItem value="UTC-09:00">UTC-09:00 (Alaska)</SelectItem>
                          <SelectItem value="UTC-08:00">UTC-08:00 (Pacific Time)</SelectItem>
                          <SelectItem value="UTC-07:00">UTC-07:00 (Mountain Time)</SelectItem>
                          <SelectItem value="UTC-06:00">UTC-06:00 (Central Time)</SelectItem>
                          <SelectItem value="UTC-05:00">UTC-05:00 (Eastern Time)</SelectItem>
                          <SelectItem value="UTC-04:00">UTC-04:00 (Atlantic Time)</SelectItem>
                          <SelectItem value="UTC+00:00">UTC+00:00 (GMT/London)</SelectItem>
                          <SelectItem value="UTC+01:00">UTC+01:00 (Central European)</SelectItem>
                          <SelectItem value="UTC+08:00">UTC+08:00 (Singapore/Beijing)</SelectItem>
                          <SelectItem value="UTC+09:00">UTC+09:00 (Tokyo)</SelectItem>
                          <SelectItem value="UTC+10:00">UTC+10:00 (Sydney)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-[13px] font-medium sm:text-[14px]">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={(val: string) => { setCurrency(val); setHasChanges(true); }}>
                        <SelectTrigger id="currency">
                          <DollarSign className="mr-2 h-4 w-4" aria-hidden="true" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateFormat" className="text-[13px] font-medium sm:text-[14px]">
                        Date Format
                      </Label>
                      <Select value={dateFormat} onValueChange={(val: string) => { setDateFormat(val); setHasChanges(true); }}>
                        <SelectTrigger id="dateFormat">
                          <CalendarClock className="mr-2 h-4 w-4" aria-hidden="true" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (10/24/2025)</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (24/10/2025)</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-10-24)</SelectItem>
                          <SelectItem value="DD MMM YYYY">DD MMM YYYY (24 Oct 2025)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeFormat" className="text-[13px] font-medium sm:text-[14px]">
                        Time Format
                      </Label>
                      <Select value={timeFormat} onValueChange={(val: string) => { setTimeFormat(val); setHasChanges(true); }}>
                        <SelectTrigger id="timeFormat">
                          <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (02:30 PM)</SelectItem>
                          <SelectItem value="24h">24-hour (14:30)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* Attendance Settings */}
            <TabsContent value="attendance" className="mt-0 space-y-6 sm:space-y-8">
              {/* Work Hours */}
              <section>
                <div className="mb-4 flex items-start gap-2 sm:mb-6 sm:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 sm:h-10 sm:w-10">
                    <Clock className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-semibold leading-tight tracking-tight sm:text-[18px]">Work Hours & Schedules</h3>
                    <p className="mt-1 text-[12px] text-muted-foreground sm:text-[13px]">
                      Define standard working hours and attendance policies
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="workStartTime" className="text-[13px] font-medium sm:text-[14px]">
                        Work Start Time
                      </Label>
                      <Input
                        id="workStartTime"
                        type="time"
                        value={workStartTime}
                        onChange={(e) => {
                          setWorkStartTime(e.target.value);
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workEndTime" className="text-[13px] font-medium sm:text-[14px]">
                        Work End Time
                      </Label>
                      <Input
                        id="workEndTime"
                        type="time"
                        value={workEndTime}
                        onChange={(e) => {
                          setWorkEndTime(e.target.value);
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lateThreshold" className="text-[13px] font-medium sm:text-[14px]">
                        Late Threshold (minutes)
                      </Label>
                      <Input
                        id="lateThreshold"
                        type="number"
                        min="0"
                        max="60"
                        value={lateThreshold}
                        onChange={(e) => {
                          setLateThreshold(parseInt(e.target.value));
                          setHasChanges(true);
                        }}
                      />
                      <p className="text-[11px] text-muted-foreground sm:text-[12px]">
                        Time after start time to mark as late
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gracePeriod" className="text-[13px] font-medium sm:text-[14px]">
                        Grace Period (minutes)
                      </Label>
                      <Input
                        id="gracePeriod"
                        type="number"
                        min="0"
                        max="30"
                        value={gracePeriod}
                        onChange={(e) => {
                          setGracePeriod(parseInt(e.target.value));
                          setHasChanges(true);
                        }}
                      />
                      <p className="text-[11px] text-muted-foreground sm:text-[12px]">
                        Buffer time before marking as late
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="earlyLeaveThreshold" className="text-[13px] font-medium sm:text-[14px]">
                        Early Leave Threshold (minutes)
                      </Label>
                      <Input
                        id="earlyLeaveThreshold"
                        type="number"
                        min="0"
                        max="60"
                        value={earlyLeaveThreshold}
                        onChange={(e) => {
                          setEarlyLeaveThreshold(parseInt(e.target.value));
                          setHasChanges(true);
                        }}
                      />
                      <p className="text-[11px] text-muted-foreground sm:text-[12px]">
                        Time before end time to mark as early leave
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Attendance Features */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-[15px] font-semibold sm:text-[16px]">Attendance Features</h4>
                    
                    <Card className="border-2 p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 sm:h-5 sm:w-5" aria-hidden="true" />
                            <Label htmlFor="autoClockOut" className="text-[14px] font-semibold sm:text-[15px]">
                              Auto Clock-Out
                            </Label>
                          </div>
                          <p className="mt-1.5 text-[12px] text-muted-foreground sm:mt-2 sm:text-[13px]">
                            Automatically clock out employees at end of work day if they forgot
                          </p>
                        </div>
                        <Switch
                          id="autoClockOut"
                          checked={autoClockOut}
                          onCheckedChange={(checked: boolean) => {
                            setAutoClockOut(checked);
                            setHasChanges(true);
                          }}
                          className="shrink-0"
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <Clock className="h-4 w-4 shrink-0 text-blue-600 sm:h-5 sm:w-5" aria-hidden="true" />
                            <Label htmlFor="overtimeTracking" className="text-[14px] font-semibold sm:text-[15px]">
                              Overtime Tracking
                            </Label>
                          </div>
                          <p className="mt-1.5 text-[12px] text-muted-foreground sm:mt-2 sm:text-[13px]">
                            Track and record overtime hours beyond standard work hours
                          </p>
                        </div>
                        <Switch
                          id="overtimeTracking"
                          checked={overtimeTracking}
                          onCheckedChange={(checked: boolean) => {
                            setOvertimeTracking(checked);
                            setHasChanges(true);
                          }}
                          className="shrink-0"
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <Activity className="h-4 w-4 shrink-0 text-orange-600 sm:h-5 sm:w-5" aria-hidden="true" />
                            <Label htmlFor="breakTimeTracking" className="text-[14px] font-semibold sm:text-[15px]">
                              Break Time Tracking
                            </Label>
                          </div>
                          <p className="mt-1.5 text-[12px] text-muted-foreground sm:mt-2 sm:text-[13px]">
                            Monitor and log employee break times throughout the day
                          </p>
                        </div>
                        <Switch
                          id="breakTimeTracking"
                          checked={breakTimeTracking}
                          onCheckedChange={(checked: boolean) => {
                            setBreakTimeTracking(checked);
                            setHasChanges(true);
                          }}
                          className="shrink-0"
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* Face Recognition Settings */}
            <TabsContent value="face-recognition" className="mt-0 space-y-6 sm:space-y-8">
              <section>
                <div className="mb-4 flex items-start gap-2 sm:mb-6 sm:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 sm:h-10 sm:w-10">
                    <Camera className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-semibold leading-tight tracking-tight sm:text-[18px]">
                      Face Recognition Configuration
                    </h3>
                    <p className="mt-1 text-[12px] text-muted-foreground sm:text-[13px]">
                      Configure AI-powered face detection and recognition settings
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Core Features */}
                  <div className="space-y-3 sm:space-y-4">
                    <Card className="border-2 p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <Camera className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" aria-hidden="true" />
                            <Label htmlFor="enableFaceRecognition" className="text-[14px] font-semibold sm:text-[15px]">
                              Enable Face Recognition
                            </Label>
                            <Badge variant="secondary" className="bg-green-50 text-[11px] text-green-700 sm:text-[12px]">
                              Core Feature
                            </Badge>
                          </div>
                          <p className="mt-1.5 text-[12px] text-muted-foreground sm:mt-2 sm:text-[13px]">
                            Use AI-powered face detection and recognition for attendance tracking
                          </p>
                        </div>
                        <Switch
                          id="enableFaceRecognition"
                          checked={enableFaceRecognition}
                          onCheckedChange={(checked: boolean) => {
                            setEnableFaceRecognition(checked);
                            setHasChanges(true);
                          }}
                          className="shrink-0"
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 sm:h-5 sm:w-5" aria-hidden="true" />
                            <Label htmlFor="autoVerifyAttendance" className="text-[14px] font-semibold sm:text-[15px]">
                              Auto-Verify Attendance
                            </Label>
                          </div>
                          <p className="mt-1.5 text-[12px] text-muted-foreground sm:mt-2 sm:text-[13px]">
                            Automatically mark attendance when a face is successfully recognized
                          </p>
                        </div>
                        <Switch
                          id="autoVerifyAttendance"
                          checked={autoVerifyAttendance}
                          onCheckedChange={(checked: boolean) => {
                            setAutoVerifyAttendance(checked);
                            setHasChanges(true);
                          }}
                          className="shrink-0"
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 text-orange-600 sm:h-5 sm:w-5" aria-hidden="true" />
                            <Label htmlFor="unknownFaceAlerts" className="text-[14px] font-semibold sm:text-[15px]">
                              Unknown Face Alerts
                            </Label>
                          </div>
                          <p className="mt-1.5 text-[12px] text-muted-foreground sm:mt-2 sm:text-[13px]">
                            Send notifications when unrecognized faces are detected by cameras
                          </p>
                        </div>
                        <Switch
                          id="unknownFaceAlerts"
                          checked={unknownFaceAlerts}
                          onCheckedChange={(checked: boolean) => {
                            setUnknownFaceAlerts(checked);
                            setHasChanges(true);
                          }}
                          className="shrink-0"
                        />
                      </div>
                    </Card>
                  </div>

                  <Separator />

                  {/* Recognition Confidence */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="confidenceSlider" className="text-[14px] font-semibold sm:text-[15px]">
                        Recognition Confidence Threshold
                      </Label>
                      <p className="mt-1 text-[12px] text-muted-foreground sm:text-[13px]">
                        Minimum confidence level required for successful face recognition
                      </p>
                    </div>
                    
                    <Card className="border-2 p-4 sm:p-5 md:p-6">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                              <Zap className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="text-[18px] font-semibold sm:text-[20px]">{confidenceThreshold[0]}%</p>
                              <p className="text-[11px] text-muted-foreground sm:text-[12px]">Current threshold</p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-[11px] sm:text-[12px] ${
                              confidenceThreshold[0] >= 90
                                ? 'bg-green-50 text-green-700'
                                : confidenceThreshold[0] >= 80
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-orange-50 text-orange-700'
                            }`}
                          >
                            {confidenceThreshold[0] >= 90 ? 'High Accuracy' : confidenceThreshold[0] >= 80 ? 'Balanced' : 'More Tolerant'}
                          </Badge>
                        </div>
                        
                        <Slider
                          id="confidenceSlider"
                          min={50}
                          max={99}
                          step={1}
                          value={confidenceThreshold}
                          onValueChange={(value: number[]) => {
                            setConfidenceThreshold(value);
                            setHasChanges(true);
                          }}
                          className="w-full"
                        />
                        
                        <div className="flex justify-between text-[10px] text-muted-foreground sm:text-[11px] md:text-[12px]">
                          <span>50% - More Tolerant</span>
                          <span>99% - Highly Strict</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Separator />

                  {/* Advanced Features */}
                  <div className="space-y-4">
                    <h4 className="text-[16px] font-semibold">Advanced Features</h4>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-red-600" aria-hidden="true" />
                            <Label htmlFor="liveDetection" className="text-[15px] font-semibold">
                              Liveness Detection
                            </Label>
                            <Badge variant="secondary" className="bg-red-50 text-red-700">
                              Security
                            </Badge>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Detect and prevent spoofing attempts using photos or videos
                          </p>
                        </div>
                        <Switch
                          id="liveDetection"
                          checked={liveDetection}
                          onCheckedChange={(checked: boolean) => {
                            setLiveDetection(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                            <Label htmlFor="antiSpoofing" className="text-[15px] font-semibold">
                              Anti-Spoofing Protection
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Enhanced protection against masks, printed photos, and deepfakes
                          </p>
                        </div>
                        <Switch
                          id="antiSpoofing"
                          checked={antiSpoofing}
                          onCheckedChange={(checked: boolean) => {
                            setAntiSpoofing(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            <Label htmlFor="multipleDetections" className="text-[15px] font-semibold">
                              Multiple Face Detection
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Detect and process multiple faces in a single camera frame
                          </p>
                        </div>
                        <Switch
                          id="multipleDetections"
                          checked={multipleDetections}
                          onCheckedChange={(checked: boolean) => {
                            setMultipleDetections(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="mt-0 space-y-8">
              <section>
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                    <Bell className="h-5 w-5 text-orange-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold leading-tight tracking-tight">
                      Notification Preferences
                    </h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Configure how and when you receive system notifications
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Notification Channels */}
                  <div className="space-y-4">
                    <h4 className="text-[16px] font-semibold">Notification Channels</h4>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            <Label htmlFor="emailNotifications" className="text-[15px] font-semibold">
                              Email Notifications
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Receive notifications and reports via email
                          </p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={emailNotifications}
                          onCheckedChange={(checked: boolean) => {
                            setEmailNotifications(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-green-600" aria-hidden="true" />
                            <Label htmlFor="pushNotifications" className="text-[15px] font-semibold">
                              Push Notifications
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Get instant alerts on your mobile device
                          </p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={pushNotifications}
                          onCheckedChange={(checked: boolean) => {
                            setPushNotifications(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-purple-600" aria-hidden="true" />
                            <Label htmlFor="smsNotifications" className="text-[15px] font-semibold">
                              SMS Notifications
                            </Label>
                            <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                              Premium
                            </Badge>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Receive critical alerts via text message
                          </p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={smsNotifications}
                          onCheckedChange={(checked: boolean) => {
                            setSmsNotifications(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>
                  </div>

                  <Separator />

                  {/* Notification Types */}
                  <div className="space-y-4">
                    <h4 className="text-[16px] font-semibold">Notification Types</h4>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            <Label htmlFor="dailySummary" className="text-[15px] font-semibold">
                              Daily Summary Report
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Receive daily attendance summary every evening at 6:00 PM
                          </p>
                        </div>
                        <Switch
                          id="dailySummary"
                          checked={dailySummary}
                          onCheckedChange={(checked: boolean) => {
                            setDailySummary(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-600" aria-hidden="true" />
                            <Label htmlFor="lateArrivalAlerts" className="text-[15px] font-semibold">
                              Late Arrival Alerts
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Get notified when employees arrive late to work
                          </p>
                        </div>
                        <Switch
                          id="lateArrivalAlerts"
                          checked={lateArrivalAlerts}
                          onCheckedChange={(checked: boolean) => {
                            setLateArrivalAlerts(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="h-5 w-5 text-green-600" aria-hidden="true" />
                            <Label htmlFor="leaveRequestAlerts" className="text-[15px] font-semibold">
                              Leave Request Alerts
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Notifications for new leave requests requiring approval
                          </p>
                        </div>
                        <Switch
                          id="leaveRequestAlerts"
                          checked={leaveRequestAlerts}
                          onCheckedChange={(checked: boolean) => {
                            setLeaveRequestAlerts(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                            <Label htmlFor="systemAlerts" className="text-[15px] font-semibold">
                              System Alerts
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Critical system notifications, errors, and maintenance alerts
                          </p>
                        </div>
                        <Switch
                          id="systemAlerts"
                          checked={systemAlerts}
                          onCheckedChange={(checked: boolean) => {
                            setSystemAlerts(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="mt-0 space-y-8">
              <section>
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <Shield className="h-5 w-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold leading-tight tracking-tight">Security & Access Control</h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Configure security policies and access controls for the system
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Authentication */}
                  <div className="space-y-4">
                    <h4 className="text-[16px] font-semibold">Authentication & Access</h4>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-green-600" aria-hidden="true" />
                            <Label htmlFor="twoFactorAuth" className="text-[15px] font-semibold">
                              Two-Factor Authentication
                            </Label>
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                              Recommended
                            </Badge>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Require 2FA for all admin accounts for enhanced security
                          </p>
                        </div>
                        <Switch
                          id="twoFactorAuth"
                          checked={twoFactorAuth}
                          onCheckedChange={(checked: boolean) => {
                            setTwoFactorAuth(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout" className="text-[14px] font-medium">
                          Session Timeout (minutes)
                        </Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          min="5"
                          max="120"
                          value={sessionTimeout}
                          onChange={(e) => {
                            setSessionTimeout(parseInt(e.target.value));
                            setHasChanges(true);
                          }}
                        />
                        <p className="text-[12px] text-muted-foreground">
                          Auto logout after inactivity period
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="loginAttempts" className="text-[14px] font-medium">
                          Max Login Attempts
                        </Label>
                        <Input
                          id="loginAttempts"
                          type="number"
                          min="3"
                          max="10"
                          value={loginAttempts}
                          onChange={(e) => {
                            setLoginAttempts(parseInt(e.target.value));
                            setHasChanges(true);
                          }}
                        />
                        <p className="text-[12px] text-muted-foreground">
                          Lock account after failed attempts
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="passwordExpiry" className="text-[14px] font-medium">
                          Password Expiry (days)
                        </Label>
                        <Input
                          id="passwordExpiry"
                          type="number"
                          min="30"
                          max="365"
                          value={passwordExpiry}
                          onChange={(e) => {
                            setPasswordExpiry(parseInt(e.target.value));
                            setHasChanges(true);
                          }}
                        />
                        <p className="text-[12px] text-muted-foreground">
                          Force password change after period
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Security Features */}
                  <div className="space-y-4">
                    <h4 className="text-[16px] font-semibold">Security Features</h4>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            <Label htmlFor="ipWhitelist" className="text-[15px] font-semibold">
                              IP Whitelist
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Restrict access to specific IP addresses or ranges
                          </p>
                        </div>
                        <Switch
                          id="ipWhitelist"
                          checked={ipWhitelist}
                          onCheckedChange={(checked: boolean) => {
                            setIpWhitelist(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" aria-hidden="true" />
                            <Label htmlFor="auditLogging" className="text-[15px] font-semibold">
                              Audit Logging
                            </Label>
                            <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                              Compliance
                            </Badge>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Log all system activities and user actions for compliance
                          </p>
                        </div>
                        <Switch
                          id="auditLogging"
                          checked={auditLogging}
                          onCheckedChange={(checked: boolean) => {
                            setAuditLogging(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>
                  </div>

                  <Separator />

                  {/* Security Status */}
                  <Card className="border-2 bg-linear-to-br from-green-50 to-background p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                        <Shield className="h-6 w-6 text-green-600" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[16px] font-semibold">Security Status</h4>
                        <p className="mt-2 text-[13px] text-muted-foreground">
                          Your system security is strong. All recommended features are enabled.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                            SSL Enabled
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                            Encrypted Database
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                            Regular Backups
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="mt-0 space-y-8">
              <section>
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <Palette className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold leading-tight tracking-tight">
                      Appearance & Display
                    </h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Customize the look and feel of your interface
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[15px] font-semibold">Theme</Label>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        Choose your preferred color theme
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Card
                        className={`cursor-pointer border-2 p-6 transition-all duration-200 hover:shadow-md ${
                          theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => {
                          setTheme('light');
                          setHasChanges(true);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
                            <Sun className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[15px] font-semibold">Light</p>
                            <p className="text-[12px] text-muted-foreground">Classic light theme</p>
                          </div>
                          {theme === 'light' && <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />}
                        </div>
                      </Card>

                      <Card
                        className={`cursor-pointer border-2 p-6 transition-all duration-200 hover:shadow-md ${
                          theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => {
                          setTheme('dark');
                          setHasChanges(true);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-900">
                            <Moon className="h-6 w-6 text-gray-100" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[15px] font-semibold">Dark</p>
                            <p className="text-[12px] text-muted-foreground">Easy on the eyes</p>
                          </div>
                          {theme === 'dark' && <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />}
                        </div>
                      </Card>

                      <Card
                        className={`cursor-pointer border-2 p-6 transition-all duration-200 hover:shadow-md ${
                          theme === 'auto' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => {
                          setTheme('auto');
                          setHasChanges(true);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-100 to-gray-900">
                            <Laptop className="h-6 w-6 text-gray-700" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[15px] font-semibold">Auto</p>
                            <p className="text-[12px] text-muted-foreground">Match system</p>
                          </div>
                          {theme === 'auto' && <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />}
                        </div>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* Interface Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-[16px] font-semibold">Interface Preferences</h4>

                    <Card className="border-2 p-5">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Monitor className="h-5 w-5 text-blue-600" aria-hidden="true" />
                              <Label htmlFor="sidebarCollapsed" className="text-[15px] font-semibold">
                                Compact Sidebar
                              </Label>
                            </div>
                            <p className="mt-2 text-[13px] text-muted-foreground">
                              Show sidebar in collapsed mode by default for more screen space
                            </p>
                          </div>
                          <Switch
                            id="sidebarCollapsed"
                            checked={sidebarCollapsed}
                            onCheckedChange={(checked: boolean) => {
                              setSidebarCollapsed(checked);
                              setHasChanges(true);
                            }}
                          />
                        </div>
                        
                        {/* Preview */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                          <p className="mb-3 text-[12px] font-medium text-muted-foreground">Preview:</p>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <p className="mb-2 text-[11px] font-medium">Regular</p>
                              <div className="rounded border border-border bg-white p-2">
                                <div className="flex gap-1">
                                  <div className="h-12 w-16 rounded bg-primary/20"></div>
                                  <div className="flex-1 space-y-1">
                                    <div className="h-2 rounded bg-muted"></div>
                                    <div className="h-2 rounded bg-muted"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="mb-2 text-[11px] font-medium">Compact</p>
                              <div className="rounded border border-border bg-white p-2">
                                <div className="flex gap-1">
                                  <div className="h-12 w-6 rounded bg-primary/20"></div>
                                  <div className="flex-1 space-y-1">
                                    <div className="h-2 rounded bg-muted"></div>
                                    <div className="h-2 rounded bg-muted"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="border-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-orange-600" aria-hidden="true" />
                            <Label htmlFor="compactMode" className="text-[15px] font-semibold">
                              Compact Mode
                            </Label>
                          </div>
                          <p className="mt-2 text-[13px] text-muted-foreground">
                            Reduce spacing and padding for a denser information layout
                          </p>
                        </div>
                        <Switch
                          id="compactMode"
                          checked={compactMode}
                          onCheckedChange={(checked: boolean) => {
                            setCompactMode(checked);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Action Buttons */}
      <Card className="border-2 bg-muted/30 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-[13px] text-muted-foreground">
              {hasChanges ? 'You have unsaved changes' : 'All settings are saved'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={handleResetToDefaults}
              className="gap-2 transition-all duration-200 hover:bg-accent"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Reset to Defaults</span>
              <span className="sm:hidden">Reset</span>
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={handleApplyChanges}
              disabled={!hasChanges}
              className="gap-2 transition-all duration-200 hover:bg-accent"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Apply
            </Button>
            <Button
              size="default"
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className="gap-2 transition-all duration-200 hover:scale-[0.98]"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Save & Close</span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
              Reset to Default Settings?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all settings to their default values. This action cannot be undone, but you can
              reconfigure the settings afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="bg-red-600 hover:bg-red-700">
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
              Import Settings?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to import settings? This will overwrite your current configuration with the
              settings from the uploaded file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-[13px] font-semibold text-blue-900">
              What gets imported:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[12px] text-blue-800">
              <li>General settings (company info, timezone, language)</li>
              <li>Attendance policies and work hours</li>
              <li>Face recognition configuration</li>
              <li>Notification preferences</li>
              <li>Security settings</li>
              <li>Appearance preferences</li>
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Import Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
