import { Clock, Calendar, ChevronRight } from 'lucide-react';
import { Avatar } from './Avatar';
import { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const statusColors = {
    upcoming: 'badge-primary',
    completed: 'badge-success',
    cancelled: 'bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-full text-sm font-medium',
  };

  return (
    <div 
      className="card-medical flex items-center gap-4 animate-fade-in cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <Avatar name={appointment.patientName} size="lg" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{appointment.patientName}</h3>
        
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(appointment.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {appointment.time}
          </span>
        </div>
        
        <span className={`${statusColors[appointment.status]} inline-block mt-2`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      <button className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200">
        Details
      </button>
    </div>
  );
}
