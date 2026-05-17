import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, UserPlus, ChevronRight, Plus, Clock, QrCode, XCircle, FileText, Stethoscope } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarStrip } from '@/components/common/CalendarStrip';
import { StatCard } from '@/components/common/StatCard';
import { UserCard } from '@/components/common/UserCard';
import { AppointmentCard } from '@/components/common/AppointmentCard';
import { NotificationBell } from '@/components/common/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, appointments, updateAppointment, healthRecords } = useData();
  const { addNotification } = useNotifications();

  const doctorId = user?.id || (user as any)?._id;
  const myPatients = (patients || []).filter(p => p.assignedDoctorId === doctorId || !p.assignedDoctorId);
  const myAppointments = (appointments || []).filter(a => a.doctorId === doctorId);
  const todayAppointments = myAppointments.filter(a => 
    isSameDay(new Date(a.date), selectedDate) && a.status !== 'cancelled'
  );
  const completedAppointments = myAppointments.filter(a => a.status === 'completed');
  const upcomingAppointments = myAppointments.filter(a => a.status === 'upcoming');

  const handleCancelAppointment = (aptId: string, patientName: string) => {
    updateAppointment(aptId, { status: 'cancelled' });
    addNotification({
      title: 'Appointment Cancelled',
      message: `Dr. ${user?.fullName} cancelled appointment for ${patientName}`,
      type: 'warning',
      role: 'all',
    });
    toast.success('Appointment cancelled');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome Header */}
        <div className="dashboard-header animate-fade-in">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div>
              <p className="text-primary-foreground/80 text-[10px] uppercase tracking-wider font-bold">Doctor</p>
              <h1 className="text-xl font-bold">{user?.fullName || 'Doctor'}</h1>
              {user?.specialization && (
                <p className="text-primary-foreground/80 text-xs mt-1">{user.specialization}</p>
              )}
            </div>
            <NotificationBell />
          </div>
          <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <button onClick={() => navigate('/patients')} className="role-card w-full animate-fade-in hover:scale-[1.02] transition-transform duration-200" style={{ animationDelay: '0.4s' }}>
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><Users size={20} className="text-success" /></div>
            <span className="flex-1 text-left font-medium">All Patients</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </div>


        {/* My Patients with History & Reports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">My Patients ({myPatients.length})</h2>
            <button onClick={() => navigate('/patients')} className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          {myPatients.length === 0 ? (
            <div className="card-medical text-center py-8">
              <Users size={40} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No patients assigned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {myPatients.slice(0, 5).map((patient) => (
                <UserCard
                  key={patient.id}
                  id={patient.id}
                  name={patient.fullName}
                  subtitle={`${patient.age}y • ${patient.gender}`}
                  variant="grid"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}
