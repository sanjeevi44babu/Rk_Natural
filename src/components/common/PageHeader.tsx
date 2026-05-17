import { ArrowLeft, Bell, Menu, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  onMenuClick?: () => void;
  variant?: 'default' | 'primary';
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  showMenu = false,
  showSearch = false,
  showNotifications = true,
  onMenuClick,
  variant = 'default',
}: PageHeaderProps) {
  const navigate = useNavigate();

  const baseClass = variant === 'primary' 
    ? 'bg-primary text-primary-foreground' 
    : 'bg-background text-foreground border-b border-border';

  const iconClass = variant === 'primary' 
    ? 'text-primary-foreground hover:bg-white/10' 
    : 'text-foreground hover:bg-accent';

  return (
    <header className={`${baseClass} px-4 py-4 safe-area-top`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl ${iconClass} transition-colors`}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          {showMenu && (
            <button 
              onClick={onMenuClick}
              className={`p-2 rounded-xl ${iconClass} transition-colors`}
            >
              <Menu size={20} />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            {subtitle && (
              <p className={`text-sm ${variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <button className={`p-2 rounded-xl ${iconClass} transition-colors`}>
              <Search size={20} />
            </button>
          )}
          {showNotifications && (
            <button className={`p-2 rounded-xl ${iconClass} transition-colors relative`}>
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
