import { Suspense, lazy, useCallback, useMemo, useState, useEffect } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = lazy(() =>
  import("@/components/Dashboard").then((module) => ({
    default: () => (
      <DashboardProvider>
        <module.Dashboard />
      </DashboardProvider>
    ),
  }))
);
const AddEmployee = lazy(() =>
  import("@/components/AddEmployee").then((module) => ({
    default: module.AddEmployee,
  }))
);
const EmployeeDetails = lazy(() =>
  import("@/components/EmployeeDetails").then((module) => ({
    default: module.EmployeeDetails,
  }))
);
const FireEmployee = lazy(() =>
  import("@/components/FireEmployee").then((module) => ({
    default: module.FireEmployee,
  }))
);
const ActiveEmployees = lazy(() =>
  import("@/components/ActiveEmployees").then((module) => ({
    default: module.ActiveEmployees,
  }))
);
const SeparatedEmployees = lazy(() =>
  import("@/components/SeparatedEmployees").then((module) => ({
    default: module.SeparatedEmployees,
  }))
);
const DailyAttendance = lazy(() =>
  import("@/components/DailyAttendance").then((module) => ({
    default: module.DailyAttendance,
  }))
);
const MonthlyRegister = lazy(() =>
  import("@/components/MonthlyRegister").then((module) => ({
    default: module.MonthlyRegister,
  }))
);
const Analytics = lazy(() =>
  import("@/components/Analytics").then((module) => ({
    default: module.Analytics,
  }))
);
const LeaveRequests = lazy(() =>
  import("@/components/LeaveRequests").then((module) => ({
    default: module.LeaveRequests,
  }))
);
const LeaveAnalytics = lazy(() =>
  import("@/components/LeaveAnalytics").then((module) => ({
    default: module.LeaveAnalytics,
  }))
);
const StreamingView = lazy(() =>
  import("@/components/StreamingView").then((module) => ({
    default: module.StreamingView,
  }))
);
const Reports = lazy(() =>
  import("@/components/Reports").then((module) => ({ default: module.Reports }))
);
const SystemSettings = lazy(() =>
  import("@/components/SystemSettings").then((module) => ({
    default: module.SystemSettings,
  }))
);
const Notifications = lazy(() =>
  import("@/components/Notifications").then((module) => ({
    default: module.Notifications,
  }))
);
const MyPortal = lazy(() =>
  import("@/components/MyPortal").then((module) => ({
    default: module.MyPortal,
  }))
);
const MyProfile = lazy(() =>
  import("@/components/MyProfile").then((module) => ({
    default: module.MyProfile,
  }))
);
const EmployeeDashboard = lazy(() =>
  import("@/components/EmployeeDashboard").then((module) => ({
    default: module.EmployeeDashboard,
  }))
);

const viewRegistry: Record<string, LazyExoticComponent<ComponentType>> = {
  dashboard: Dashboard,
  "add-employee": AddEmployee,
  "employee-details": EmployeeDetails,
  "fire-employee": FireEmployee,
  "active-employees": ActiveEmployees,
  "separated-employees": SeparatedEmployees,
  "daily-attendance": DailyAttendance,
  "monthly-register": MonthlyRegister,
  analytics: Analytics,
  "attendance-analytics": Analytics, // Map the new attendance analytics ID to the same component
  "leave-requests": LeaveRequests,
  "leave-analytics": LeaveAnalytics,
  streaming: StreamingView,
  reports: Reports,
  "system-settings": SystemSettings,
  notifications: Notifications,
  "my-portal": MyPortal,
  "my-profile": MyProfile,
  "employee-dashboard": EmployeeDashboard,
};

const LoadingView = () => (
  <div className="flex h-full w-full items-center justify-center py-20 text-muted-foreground">
    Loading module...
  </div>
);

export default function CentralHub() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect employees to their dashboard on mount or when user changes
  useEffect(() => {
    if (user?.role === "employee") {
      setActiveView("employee-dashboard");
    }
  }, [user]);

  // Prevent employees from accessing unauthorized views
  const handleSetActiveView = useCallback((view: string) => {
    // If user is an employee, only allow employee-dashboard and notifications
    if (user?.role === "employee") {
      if (view === "employee-dashboard" || view === "notifications" || view === "my-profile") {
        setActiveView(view);
      } else {
        // Redirect back to their dashboard if trying to access unauthorized view
        setActiveView("employee-dashboard");
      }
    } else {
      // Admins and managers can access any view
      setActiveView(view);
    }
  }, [user]);

  const ActiveViewComponent = useMemo(() => {
    return viewRegistry[activeView] ?? viewRegistry["dashboard"];
  }, [activeView]);

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={handleSetActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex items-center gap-4 border-b bg-card p-4 lg:hidden">
          <button
            onClick={handleOpenSidebar}
            className="rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span>In View</span>
        </div>

        {/* Content area */}
        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 pt-6 pb-6 lg:px-10 lg:pt-10 lg:pb-6">
            <Suspense fallback={<LoadingView />}>
              <ActiveViewComponent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
