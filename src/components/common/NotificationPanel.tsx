import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <NotificationDropdown onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-success" />;
      case 'warning': return <AlertTriangle size={16} className="text-warning" />;
      case 'error': return <AlertCircle size={16} className="text-destructive" />;
      default: return <Info size={16} className="text-secondary" />;
    }
  };

  return (
    <div className="fixed md:absolute inset-0 md:inset-auto md:top-full md:right-0 md:mt-4 w-full md:w-96 h-full md:h-auto max-h-screen md:max-h-[600px] bg-card md:border md:border-border md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100] overflow-hidden animate-slide-up md:animate-scale-in flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-5 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors md:hidden flex items-center justify-center text-primary"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h3 className="font-bold text-xl md:text-lg text-foreground tracking-tight">Notifications</h3>
            <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider opacity-80">
              {unreadCount} UNREAD
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-bold text-primary hover:bg-primary/10 rounded-full" onClick={markAllAsRead}>
              <CheckCheck size={14} className="mr-1.5" />
              Read All
            </Button>
          )}
          <button onClick={onClose} className="hidden md:flex p-2 rounded-full hover:bg-accent transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="opacity-40" />
            </div>
            <p className="font-medium">All caught up!</p>
            <p className="text-xs opacity-60">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  markAsRead(notification.id);
                }}
                className={`flex gap-4 p-5 md:p-4 cursor-pointer transition-colors active:bg-accent/50 md:hover:bg-accent/50 ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  notification.type === 'success' ? 'bg-success/10' :
                  notification.type === 'warning' ? 'bg-warning/10' :
                  notification.type === 'error' ? 'bg-destructive/10' :
                  'bg-secondary/10'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 md:p-3 border-t border-border bg-accent/20">
          <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-destructive hover:bg-destructive/10" onClick={clearAll}>
            <Trash2 size={14} className="mr-1" />
            Clear All Notifications
          </Button>
        </div>
      )}
    </div>
  );
}
