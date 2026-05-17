import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  userId?: string;
  role?: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'New Patient Admitted',
    message: 'Alexander Bennett has been admitted to Room 101, Block A.',
    type: 'info',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    role: 'all',
  },
  {
    id: 'n2',
    title: 'Appointment Scheduled',
    message: 'Therapy session scheduled for Olivia Martinez at 2:00 PM today.',
    type: 'success',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    role: 'all',
  },
  {
    id: 'n3',
    title: 'Treatment Completed',
    message: 'Emily Davidson completed therapy session for Alexander Bennett.',
    type: 'success',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    read: false,
    role: 'all',
  },
  {
    id: 'n4',
    title: 'Staff Account Created',
    message: 'New doctor account created: Dr. Michael Chen.',
    type: 'info',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    role: 'admin',
  },
  {
    id: 'n5',
    title: 'Health Check Recorded',
    message: 'New health record added for Michael Davidson.',
    type: 'info',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    read: false,
    role: 'all',
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('hms_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialNotifications;
      }
    }
    return initialNotifications;
  });

  React.useEffect(() => {
    localStorage.setItem('hms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const { user } = useAuth();

  const filteredNotifications = notifications.filter(n => {
    if (!user) return false;
    if (n.role === 'all') return true;
    if (n.role && n.role === user.role) return true;
    if (n.userId && n.userId === user.id) return true;
    return false;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications: filteredNotifications, 
      unreadCount, 
      addNotification, 
      markAsRead, 
      markAllAsRead, 
      clearAll 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
