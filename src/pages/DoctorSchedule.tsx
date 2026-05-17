import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Trash2, Save, Calendar, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarStrip } from '@/components/common/CalendarStrip';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';

const defaultTimeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];

export default function DoctorSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>(defaultTimeSlots.slice(0, 12));
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get booked slots for selected date
  const bookedSlots = appointments
    .filter(apt => 
      isSameDay(new Date(apt.date), selectedDate) && 
      apt.doctorId === user?.id &&
      apt.status !== 'cancelled'
    )
    .map(apt => apt.time);

  const toggleSlot = (slot: string) => {
    if (!isEditing) return;
    
    // Can't toggle booked slots
    if (bookedSlots.includes(slot)) {
      toast.error('This slot is already booked');
      return;
    }
    
    setAvailableSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot].sort((a, b) => {
            const timeA = new Date(`2000/01/01 ${a}`);
            const timeB = new Date(`2000/01/01 ${b}`);
            return timeA.getTime() - timeB.getTime();
          })
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Schedule updated successfully!');
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setAvailableSlots(defaultTimeSlots.slice(0, 12)); // Reset to default
    setIsEditing(false);
    toast.info('Changes cancelled');
  };

  const handleAddAllSlots = () => {
    setAvailableSlots(defaultTimeSlots.filter(slot => !bookedSlots.includes(slot)));
  };

  const handleClearSlots = () => {
    setAvailableSlots(bookedSlots); // Keep only booked slots
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 animate-fade-in"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Schedule</h1>
              <p className="text-muted-foreground text-sm">Manage your availability</p>
            </div>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="btn-primary hover:scale-105 transition-transform duration-200"
            >
              Edit Schedule
            </Button>
          ) : (
            <div className="flex gap-2 animate-scale-in">
              <Button 
                onClick={handleCancel} 
                variant="outline"
                className="hover:scale-105 transition-transform duration-200"
              >
                <X size={18} className="mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="btn-primary hover:scale-105 transition-transform duration-200"
                disabled={isLoading}
              >
                <Save size={18} className="mr-2" />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <CalendarStrip 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
        </div>

        {/* Date Info */}
        <div className="card-medical animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
              <p className="text-sm text-muted-foreground">
                {availableSlots.length} available slots • {bookedSlots.length} booked
              </p>
            </div>
            {isEditing && (
              <div className="flex gap-2 animate-scale-in">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddAllSlots}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <Plus size={14} className="mr-1" />
                  Add All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearSlots}
                  className="text-destructive hover:text-destructive hover:scale-105 transition-transform duration-200"
                >
                  <Trash2 size={14} className="mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary animate-pulse" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-secondary" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border border-border" />
              <span>Unavailable</span>
            </div>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {defaultTimeSlots.map((slot, index) => {
              const isBooked = bookedSlots.includes(slot);
              const isAvailable = availableSlots.includes(slot);
              
              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  disabled={!isEditing && !isBooked}
                  className={`
                    flex items-center justify-center gap-1 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 animate-fade-in
                    ${isBooked 
                      ? 'bg-secondary text-secondary-foreground cursor-not-allowed' 
                      : isAvailable 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg' 
                        : 'bg-muted text-muted-foreground border border-border hover:border-primary/50'
                    }
                    ${isEditing && !isBooked ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
                  `}
                  style={{ animationDelay: `${0.02 * index}s` }}
                >
                  <Clock size={14} />
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="card-medical animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <h3 className="font-semibold mb-4">Booked Appointments</h3>
          {bookedSlots.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 animate-fade-in">
              No appointments booked for this day
            </p>
          ) : (
            <div className="space-y-3">
              {appointments
                .filter(apt => 
                  isSameDay(new Date(apt.date), selectedDate) && 
                  apt.doctorId === user?.id &&
                  apt.status !== 'cancelled'
                )
                .map((apt, index) => (
                  <div 
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-accent rounded-xl cursor-pointer hover:bg-accent/80 hover:scale-[1.02] transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${0.05 * index}s` }}
                    onClick={() => navigate(`/appointments/${apt.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <Clock size={18} className="text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.patientName}</p>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{apt.time}</p>
                      <p className="text-sm text-muted-foreground">{apt.duration} min</p>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-stat animate-fade-in hover:scale-105 transition-transform duration-200" style={{ animationDelay: '0.3s' }}>
            <span className="text-2xl font-bold text-primary">{availableSlots.length}</span>
            <span className="text-xs text-muted-foreground text-center">Available Today</span>
          </div>
          <div className="card-stat animate-fade-in hover:scale-105 transition-transform duration-200" style={{ animationDelay: '0.35s' }}>
            <span className="text-2xl font-bold text-secondary">{bookedSlots.length}</span>
            <span className="text-xs text-muted-foreground text-center">Booked Today</span>
          </div>
          <div className="card-stat animate-fade-in hover:scale-105 transition-transform duration-200" style={{ animationDelay: '0.4s' }}>
            <span className="text-2xl font-bold text-success">
              {appointments.filter(apt => apt.doctorId === user?.id && apt.status === 'completed').length}
            </span>
            <span className="text-xs text-muted-foreground text-center">Completed</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
