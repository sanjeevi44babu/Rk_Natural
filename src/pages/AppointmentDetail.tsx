import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, MapPin, FileText, CheckCircle, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, updateAppointment, patients } = useData();
  const { user } = useAuth();
  
  const appointment = appointments.find(a => a.id === id);
  const patient = appointment ? patients.find(p => p.id === appointment.patientId) : null;

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Appointment not found</div>
      </DashboardLayout>
    );
  }

  const handleComplete = () => {
    updateAppointment(id!, { status: 'completed' });
    toast.success('Appointment marked as completed!');
  };

  const handleCancel = () => {
    updateAppointment(id!, { status: 'cancelled' });
    toast.success('Appointment cancelled');
  };

  const handleStartSession = () => {
    updateAppointment(id!, { status: 'in-progress' });
    toast.success('Session started!');
    if (patient) {
      navigate(`/patients/${patient.id}/health-check`);
    }
  };

  const statusColors = {
    'upcoming': 'badge-primary',
    'in-progress': 'badge-warning',
    'completed': 'badge-success',
    'cancelled': 'bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-full text-sm font-medium',
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Appointment Header */}
        <div className="card-medical mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar name={appointment.patientName} size="xl" />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{appointment.patientName}</h1>
              {appointment.patientAge && (
                <p className="text-muted-foreground">
                  {appointment.patientAge} years • {appointment.patientGender}
                </p>
              )}
              <span className={`${statusColors[appointment.status]} inline-block mt-2`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="card-medical mb-6">
          <h3 className="font-semibold mb-4">Appointment Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(appointment.date).toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{appointment.time} ({appointment.duration} mins)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{appointment.type}</p>
              </div>
            </div>

            {appointment.roomNumber && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">Room {appointment.roomNumber}</p>
                </div>
              </div>
            )}

            {appointment.doctorName && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <User size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{appointment.doctorName}</p>
                </div>
              </div>
            )}

            {appointment.physiotherapistName && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <User size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Physiotherapist</p>
                  <p className="font-medium">{appointment.physiotherapistName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="card-medical mb-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-muted-foreground">{appointment.notes}</p>
          </div>
        )}

        {/* Actions */}
        {appointment.status === 'upcoming' && (
          <div className="space-y-3">
            {(user?.role === 'doctor' || user?.role === 'physiotherapist') && (
              <Button onClick={handleStartSession} className="w-full btn-primary">
                Start Session
              </Button>
            )}
            <div className="flex gap-3">
              <Button onClick={handleComplete} className="flex-1 bg-success hover:bg-success/90">
                <CheckCircle size={18} className="mr-2" />
                Complete
              </Button>
              <Button onClick={handleCancel} variant="destructive" className="flex-1">
                <XCircle size={18} className="mr-2" />
                Cancel
              </Button>
            </div>
            {patient && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                View Patient Details
              </Button>
            )}
          </div>
        )}

        {appointment.status === 'in-progress' && (
          <div className="space-y-3">
            <Button onClick={handleComplete} className="w-full bg-success hover:bg-success/90">
              <CheckCircle size={18} className="mr-2" />
              Complete Session
            </Button>
            {patient && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/patients/${patient.id}/health-check`)}
              >
                Add Health Check
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
