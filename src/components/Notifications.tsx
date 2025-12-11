import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import {
  Bell,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Check,
  Clock,
  Info,
  AlertTriangle,
  UserCheck,
  Camera,
  MoreVertical,
  UserPlus,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { employeeService, type NotificationItem as ApiNotification } from '@/services/employee';

// API notification type is imported from services

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info' | 'request';
  icon: typeof CheckCircle;
  title: string;
  message: string;
  time: string;
  timestamp: Date;
  isRead: boolean;
}

export function Notifications() {
  const { markNotificationsAsRead } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'warning' | 'info' | 'request'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to map API notification type to UI type
  const mapNotificationType = (apiType: string): 'success' | 'warning' | 'info' | 'request' => {
    switch (apiType.toLowerCase()) {
      case 'success':
      case 'employee_added':
      case 'attendance_milestone':
        return 'success';
      case 'warning':
      case 'late_arrival':
      case 'device_offline':
        return 'warning';
      case 'leave_request':
        return 'request';
      default:
        return 'info';
    }
  };

  // Function to get icon based on type
  const getTypeIcon = (type: 'success' | 'warning' | 'info' | 'request') => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'request':
        return Calendar;
      default:
        return Info;
    }
  };

  // Convert API notification to UI notification
  const mapApiToUiNotification = (apiNotif: ApiNotification): Notification => {
    const type = mapNotificationType(apiNotif.type);
    return {
      id: apiNotif.id,
      type,
      icon: getTypeIcon(type),
      title: apiNotif.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      message: apiNotif.message,
      time: formatTimeAgo(new Date(apiNotif.created_at)),
      timestamp: new Date(apiNotif.created_at),
      isRead: apiNotif.is_read,
    };
  };

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getNotifications({ unreadOnly: false });
      const uiNotifications = response.notifications.map(mapApiToUiNotification);
      setNotifications(uiNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
      // Keep existing hardcoded notifications as fallback
      setNotifications(getDefaultNotifications());
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on component mount and mark as read
  useEffect(() => {
    fetchNotifications();
    
    // Mark notifications as read when user opens this page
    markNotificationsAsRead();
  }, [markNotificationsAsRead]);

  // Fallback default notifications
  const getDefaultNotifications = (): Notification[] => [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle,
      title: 'New Employee Added',
      message: 'John Smith has been successfully registered in the system',
      time: '2 hours ago',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
    },
    {
      id: 2,
      type: 'warning',
      icon: AlertCircle,
      title: 'Late Arrival Alert',
      message: '5 employees arrived late today',
      time: '3 hours ago',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: false,
    },
    {
      id: 3,
      type: 'request',
      icon: Calendar,
      title: 'Leave Request',
      message: 'Sarah Johnson requested leave for Nov 5-10, 2025',
      time: '5 hours ago',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 4,
      type: 'info',
      icon: UserPlus,
      title: 'Face Recognition Updated',
      message: 'Face data updated for 3 employees',
      time: '1 day ago',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 5,
      type: 'warning',
      icon: Camera,
      title: 'Device Offline',
      message: 'Floor 1 Camera (DEV-003) is offline',
      time: '1 day ago',
      timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
      isRead: false,
    },
    {
      id: 6,
      type: 'request',
      icon: Calendar,
      title: 'Leave Request',
      message: 'Mike Davis requested leave for Nov 12-15, 2025',
      time: '2 days ago',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 7,
      type: 'info',
      icon: UserCheck,
      title: 'Attendance Milestone',
      message: 'Emma Wilson achieved 100% attendance this month',
      time: '1 week ago',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
  ];

  // Group notifications by time period
  const groupNotificationsByTime = (notifs: Notification[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [] as Notification[],
      yesterday: [] as Notification[],
      thisWeek: [] as Notification[],
      older: [] as Notification[],
    };

    notifs.forEach((notif) => {
      if (notif.timestamp >= today) {
        groups.today.push(notif);
      } else if (notif.timestamp >= yesterday) {
        groups.yesterday.push(notif);
      } else if (notif.timestamp >= lastWeek) {
        groups.thisWeek.push(notif);
      } else {
        groups.older.push(notif);
      }
    });

    return groups;
  };

  const filteredNotifications =
    filterType === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const groupedNotifications = groupNotificationsByTime(filteredNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    toast.success('Marked as read');
  };

  const handleMarkAsUnread = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: false } : n))
    );
    toast.success('Marked as unread');
  };

  const handleDismiss = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success('Notification dismissed');
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    try {
      await employeeService.markNotificationsRead();
      // also update global badge via context helper
      await markNotificationsAsRead();
    } catch {
      // ignore, we already updated UI optimistically
    }
    toast.success('All notifications marked as read');
  };

  const getNotificationStyle = (type: string) => {
    const styles = {
      success: {
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        badgeColor: 'bg-green-100 text-green-700',
        borderColor: 'border-green-200',
      },
      warning: {
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        badgeColor: 'bg-orange-100 text-orange-700',
        borderColor: 'border-orange-200',
      },
      info: {
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        badgeColor: 'bg-blue-100 text-blue-700',
        borderColor: 'border-blue-200',
      },
      request: {
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
        badgeColor: 'bg-purple-100 text-purple-700',
        borderColor: 'border-purple-200',
      },
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  const renderNotificationGroup = (
    title: string,
    notifs: Notification[]
  ) => {
    if (notifs.length === 0) return null;

    return (
      <div className="space-y-3" key={title}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </h3>
          <div className="h-px flex-1 bg-border"></div>
        </div>
        <div className="space-y-3">
          {notifs.map((notification) => {
            const Icon = notification.icon;
            const style = getNotificationStyle(notification.type);

            return (
              <Card
                key={notification.id}
                className={`border transition-all duration-200 hover:shadow-md ${
                  notification.isRead
                    ? 'bg-card border-border'
                    : 'bg-blue-50/30 border-blue-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${style.iconColor}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm sm:text-base font-semibold leading-tight">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-600 text-white text-[10px] px-1.5 py-0"
                              >
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 wrap-break-words">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            <span>{notification.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 shrink-0"
                                aria-label="More actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {notification.isRead ? (
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsUnread(notification.id)}
                                  className="gap-2"
                                >
                                  <Bell className="h-4 w-4" />
                                  <span>Mark as Unread</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Mark as Read</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDismiss(notification.id)}
                                className="gap-2 text-red-600"
                              >
                                <X className="h-4 w-4" />
                                <span>Dismiss</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1>Notifications</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Stay updated with system alerts and activities
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="gap-1.5">
              <Bell className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{unreadCount} Unread</span>
            </Badge>
          )}
          <Button
            variant="outline"
            size="default"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        </div>
      </header>

      {/* Filter Chips */}
      <section aria-label="Notification filters">
        <Card className="border-2 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Filter by Type</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="transition-all duration-200"
            >
              All
              <Badge
                variant="secondary"
                className="ml-2 bg-white/20 text-white text-xs"
              >
                {notifications.length}
              </Badge>
            </Button>
            <Button
              variant={filterType === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('warning')}
              className="transition-all duration-200"
            >
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Warnings
              <Badge
                variant="secondary"
                className={`ml-2 text-xs ${
                  filterType === 'warning'
                    ? 'bg-white/20 text-white'
                    : 'bg-orange-50 text-orange-700'
                }`}
              >
                {notifications.filter((n) => n.type === 'warning').length}
              </Badge>
            </Button>
            <Button
              variant={filterType === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('info')}
              className="transition-all duration-200"
            >
              <Info className="mr-1.5 h-3.5 w-3.5" />
              Info
              <Badge
                variant="secondary"
                className={`ml-2 text-xs ${
                  filterType === 'info'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {notifications.filter((n) => n.type === 'info').length}
              </Badge>
            </Button>
            <Button
              variant={filterType === 'request' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('request')}
              className="transition-all duration-200"
            >
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Requests
              <Badge
                variant="secondary"
                className={`ml-2 text-xs ${
                  filterType === 'request'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-50 text-purple-700'
                }`}
              >
                {notifications.filter((n) => n.type === 'request').length}
              </Badge>
            </Button>
          </div>
        </Card>
      </section>

      {/* Grouped Notifications */}
      <section aria-label="Notification list" className="space-y-6">
        {loading ? (
          <Card className="border-2 p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          </Card>
        ) : (
          <>
            {renderNotificationGroup('Today', groupedNotifications.today)}
            {renderNotificationGroup('Yesterday', groupedNotifications.yesterday)}
            {renderNotificationGroup('This Week', groupedNotifications.thisWeek)}
            {renderNotificationGroup('Older', groupedNotifications.older)}

            {filteredNotifications.length === 0 && (
              <Card className="border-2 p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    No notifications
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    You're all caught up! No {filterType !== 'all' && filterType}{' '}
                    notifications at the moment.
                  </p>
                </div>
              </Card>
            )}
          </>
        )}
      </section>
    </main>
  );
}
