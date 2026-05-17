import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Lock, Edit, Info, Phone, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: Edit, label: 'Edit Profile', path: '/profile/edit' },
        { icon: Lock, label: 'Change Password', path: '/change-password' },
        { icon: Bell, label: 'Notifications', path: '/settings/notifications' },
        { icon: Shield, label: 'Privacy & Security', path: '/settings/privacy' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', path: '/help' },
        { icon: Phone, label: 'Contact Us', path: '/contact' },
      ],
    },
    {
      title: 'Info',
      items: [
        { icon: Info, label: 'About', path: '/about' },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div 
          className="card-medical flex items-center gap-4 cursor-pointer hover:border-primary/50"
          onClick={() => navigate('/profile')}
        >
          <Avatar name={user?.fullName || 'User'} size="lg" />
          <div className="flex-1">
            <h2 className="font-semibold">{user?.fullName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="badge-primary inline-block mt-1 capitalize">{user?.role}</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.title}</h3>
            <div className="card-medical divide-y divide-border">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:bg-accent/50 transition-colors -mx-4 px-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full card-medical flex items-center gap-4 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut size={20} className="text-destructive" />
          </div>
          <span className="flex-1 text-left font-medium">Log Out</span>
        </button>
      </div>
    </DashboardLayout>
  );
}
