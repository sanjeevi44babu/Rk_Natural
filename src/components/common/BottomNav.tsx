import { Home, Calendar, Users, Settings, User, ClipboardList, Clock, QrCode, UserCog, LayoutDashboard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: 'Home', path: '/dashboard' },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { icon: UserCog, label: 'Doctors', path: '/doctors' },
          { icon: Users, label: 'Patients', path: '/patients' },
          { icon: LayoutDashboard, label: 'Admin', path: '/management' },
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
      case 'physiotherapist':
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
          { icon: ClipboardList, label: 'New', path: '/patients/new' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'patient':
        return [
          ...baseItems,
          { icon: Calendar, label: 'Calendar', path: '/appointments' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems().slice(0, 5); // Max 5 items for mobile

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 safe-area-bottom z-[100] h-16 sm:h-20 lg:hidden">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 relative group ${item.label === 'Scan' ? 'z-10' : ''}`}
            >
              <div className={`relative transition-all duration-300 ${
                item.label === 'Scan' 
                  ? 'bg-primary text-primary-foreground p-2.5 rounded-2xl shadow-lg -mt-6 border-4 border-background scale-105' 
                  : isActive 
                    ? 'bg-primary/20 text-primary px-5 py-1 rounded-full' 
                    : 'text-muted-foreground group-hover:text-foreground px-5 py-1'
              }`}>
                <Icon size={item.label === 'Scan' ? 24 : 22} className={isActive && item.label !== 'Scan' ? 'scale-110 active:scale-95 transition-transform' : ''} />
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold transition-colors duration-300 ${
                item.label === 'Scan' ? 'mt-1' : ''
              } ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
