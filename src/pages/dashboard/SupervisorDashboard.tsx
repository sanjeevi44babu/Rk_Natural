import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, ChevronRight,
  Building, BedDouble, Plus, QrCode
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarStrip } from '@/components/common/CalendarStrip';
import { StatCard } from '@/components/common/StatCard';
import { UserCard } from '@/components/common/UserCard';
import { NotificationBell } from '@/components/common/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SupervisorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users, patients, appointments, getAvailableBeds, addAppointment, updateAppointment } = useData();
  const { addNotification } = useNotifications();

  const therapists = users.filter(u => u.role === 'physiotherapist' && u.isApproved);
  const activePatients = patients.filter(p => p.status === 'admitted' || p.status === 'outpatient');
  const admittedPatients = patients.filter(p => p.status === 'admitted');
  const availableBeds = getAvailableBeds();
  const unassignedPatients = admittedPatients.filter(p => !p.assignedPhysiotherapistId);

  const todayStr = selectedDate.toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const therapyAppointments = todayAppointments.filter(a => a.physiotherapistId);

  const getTherapistStatus = (therapistId: string) => {
    const therapistAppointments = todayAppointments.filter(a => a.physiotherapistId === therapistId);

    // Status Logic:
    // Checking (Yellow): Any session is 'in-progress'
    // Checked (Green): Has at least one completed session AND none in progress
    // Not Checked (Red): No sessions or all sessions are upcoming

    const isChecking = therapistAppointments.some(a => a.status === 'in-progress');
    const hasCompleted = therapistAppointments.some(a => a.status === 'completed');
    const allUpcoming = therapistAppointments.length > 0 && therapistAppointments.every(a => a.status === 'upcoming');

    let statusColor = 'bg-destructive'; // Red (Not Checked)
    let statusText = 'Not Checked';

    if (isChecking) {
      statusColor = 'bg-warning animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]'; // Yellow (Checking)
      statusText = 'Checking';
    } else if (hasCompleted) {
      statusColor = 'bg-success'; // Green (Checked)
      statusText = 'Checked';
    } else if (allUpcoming) {
      statusColor = 'bg-destructive'; // Red (Not Checked)
      statusText = 'Not Checked';
    }

    return {
      statusColor,
      statusText,
      bookedSlots: therapistAppointments.length,
      isAvailable: therapistAppointments.length < 5,
      nextFreeSlot: therapistAppointments.length < 5 ? getNextFreeSlot(therapyAppointments) : null,
      appointments: therapistAppointments,
    };
  };

  const getNextFreeSlot = (bookedAppointments: typeof todayAppointments) => {
    const allSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    const bookedTimes = bookedAppointments.map(a => a.time);
    return allSlots.find(slot => !bookedTimes.includes(slot)) || null;
  };

  const handleQuickAssign = async (therapistId: string, therapistName: string, patientId: string, patientName: string) => {
    const availability = getTherapistAvailability(therapistId);
    if (!availability.nextFreeSlot) {
      toast.error('No available slots for this therapist');
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    const newAppointment = {
      id: `apt-${Date.now()}`,
      patientId,
      patientName,
      patientAge: patient?.age,
      patientGender: patient?.gender,
      physiotherapistId: therapistId,
      physiotherapistName: therapistName,
      date: todayStr,
      time: availability.nextFreeSlot,
      duration: 45,
      status: 'upcoming' as const,
      type: 'therapy' as const,
      notes: `Assigned by Supervisor ${user?.fullName}`,
      createdAt: new Date().toISOString(),
    };

    try {
      await addAppointment(newAppointment);
      addNotification({
        title: 'Therapy Session Scheduled',
        message: `${patientName} assigned to ${therapistName} at ${availability.nextFreeSlot}`,
        type: 'success',
        role: 'physiotherapist',
        userId: therapistId,
      });
      toast.success(`Assigned ${patientName} to ${therapistName} at ${availability.nextFreeSlot}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign therapist');
    }
  };

  const handleCancelAppointment = (aptId: string, patientName: string) => {
    updateAppointment(aptId, { status: 'cancelled' });
    addNotification({
      title: 'Appointment Cancelled',
      message: `Supervisor ${user?.fullName} cancelled appointment for ${patientName}`,
      type: 'warning',
      role: 'all',
    });
    toast.success('Appointment cancelled');
  };

  const stats = {
    patients: activePatients.length,
    therapists: therapists.length,
    availableBeds: availableBeds.length,
    todayAppointments: todayAppointments.length,
  };

  // State for quick assign modal
  const [assigningTherapist, setAssigningTherapist] = useState<{ id: string; name: string } | null>(null);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome Header */}
        <div className="dashboard-header animate-fade-in">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div>
              <p className="text-primary-foreground/80 text-[10px] uppercase tracking-wider font-bold">Supervisor</p>
              <h1 className="text-xl font-bold">{user?.fullName || 'Supervisor'}</h1>
            </div>
            <NotificationBell />
          </div>
          <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Stats Overview - Consolidated into One Card */}
        <div className="card-medical p-4 md:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="font-bold text-lg text-foreground">Dashboard Overview</h3>
            <div className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest">
              Live Stats
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group" onClick={() => navigate('/patients')}>
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="text-xl font-black text-foreground">{stats.patients}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Patients</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group" onClick={() => navigate('/physiotherapists')}>
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary mb-2 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="text-xl font-black text-foreground">{therapists.length}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Therapists</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-warning/5 hover:bg-warning/10 transition-colors group cursor-pointer" onClick={() => navigate('/reports/today')}>
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center text-warning mb-2 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <span className="text-xl font-black text-foreground">{stats.todayAppointments}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Today</span>
            </div>
          </div>
        </div>



        {/* Therapist Status Table (Excel Format) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Therapist Status ({therapists.length})</h2>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground capitalize">
                <div className="w-2.5 h-2.5 rounded-full bg-success" /> Checked
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground capitalize">
                <div className="w-2.5 h-2.5 rounded-full bg-warning shadow-[0_0_5px_rgba(234,179,8,0.4)]" /> Checking
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground capitalize">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive" /> Not check
              </span>
            </div>
          </div>

          <div className="card-medical overflow-hidden border-2 border-secondary/10">
            <div className="overflow-x-auto md:overflow-x-visible">
              <table className="w-full text-left border-collapse table-fixed md:table-auto">
                <thead>
                  <tr className="bg-secondary/5 border-b border-secondary/10">
                    <th className="px-3 md:px-4 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary w-[40%] md:w-auto">Therapist</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-secondary hidden md:table-cell">Patient</th>
                    <th className="px-2 md:px-4 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary w-[20%] md:w-auto text-center md:text-left">Time</th>
                    <th className="px-2 md:px-4 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary w-[20%] md:w-auto text-center md:text-left">Status</th>
                    <th className="px-3 md:px-4 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary text-right w-[20%] md:w-auto">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {therapists.map((therapist) => {
                    const status = getTherapistStatus(therapist.id || (therapist as any)._id);
                    const tAppointments = status.appointments;

                    if (tAppointments.length === 0) {
                      return (
                        <tr key={therapist.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-3 md:px-4 py-3 md:py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 md:gap-2">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.statusColor}`} />
                                <span className="font-bold text-xs md:text-sm truncate">{therapist.fullName}</span>
                              </div>
                              <span className="text-[9px] text-muted-foreground/60 md:hidden mt-0.5 ml-3.5 italic">No patient</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-muted-foreground italic hidden md:table-cell">No patient assigned</td>
                          <td className="px-2 md:px-4 py-3 md:py-4 text-[10px] md:text-xs text-muted-foreground text-center md:text-left">--:--</td>
                          <td className="px-2 md:px-4 py-3 md:py-4 text-center md:text-left">
                            <span className="px-1.5 md:px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[8px] md:text-[10px] font-bold uppercase whitespace-nowrap">
                              {status.statusText}
                            </span>
                          </td>
                          <td className="px-3 md:px-4 py-3 md:py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 md:h-7 px-2 md:px-3 text-[8px] md:text-[10px] font-bold uppercase"
                              disabled={unassignedPatients.length === 0}
                              onClick={() => setAssigningTherapist({
                                id: therapist.id || (therapist as any)._id,
                                name: therapist.fullName,
                                gender: therapist.gender
                              })}
                            >
                              Assign
                            </Button>
                          </td>
                        </tr>
                      );
                    }

                    return tAppointments.map((apt, idx) => (
                      <tr key={apt.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-3 md:px-4 py-3 md:py-4">
                          <div className="flex flex-col">
                            {idx === 0 ? (
                              <div className="flex items-center gap-1.5 md:gap-2">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.statusColor}`} />
                                <span className="font-bold text-xs md:text-sm truncate">{therapist.fullName}</span>
                              </div>
                            ) : (
                              <div className="w-2 h-2 ml-3.5 hidden md:block" />
                            )}
                            <div className="md:hidden mt-1 ml-3.5">
                              <p className="text-[10px] font-bold text-foreground leading-tight truncate">{apt.patientName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="font-medium text-sm">{apt.patientName}</span>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-center md:text-left">
                          <span className="text-[10px] md:text-xs font-medium tabular-nums">{apt.time.replace(' ', '')}</span>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-center md:text-left">
                          <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase whitespace-nowrap ${apt.status === 'completed' ? 'bg-success/10 text-success' :
                              apt.status === 'in-progress' ? 'bg-warning/10 text-warning animate-pulse' :
                                'bg-primary/10 text-primary'
                            }`}>
                            {apt.status === 'in-progress' ? 'Active' : apt.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3 md:py-4 text-right">
                          {idx === 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 md:h-7 px-2 md:px-3 text-[8px] md:text-[10px] font-bold uppercase border-secondary/20 text-secondary hover:bg-secondary/5"
                              disabled={!status.isAvailable || unassignedPatients.length === 0}
                              onClick={() => setAssigningTherapist({
                                id: therapist.id || (therapist as any)._id,
                                name: therapist.fullName,
                                gender: therapist.gender
                              })}
                            >
                              + Assign
                            </Button>
                          )}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Assign Modal Backdrop */}
        {assigningTherapist && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold text-lg text-primary">Assign to {assigningTherapist.name}</h3>
                <button onClick={() => setAssigningTherapist(null)} className="p-1 hover:bg-accent rounded-full transition-colors">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Select a matching unassigned patient ({assigningTherapist.gender}):</p>
                {unassignedPatients.filter(p => p.gender?.toLowerCase() === assigningTherapist.gender?.toLowerCase()).length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <Users size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground italic">No unassigned {assigningTherapist.gender} patients remaining for today</p>
                  </div>
                ) : (
                  unassignedPatients
                    .filter(p => p.gender?.toLowerCase() === assigningTherapist.gender?.toLowerCase())
                    .map(patient => (
                      <button
                        key={patient.id}
                        onClick={() => {
                          handleQuickAssign(assigningTherapist.id, assigningTherapist.name, patient.id, patient.fullName);
                          setAssigningTherapist(null);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-sm">{patient.fullName}</p>
                          <p className="text-xs text-muted-foreground">{patient.diagnosis || 'General'} • {patient.gender}</p>
                        </div>
                        <Plus size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))
                )}
              </div>
              <div className="p-4 bg-accent/30 flex justify-end">
                <Button variant="ghost" onClick={() => setAssigningTherapist(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Patients (Admitted & Outpatient) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Active Patients ({activePatients.length})</h2>
            <button onClick={() => navigate('/patients')} className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activePatients.slice(0, 5).map((patient) => (
              <UserCard
                key={patient.id || (patient as any)._id}
                id={patient.id || (patient as any)._id}
                name={patient.fullName}
                subtitle={`${patient.age}y • ${patient.gender}`}
                variant="grid"
                onClick={() => navigate(`/patients/${patient.id || (patient as any)._id}`)}
              />
            ))}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
