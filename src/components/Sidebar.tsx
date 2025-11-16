import {
  LayoutDashboard,
  Users,
  UserX,
  UserPlus,
  FileText,
  CalendarCheck,
  BarChart3,
  FileSignature,
  PieChart,
  Video,
  FileBarChart,
  Settings,
  Bell,
  User,
  CheckCircle,
  Clock,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'PERSONAL',
    items: [
      { id: 'employee-dashboard', label: 'My Dashboard', icon: UserCheck },
      { id: 'my-portal', label: 'My Portal', icon: User },
    ],
  },
  {
    title: 'EMPLOYEE MANAGEMENT',
    items: [
      { id: 'add-employee', label: 'Add Employee', icon: UserPlus },
      { id: 'employee-details', label: 'Employee Directory', icon: FileText },
      { id: 'active-employees', label: 'Active Employees', icon: Users },
      { id: 'separated-employees', label: 'Separated Employees', icon: UserX },
    ],
  },
  {
    title: 'ATTENDANCE',
    items: [
      { id: 'daily-attendance', label: "Today's Check In", icon: CheckCircle },
      { id: 'monthly-register', label: 'Monthly Register', icon: CalendarCheck },
      { id: 'attendance-analytics', label: 'Analytics', icon: Clock },
    ],
  },
  {
    title: 'LEAVE MANAGEMENT',
    items: [
      { id: 'leave-requests', label: 'Leave Requests', icon: FileSignature, badge: 3 },
      { id: 'leave-analytics', label: 'Leave History', icon: PieChart },
    ],
  },
  {
    title: 'STREAMING',
    items: [
      { id: 'streaming', label: 'Camera Streams', icon: Video },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { id: 'reports', label: 'Reports', icon: FileBarChart },
      { id: 'system-settings', label: 'System Settings', icon: Settings },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

export const Sidebar = memo(({ activeView, setActiveView, sidebarOpen, setSidebarOpen }: SidebarProps) => {
 
  const { unreadNotifCount, user } = useAuth();

  const handleNavClick = useCallback((view: string) => {
    setActiveView(view);
    setSidebarOpen(false);
  }, [setActiveView, setSidebarOpen]);
  
  const menuSections = useMemo(() => {
    // Filter menu sections based on user role
    let filteredSections = MENU_SECTIONS;

    // For employees, show only Personal and Notifications
    if (user?.role === 'employee') {
      filteredSections = MENU_SECTIONS.filter(section => 
        section.title === 'PERSONAL' || section.title === 'SETTINGS'
      ).map(section => {
        if (section.title === 'PERSONAL') {
          // For employees, remove "My Portal" from Personal section
          return {
            ...section,
            items: section.items.filter(item => item.id === 'employee-dashboard')
          };
        }
        if (section.title === 'SETTINGS') {
          // For employees, show only notifications
          return {
            ...section,
            items: section.items.filter(item => item.id === 'notifications')
          };
        }
        return section;
      });
    }
    // For managers, remove "Add Employee" option
    else if (user?.role === 'manager') {
      filteredSections = MENU_SECTIONS.map(section => {
        if (section.title === 'EMPLOYEE MANAGEMENT') {
          return {
            ...section,
            items: section.items.filter(item => item.id !== 'add-employee')
          };
        }
        return section;
      });
    }
    // For admin, show everything (no filtering needed)
    
    return filteredSections.map(section => ({
      ...section,
      items: section.items.map(item => {
        if (section.title === 'SETTINGS' && item.id === 'notifications') {
          return {
            ...item,
            badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
          };
        }
        return item;
      }),
    }));
  }, [unreadNotifCount, user]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="space-y-2 border-b border-border p-6">
        <h1 className="text-[24px] leading-none tracking-tight">In View</h1>
        <p className="text-[14px] text-muted-foreground">Face Attendance System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {menuSections.map((section :any) => (
          <div key={section.title}>
            {/* Add separator before EMPLOYEE MANAGEMENT and ATTENDANCE sections */}
            {(section.title === 'EMPLOYEE MANAGEMENT' || section.title === 'ATTENDANCE') && (
              <Separator className="mb-6" />
            )}
            
            <div className="space-y-3">
              <h3 className="px-3 text-[11px] tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item:any, index: number) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={`${section.title}-${item.id}-${index}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[14px] transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          className="h-5 min-w-5 rounded-full bg-red-600 px-1.5 text-[11px] text-white hover:bg-red-600"
                          variant="secondary"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <button
          onClick={() => handleNavClick('my-profile')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
            activeView === 'my-profile'
              ? 'bg-primary/10 shadow-sm'
              : 'hover:bg-accent hover:shadow-sm'
          }`}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            activeView === 'my-profile'
              ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
              : 'bg-primary text-primary-foreground'
          }`}>
            <User className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium">Admin User</p>
            <p className="text-[12px] text-muted-foreground">admin@inview.com</p>
          </div>
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
