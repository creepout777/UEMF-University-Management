import { Link, useLocation, useRouter } from "wouter";
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Building2,
  ClipboardList, Star, Calendar, FileText, DollarSign, Bell,
  Menu, ChevronRight, LogOut, Home,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, allowedRoles: ["admin", "administration"] },
  { href: "/", label: "Home", icon: Home, allowedRoles: ["teacher", "student"] },
  { href: "/students", label: "Students", icon: Users, allowedRoles: ["admin", "administration", "teacher"] },
  { href: "/courses", label: "Courses", icon: BookOpen, allowedRoles: ["admin", "administration", "teacher", "student"] },
  { href: "/faculty", label: "Faculty", icon: GraduationCap, allowedRoles: ["admin", "administration", "teacher"] },
  { href: "/departments", label: "Departments", icon: Building2, allowedRoles: ["admin", "administration", "teacher"] },
  { href: "/enrollments", label: "Enrollments", icon: ClipboardList, allowedRoles: ["admin", "administration", "teacher", "student"] },
  { href: "/grades", label: "Grades", icon: Star, allowedRoles: ["admin", "administration", "teacher", "student"] },
  { href: "/schedules", label: "Schedules", icon: Calendar, allowedRoles: ["admin", "administration", "teacher", "student"] },
  { href: "/exams", label: "Exams", icon: FileText, allowedRoles: ["admin", "administration", "teacher", "student"] },
  { href: "/fees", label: "Fees", icon: DollarSign, allowedRoles: ["admin", "administration", "student"] },
  { href: "/announcements", label: "Announcements", icon: Bell, allowedRoles: ["admin", "administration", "teacher", "student"] },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  administration: "Administration",
  teacher: "Teacher",
  student: "Student",
};

const roleBadgeColors: Record<UserRole, string> = {
  admin: "#dc2626",
  administration: "#d97706",
  teacher: "#2563eb",
  student: "#16a34a",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const visibleNav = navItems.filter((item) =>
    user ? item.allowedRoles.includes(user.role) : false
  );

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
               style={{ background: "linear-gradient(135deg, hsl(146 50% 42%), hsl(146 50% 32%))" }}>
            UE
          </div>
          <div>
            <div className="text-sidebar-foreground font-bold text-sm leading-tight">UEMF</div>
            <div className="text-sidebar-foreground/50 text-xs leading-tight">University Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {visibleNav.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                 style={{ backgroundColor: roleBadgeColors[user.role] }}>
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sidebar-foreground text-xs font-medium truncate">{user.username}</div>
              <div className="flex items-center gap-1">
                <span className="text-xs px-1.5 py-0 rounded-full text-white leading-5"
                      style={{ backgroundColor: roleBadgeColors[user.role], fontSize: "10px" }}>
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0"
             style={{ backgroundColor: "hsl(var(--sidebar))" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
                 style={{ backgroundColor: "hsl(var(--sidebar))" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                 style={{ background: "linear-gradient(135deg, hsl(146 50% 42%), hsl(146 50% 32%))" }}>
              UE
            </div>
            <span className="font-semibold text-sm">UEMF</span>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
