import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, Calendar, Settings, LogOut, Menu, X,
  User, ClipboardList, UserCog, Activity, QrCode, LayoutDashboard, Building2, Sun, Moon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/common/Logo';
import { Avatar } from '@/components/common/Avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { BottomNav } from '@/components/common/BottomNav';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { icon: UserCog, label: 'Doctors', path: '/doctors' },
          { icon: Users, label: 'Supervisors', path: '/supervisors' },
          { icon: Activity, label: 'Physiotherapists', path: '/physiotherapists' },
          { icon: Users, label: 'Frontdesk', path: '/frontdesk-users' },
          { icon: Users, label: 'Patients', path: '/patients' },
          { icon: LayoutDashboard, label: 'Management', path: '/management' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'supervisor':
        return [
          ...baseItems,
          { icon: Users, label: 'Patients', path: '/patients' },
          { icon: QrCode, label: 'Scan', path: '/scan-patient' },
          { icon: User, label: 'Profile', path: '/profile' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'doctor':
        return [
          ...baseItems,
          { icon: Users, label: 'Patients', path: '/patients' },
          { icon: QrCode, label: 'Scan', path: '/scan-patient' },
          { icon: User, label: 'Profile', path: '/profile' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'frontdesk':
        return [
          ...baseItems,
          { icon: Users, label: 'Patients', path: '/patients' },
          { icon: QrCode, label: 'Scan', path: '/scan-patient' },
          { icon: ClipboardList, label: 'New Patient', path: '/patients/new' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'physiotherapist':
        return [
          ...baseItems,
          { icon: Users, label: 'Patients', path: '/patients' },
          { icon: QrCode, label: 'Scan', path: '/scan-patient' },
          { icon: User, label: 'Profile', path: '/profile' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'patient':
        return [
          ...baseItems,
          { icon: Calendar, label: 'Appointments', path: '/appointments' },
          { icon: User, label: 'Profile', path: '/profile' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <Logo size="sm" />
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    isActive ? 'nav-item-active w-full' : 'nav-item w-full',
                    item.label === 'Scan' && !isActive && 'bg-primary/5 border border-primary/20 text-primary font-bold shadow-sm'
                  )}
                >
                  <Icon size={20} className={item.label === 'Scan' ? 'text-primary' : ''} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Theme Mode Section */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Sun size={16} className="text-primary dark:hidden" />
              <Moon size={16} className="text-primary hidden dark:block" />
              <span className="text-sm font-semibold">Mode</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all ${theme === 'light'
                  ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                  : 'bg-card border-card-border text-muted-foreground hover:border-primary/50'
                  }`}
              >
                <Sun size={14} />
                <span className="text-xs font-bold">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all ${theme === 'dark'
                  ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                  : 'bg-card border-card-border text-muted-foreground hover:border-primary/50'
                  }`}
              >
                <Moon size={14} />
                <span className="text-xs font-bold">Dark</span>
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={user?.fullName || 'User'} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="nav-item w-full text-destructive hover:bg-destructive/10"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 lg:hidden text-sidebar-foreground ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Logo size="sm" showText={false} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl hover:bg-accent"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 pb-32 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    isActive ? 'nav-item-active w-full' : 'nav-item w-full',
                    item.label === 'Scan' && !isActive && 'bg-primary/5 border border-primary/20 text-primary font-bold'
                  )}
                >
                  <Icon size={20} className={item.label === 'Scan' ? 'text-primary' : ''} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Integrated Logout Item for Mobile */}
            <button
              onClick={handleLogout}
              className="nav-item w-full text-destructive hover:bg-destructive/10 mt-6"
            >
              <LogOut size={20} />
              <span className="font-bold">Logout</span>
            </button>

            {/* Theme Mode Section (Mobile Integrated) */}
            <div className="mt-8 pt-6 border-t border-sidebar-border">
              <div className="flex items-center gap-2 mb-4 px-2">
                <Sun size={16} className="text-primary dark:hidden" />
                <Moon size={16} className="text-primary hidden dark:block" />
                <span className="text-sm font-bold uppercase tracking-wider opacity-60">Display Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${theme === 'light'
                    ? 'bg-primary border-primary text-primary-foreground shadow-md'
                    : 'bg-card border-card-border text-muted-foreground hover:border-primary/30'
                    }`}
                >
                  <Sun size={14} />
                  <span className="text-xs font-bold">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${theme === 'dark'
                    ? 'bg-primary border-primary text-primary-foreground shadow-md'
                    : 'bg-card border-card-border text-muted-foreground hover:border-primary/30'
                    }`}
                >
                  <Moon size={14} />
                  <span className="text-xs font-bold">Dark</span>
                </button>
              </div>
            </div>
          </nav>

        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-background border-b border-border z-30 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-accent"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-lg text-primary">MEDDICAL</span>
          <Avatar name={user?.fullName || 'User'} size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-[18rem] pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
