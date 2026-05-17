import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, FileText, QrCode, User, Clock, 
  Activity, ChevronRight, Heart, Stethoscope
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarStrip } from '@/components/common/CalendarStrip';
import { StatCard } from '@/components/common/StatCard';
import { NotificationBell } from '@/components/common/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';

export default function PatientDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, appointments, healthRecords } = useData();

  // Match patient by ID first, then by email, then by name
  const myPatient = patients.find(p => p.id === user?.id) 
    || patients.find(p => p.email === user?.email)
    || patients.find(p => p.fullName === user?.fullName);
    
  const myAppointments = myPatient 
    ? appointments.filter(a => a.patientId === myPatient.id)
    : [];
  const myHealthRecords = myPatient
    ? healthRecords.filter(r => r.patientId === myPatient.id)
    : [];
  const upcomingAppointments = myAppointments.filter(a => a.status === 'upcoming');
  const completedAppointments = myAppointments.filter(a => a.status === 'completed');

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome Header */}
        <div className="dashboard-header animate-fade-in">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div>
              <p className="text-primary-foreground/80 text-[10px] md:text-sm uppercase tracking-wider font-bold">Welcome,</p>
              <h1 className="text-xl md:text-2xl font-bold">{user?.fullName || 'Patient'}</h1>
              <div className="flex items-center gap-2 mt-1 md:mt-2">
                <Heart size={14} className="md:w-[16px] md:h-[16px]" />
                <span className="text-[10px] md:text-sm">Your Health Dashboard</span>
              </div>
            </div>
            <NotificationBell />
          </div>
          <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Patient ID Card */}
        {myPatient && (
          <div className="card-medical bg-gradient-to-r from-primary/5 to-secondary/5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Patient ID</p>
                <p className="font-bold text-lg text-primary">{(myPatient.id || (myPatient as any)._id || "N/A").toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">
                  {myPatient.age} yrs • {myPatient.gender} • {myPatient.bloodType || 'N/A'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/patients/${myPatient.id}/qr-tag`)}
                className="gap-1"
              >
                <QrCode size={16} />
                QR Tag
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <StatCard icon={Calendar} value={upcomingAppointments.length} label="Upcoming" variant="primary" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <StatCard icon={Clock} value={completedAppointments.length} label="Completed" variant="secondary" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <StatCard icon={FileText} value={myHealthRecords.length} label="Records" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <StatCard icon={Activity} value={myPatient?.status === 'admitted' ? 1 : 0} label="Admitted" />
          </div>
        </div>

        {/* My Health Info */}
        {myPatient && (
          <div className="card-medical animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Stethoscope size={18} className="text-primary" />
              My Health Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {myPatient.bloodPressure && (
                <div className="p-3 bg-accent rounded-xl">
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                  <p className="font-semibold">{myPatient.bloodPressure}</p>
                </div>
              )}
              {myPatient.temperature && (
                <div className="p-3 bg-accent rounded-xl">
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className="font-semibold">{myPatient.temperature}°F</p>
                </div>
              )}
              {myPatient.weight && (
                <div className="p-3 bg-accent rounded-xl">
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-semibold">{myPatient.weight} kg</p>
                </div>
              )}
              {myPatient.height && (
                <div className="p-3 bg-accent rounded-xl">
                  <p className="text-xs text-muted-foreground">Height</p>
                  <p className="font-semibold">{myPatient.height} cm</p>
                </div>
              )}
              {myPatient.bloodType && (
                <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="font-semibold text-destructive">{myPatient.bloodType}</p>
                </div>
              )}
              {myPatient.weight && myPatient.height && (
                <div className="p-3 bg-accent rounded-xl">
                  <p className="text-xs text-muted-foreground">BMI</p>
                  <p className="font-semibold">{(myPatient.weight / ((myPatient.height/100) ** 2)).toFixed(1)}</p>
                </div>
              )}
              {myPatient.diagnosis && (
                <div className="p-3 bg-accent rounded-xl col-span-2">
                  <p className="text-xs text-muted-foreground">Diagnosis</p>
                  <p className="font-semibold">{myPatient.diagnosis}</p>
                </div>
              )}
              {myPatient.roomNumber && (
                <div className="p-3 bg-accent rounded-xl col-span-2">
                  <p className="text-xs text-muted-foreground">Room</p>
                  <p className="font-semibold">Room {myPatient.roomNumber}, {myPatient.blockName} • Bed {myPatient.bedNumber}</p>
                </div>
              )}
              {myPatient.assignedDoctorName && (
                <div className="p-3 bg-accent rounded-xl">
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="font-semibold">{myPatient.assignedDoctorName}</p>
                </div>
              )}
              {myPatient.assignedPhysiotherapistName && (
                <div className="p-3 bg-accent rounded-xl">
                  <p className="text-xs text-muted-foreground">Therapist</p>
                  <p className="font-semibold">{myPatient.assignedPhysiotherapistName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-lg font-bold mb-3">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="card-medical text-center py-8">
              <Calendar size={40} className="mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-muted-foreground">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="card-medical cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => navigate(`/appointments/${apt.id}`)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold capitalize">{apt.type}</h3>
                      <p className="text-sm text-muted-foreground">{apt.date} • {apt.time}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctorName || apt.physiotherapistName}</p>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Records */}
        <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
          <h2 className="text-lg font-bold mb-3">Recent Health Records</h2>
          {myHealthRecords.length === 0 ? (
            <div className="card-medical text-center py-8">
              <FileText size={40} className="mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-muted-foreground">No health records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myHealthRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="card-medical">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <FileText size={20} className="text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{record.date}</h3>
                      <p className="text-sm text-muted-foreground">
                        {record.doctorName || record.physiotherapistName || 'Doctor'}
                      </p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{record.notes}</p>
                      )}
                    </div>
                    {record.bloodPressure && (
                      <span className="text-xs bg-accent px-2 py-1 rounded-lg">{record.bloodPressure}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!myPatient && (
          <div className="card-medical text-center py-8 animate-fade-in">
            <User size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
            <h3 className="font-bold text-lg mb-2">Welcome to NatureCure HMS</h3>
            <p className="text-muted-foreground mb-4">Your patient profile will appear here once your doctor registers you in the system.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}