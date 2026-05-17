import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, QrCode, Check, XCircle, Building2, Calendar, Clock, LogIn, LogOut, ChevronDown, Activity, Download, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNotifications } from '@/contexts/NotificationContext';

export default function Patients() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, updatePatient, users, addAppointment, appointments, updateAppointment, fetchAllData } = useData();
  const { addNotification } = useNotifications();
  const [openAttendanceId, setOpenAttendanceId] = useState<string | null>(null);

  const handleExportCSV = () => {
    if (filteredPatients.length === 0) {
      toast.error('No patients found to export');
      return;
    }

    const headers = ['Name', 'Age', 'Gender', 'Phone', 'Assigned Doctor', 'Assigned Therapist', 'Assigned Treatments', 'Status', 'Blood Type', 'Diagnosis', 'Registered Date', 'Registered Time'];
    const csvRows = filteredPatients.map(p => {
      const createdAt = p.createdAt ? new Date(p.createdAt) : new Date();
      const latestApt = appointments.find(a => a.patientId === (p.id || (p as any)._id) && a.status !== 'cancelled' && a.type === 'therapy');
      const therapist = users.find(u => (u.id || (u as any)._id) === (p.assignedPhysiotherapistId || latestApt?.physiotherapistId));
      return [
        `"${p.fullName}"`,
        `"${p.age || 'N/A'}"`,
        `"${p.gender || 'N/A'}"`,
        `"${p.phone || 'N/A'}"`,
        `"${p.assignedDoctorName || 'Not Assigned'}"`,
        `"${therapist ? therapist.fullName : 'Not Assigned'}"`,
        `"${(p.treatmentPlan || 'N/A').replace(/"/g, '""')}"`,
        `"${p.status || 'outpatient'}"`,
        `"${p.bloodType || 'N/A'}"`,
        `"${(p.diagnosis || 'N/A').replace(/"/g, '""')}"`,
        `"${createdAt.toLocaleDateString()}"`,
        `"${createdAt.toLocaleTimeString()}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NatureCure_Patients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Patient list exported successfully');
  };

  // Scheduling states
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedulingPatient, setSchedulingPatient] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleOutTime, setScheduleOutTime] = useState('09:45');
  const [scheduleTherapistId, setScheduleTherapistId] = useState('');
  const [reschedulingAptId, setReschedulingAptId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState('');

  const therapists = (users || []).filter(u => u.role === 'physiotherapist' && u.isApproved);
  const maleTherapists = therapists.filter(t => t.gender?.toLowerCase() === 'male');
  const femaleTherapists = therapists.filter(t => t.gender?.toLowerCase() === 'female');
  const otherTherapists = therapists.filter(t => t.gender?.toLowerCase() !== 'male' && t.gender?.toLowerCase() !== 'female');

  const filteredPatients = (patients || [])
    .filter(patient => {
      const fullName = patient?.fullName || 'Patient';
      const matchesSearch = fullName.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !filterDate || (patient.createdAt && patient.createdAt.startsWith(filterDate));

      if (!matchesSearch || !matchesDate) return false;

      // Role-based filtering
      if (user?.role === 'doctor') {
        const doctorId = user.id || (user as any)._id;
        return (patient.assignedDoctorId === doctorId || !patient.assignedDoctorId);
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Newest first
    });

  const isAdminViewOnly = user?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold truncate">Patients</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={async () => {
                const toastId = toast.loading('Refreshing patient data...');
                try {
                  await fetchAllData();
                  toast.success('Data synchronized', { id: toastId });
                } catch (err) {
                  toast.error('Refresh failed', { id: toastId });
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all font-bold text-[10px] md:text-sm shadow-sm border border-primary/20 group"
              title="Refresh Data"
            >
              <RefreshCcw size={14} className="md:w-[18px] md:h-[18px] group-active:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {user?.role === 'admin' && (
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 transition-all font-bold text-[10px] md:text-sm shadow-sm border border-secondary/20 group shrink-0"
                title="Download CSV"
              >
                <Download size={14} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Export</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <SearchBar 
              placeholder="Search by patient name..." 
              value={search} 
              onChange={setSearch} 
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48 group">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-9 h-10 bg-white/50 border-primary/10 rounded-xl text-xs font-bold focus-visible:ring-primary shadow-sm hover:border-primary/30 transition-all cursor-pointer"
                style={{ colorScheme: 'initial' }}
                title="Filter by Registration Date"
              />
              {filterDate && (
                <button 
                  onClick={() => setFilterDate('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                  title="Clear Date Filter"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Patient List */}
        {user?.role === 'admin' ? (
          <div className="card-medical overflow-hidden border-2 border-primary/10 shadow-sm">
            <div className="overflow-x-hidden">
              <table className="w-full text-left border-collapse table-fixed md:table-auto">
                <thead>
                  <tr className="bg-primary/5 border-b border-primary/10">
                    <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary w-[35%] md:w-auto">Patient</th>
                    <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary w-[40%] md:w-auto">Care Team</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-widest text-primary hidden md:table-cell">Treatment Plan</th>
                    <th className="px-2 md:px-6 py-4 md:py-5 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary w-[25%] md:w-auto text-right md:text-left">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground italic text-lg">No patients found</td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => {
                      const latestApt = appointments.find(a => a.patientId === (patient.id || (patient as any)._id) && a.status !== 'cancelled' && a.type === 'therapy');
                      const therapist = users.find(u => (u.id || (u as any)._id) === (patient.assignedPhysiotherapistId || latestApt?.physiotherapistId));
                      return (
                        <tr 
                          key={patient.id || (patient as any)._id} 
                          className="hover:bg-accent/30 transition-colors cursor-pointer group" 
                          onClick={() => navigate(`/patients/${patient.id || (patient as any)._id}`)}
                        >
                          <td className="px-3 md:px-6 py-4 md:py-6">
                            <div className="flex items-center gap-2 md:gap-4">
                              <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-primary/10 flex items-center justify-center text-[10px] md:text-sm font-bold text-primary group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                                {(patient.fullName || 'P').charAt(0)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs md:text-base text-foreground leading-tight truncate">{patient.fullName}</span>
                                <span className="text-[9px] md:text-xs text-muted-foreground uppercase font-bold tracking-wider mt-0.5 md:mt-1">{patient.age}Y • {patient.gender}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-4 md:py-6">
                            <div className="space-y-1 md:space-y-2">
                              <div className="flex items-center gap-1.5 md:gap-2.5">
                                <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full flex-shrink-0 ${patient.assignedDoctorName ? 'bg-success' : 'bg-muted'}`} />
                                <span className="text-[10px] md:text-sm font-bold text-foreground/80 truncate">Doctor: {patient.assignedDoctorName || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 md:gap-2.5">
                                <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full flex-shrink-0 ${therapist ? 'bg-secondary' : 'bg-muted'}`} />
                                <span className="text-[10px] md:text-sm font-bold text-foreground/80 truncate">Therapist: {therapist ? therapist.fullName : 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 max-w-[240px] hidden md:table-cell">
                            <div className="p-2.5 bg-accent/20 rounded-xl border border-accent/10 group-hover:border-accent/30 transition-colors">
                              <p className="text-xs text-muted-foreground line-clamp-2 font-bold leading-relaxed" title={patient.treatmentPlan}>
                                {patient.treatmentPlan || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-2 md:px-6 py-4 md:py-6">
                            <div className="flex flex-col text-right md:text-left">
                              <span className="text-[10px] md:text-xs font-bold text-foreground tracking-tight whitespace-nowrap">{new Date(patient.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                              <span className="text-[9px] md:text-[11px] text-muted-foreground font-bold uppercase mt-0.5 md:mt-1">{new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No patients found</p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
              <div key={patient.id || (patient as any)._id} className="user-card" onClick={() => navigate(`/patients/${patient.id || (patient as any)._id}`)}>
                <div className="avatar-wrapper">
                  <span className="text-primary font-semibold">
                    {(patient.fullName || 'Patient').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{patient.fullName || 'No Name'}</h3>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                      patient.status === 'admitted' ? 'bg-success/10 text-success border-success/20' : 'bg-secondary/10 text-secondary border-secondary/20'
                    }`}>
                      {patient.status || 'outpatient'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{patient.age} years • {patient.gender}</p>
                  <p className="text-[10px] text-muted-foreground/70 italic flex items-center gap-1 mt-0.5">
                    <Calendar size={10} />
                    Registered: {patient.createdAt ? new Date(patient.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                  </p>
                  {patient.roomNumber && (
                    <p className="text-xs text-primary">Room {patient.roomNumber}, {patient.blockName}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {/* Quick Schedule/Reschedule Button (Supervisor only) */}
                    {user?.role === 'supervisor' && (() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const todayApt = appointments.find(a => 
                        a.patientId === (patient.id || (patient as any)._id) && 
                        a.date === todayStr && 
                        a.status !== 'cancelled' &&
                        a.type === 'therapy'
                      );
                      
                      return (
                        <button
                          onClick={() => {
                            setSchedulingPatient(patient);
                            if (todayApt) {
                              setReschedulingAptId(todayApt.id || (todayApt as any)._id);
                              setScheduleDate(todayApt.date);
                              setScheduleTime(todayApt.time);
                              setScheduleTherapistId(todayApt.physiotherapistId);
                            } else {
                              setReschedulingAptId(null);
                              setScheduleDate(new Date().toISOString().split('T')[0]);
                              setScheduleTime('09:00');
                              setScheduleOutTime('09:45');
                              setScheduleTherapistId('');
                            }
                            setIsScheduling(true);
                          }}
                          className={`p-2 rounded-xl transition-all flex items-center gap-2 group shadow-sm border ${
                            todayApt 
                              ? 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' 
                              : 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20'
                          }`}
                          title={todayApt ? "Reschedule Appointment" : "Quick Schedule"}
                        >
                          {todayApt ? <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" /> : <Calendar size={18} className="group-hover:scale-110 transition-transform" />}
                          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                            {todayApt ? "Reschedule" : "Schedule"}
                          </span>
                        </button>
                      );
                    })()}

                    {/* Status Management - Only for Doctors on this page */}
                    {user?.role === 'doctor' && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`h-6 md:h-7 rounded-full flex items-center gap-0.5 md:gap-1 px-0.5 md:px-1 transition-all active:scale-95 overflow-hidden border border-white/10 group ${patient.status === 'admitted'
                            ? 'bg-success text-white'
                            : 'bg-secondary text-white'
                            }`}>
                            {/* Icon Part */}
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-md md:rounded-lg bg-white/20 flex items-center justify-center ml-0.5 shadow-inner">
                              {patient.status === 'admitted' ? <Check size={10} className="md:w-[12px] md:h-[12px] text-white" /> : <Activity size={10} className="md:w-[12px] md:h-[12px] text-white" />}
                            </div>

                            {/* Text Part */}
                            <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-tighter md:tracking-widest px-0.5">
                              {patient.status || 'outpatient'}
                            </span>

                            {/* Chevron Only (No divider) */}
                            <div className="flex items-center h-full px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <ChevronDown size={8} className="md:w-[10px] md:h-[10px]" />
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-2 bg-background/95 backdrop-blur-md border-border shadow-2xl rounded-2xl" align="end">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1 mb-1 tracking-widest border-b border-border/50">Update Status</p>
                            <button
                              onClick={() => {
                                updatePatient(patient.id || (patient as any)._id, { 
                                  status: 'admitted',
                                  assignedDoctorId: user?.id || (user as any)._id,
                                  assignedDoctorName: user?.fullName
                                });
                                toast.success(`Status updated: ${patient.fullName} is now Admitted by Dr. ${user?.fullName}`);
                              }}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all ${patient.status === 'admitted' ? 'bg-success/20 text-success' : 'hover:bg-accent text-muted-foreground'
                                }`}
                            >
                              <div className={`p-1.5 rounded-lg ${patient.status === 'admitted' ? 'bg-success/20' : 'bg-muted'}`}>
                                <Check size={14} />
                              </div>
                              Admit Patient
                            </button>
                            <button
                              onClick={() => {
                                updatePatient(patient.id || (patient as any)._id, { 
                                  status: 'outpatient',
                                  assignedDoctorId: user?.id || (user as any)._id,
                                  assignedDoctorName: user?.fullName
                                });
                                toast.success(`Status updated: ${patient.fullName} is now Outpatient by Dr. ${user?.fullName}`);
                              }}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all ${patient.status !== 'admitted' ? 'bg-secondary/20 text-secondary' : 'hover:bg-accent text-muted-foreground'
                                }`}
                            >
                              <div className={`p-1.5 rounded-lg ${patient.status !== 'admitted' ? 'bg-secondary/20' : 'bg-muted'}`}>
                                <Activity size={14} />
                              </div>
                              Mark Outpatient
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>

                  {/* IN/OUT Features (Premium Dropdown - Ultra Compact) */}
                  {user?.role === 'physiotherapist' && (
                    <Popover
                      open={openAttendanceId === String(patient.id || (patient as any)._id)}
                      onOpenChange={(open) => setOpenAttendanceId(open ? String(patient.id || (patient as any)._id) : null)}
                    >
                      <PopoverTrigger asChild>
                        <button className={`h-6 md:h-7 rounded-full flex items-center gap-0.5 md:gap-1 px-0.5 md:px-1 transition-all active:scale-95 overflow-hidden border border-white/10 group shadow-sm ${patient.outTime ? 'bg-destructive text-white' :
                          patient.inTime ? 'bg-secondary text-white' :
                            'bg-primary text-white'
                          }`}>
                          {/* Icon Part */}
                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-md md:rounded-lg bg-white/20 flex items-center justify-center ml-0.5 shadow-inner">
                            {patient.outTime ? <LogOut size={10} className="text-white" /> :
                              patient.inTime ? <LogIn size={10} className="text-white" /> :
                                <Clock size={10} className="text-white" />}
                          </div>

                          {/* Text Part */}
                          <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest px-1">
                            {patient.outTime ? 'Marked Out' : patient.inTime ? 'Marked In' : 'Attendance'}
                          </span>

                          {/* Chevron Only */}
                          <div className="flex items-center h-full px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <ChevronDown size={8} className="md:w-[10px] md:h-[10px]" />
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 bg-background/95 backdrop-blur-md border-border shadow-2xl rounded-2xl" align="end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1 mb-1 tracking-widest border-b border-border/50">Mark Attendance</p>
                          <button
                            onClick={() => {
                              const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              setOpenAttendanceId(null);
                              updatePatient(patient.id || (patient as any)._id, { inTime: time });
                              toast.success(`In-Time marked: ${time}`);
                            }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all ${patient.inTime ? 'bg-secondary/20 text-secondary' : 'hover:bg-accent text-muted-foreground'
                              }`}
                          >
                            <div className={`p-1.5 rounded-lg ${patient.inTime ? 'bg-secondary/20' : 'bg-muted'}`}>
                              <LogIn size={14} />
                            </div>
                            <div className="text-left">
                              <p className="leading-none">{patient.inTime ? `IN: ${patient.inTime}` : 'Mark In'}</p>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              setOpenAttendanceId(null);
                              updatePatient(patient.id || (patient as any)._id, { outTime: time });
                              toast.success(`Out-Time marked: ${time}`);
                            }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all ${patient.outTime ? 'bg-destructive/20 text-destructive' : 'hover:bg-accent text-muted-foreground'
                              }`}
                          >
                            <div className={`p-1.5 rounded-lg ${patient.outTime ? 'bg-destructive/20' : 'bg-muted'}`}>
                              <LogOut size={14} />
                            </div>
                            <div className="text-left">
                              <p className="leading-none">{patient.outTime ? `OUT: ${patient.outTime}` : 'Mark Out'}</p>
                            </div>
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>

      {/* Shared Schedule Dialog */}
      {schedulingPatient && (
        <Dialog open={isScheduling} onOpenChange={(open) => {
          setIsScheduling(open);
          if (!open) setSchedulingPatient(null);
        }}>
          <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col p-4 md:p-6">
            <DialogHeader className="shrink-0 pb-2">
              <DialogTitle className="text-lg text-foreground">{reschedulingAptId ? 'Reschedule Appointment' : 'Schedule Appointment'}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 py-1">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-foreground/80 font-bold tracking-wider">Patient Details</Label>
                <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/20">
                  <p className="font-bold text-foreground">{schedulingPatient.fullName}</p>
                  <p className="text-sm text-muted-foreground">ID: {(schedulingPatient.id || schedulingPatient._id).slice(-6).toUpperCase()}</p>
                  <p className="text-sm mt-1 text-foreground">
                    <span className="font-medium">Current Status:</span> <span className="capitalize">{schedulingPatient.status || 'Outpatient'}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs text-foreground/80 font-medium">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="input-medical h-8 text-sm bg-secondary/10 border-secondary/20 text-foreground"
                    style={{ colorScheme: 'initial' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="in-time" className="text-xs text-foreground/80 font-medium">In-Time</Label>
                    <Input
                      id="in-time"
                      type="time"
                      min={scheduleDate === new Date().toISOString().split('T')[0] ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined}
                      value={scheduleTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        const todayStr = new Date().toISOString().split('T')[0];
                        const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        
                        if (scheduleDate === todayStr && val < nowTime) {
                          toast.error("Past time not allowed for today");
                          setScheduleTime(nowTime);
                        } else {
                          setScheduleTime(val);
                        }
                      }}
                      className="input-medical h-8 text-sm bg-secondary/10 border-secondary/20 text-foreground"
                      style={{ colorScheme: 'initial' }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="out-time" className="text-xs text-foreground/80 font-medium">Out-Time</Label>
                    <Input
                      id="out-time"
                      type="time"
                      min={scheduleDate === new Date().toISOString().split('T')[0] ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined}
                      value={scheduleOutTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        const todayStr = new Date().toISOString().split('T')[0];
                        const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        
                        if (scheduleDate === todayStr && val < nowTime) {
                          setScheduleOutTime(nowTime);
                        } else {
                          setScheduleOutTime(val);
                        }
                      }}
                      className="input-medical h-8 text-sm bg-secondary/10 border-secondary/20 text-foreground"
                      style={{ colorScheme: 'initial' }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-foreground/80 tracking-wider">Select Therapist (Matches Patient Gender: {schedulingPatient.gender || 'Unspecified'})</Label>
                <div className="border rounded-xl overflow-hidden divide-y max-h-[160px] overflow-y-auto">
                  {/* Female Therapists - Only show for female patients */}
                  {femaleTherapists.length > 0 && schedulingPatient.gender?.toLowerCase() === 'female' && (
                    <div className="bg-secondary/5">
                      <div className="px-3 py-1.5 bg-secondary/10 text-[10px] font-bold text-secondary uppercase tracking-widest border-b">
                        Female Therapists
                      </div>
                      {femaleTherapists.map(t => (
                        <div
                          key={t.id || (t as any)._id}
                          className={`p-2.5 px-3 text-sm cursor-pointer flex items-center justify-between hover:bg-secondary/10 transition-colors ${scheduleTherapistId === (t.id || (t as any)._id) ? 'bg-secondary/20 text-secondary font-bold' : ''}`}
                          onClick={() => setScheduleTherapistId(t.id || (t as any)._id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold">
                              {t.fullName.charAt(0)}
                            </div>
                            <span className="text-foreground">{t.fullName}</span>
                          </div>
                          {scheduleTherapistId === (t.id || (t as any)._id) && <Check size={14} className="text-secondary" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Male Therapists - Only show for male patients */}
                  {maleTherapists.length > 0 && schedulingPatient.gender?.toLowerCase() === 'male' && (
                    <div className="bg-primary/5">
                      <div className="px-3 py-1.5 bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest border-b">
                        Male Therapists
                      </div>
                      {maleTherapists.map(t => (
                        <div
                          key={t.id || (t as any)._id}
                          className={`p-2.5 px-3 text-sm cursor-pointer flex items-center justify-between hover:bg-primary/10 transition-colors ${scheduleTherapistId === (t.id || (t as any)._id) ? 'bg-primary/20 text-primary font-bold' : ''}`}
                          onClick={() => setScheduleTherapistId(t.id || (t as any)._id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                              {t.fullName.charAt(0)}
                            </div>
                            <span className="text-foreground">{t.fullName}</span>
                          </div>
                          {scheduleTherapistId === (t.id || (t as any)._id) && <Check size={14} className="text-primary" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Other/Non-binary Therapists - Show for patients with matching gender */}
                  {otherTherapists.length > 0 && schedulingPatient.gender?.toLowerCase() !== 'male' && schedulingPatient.gender?.toLowerCase() !== 'female' && (
                    <div className="bg-muted/5">
                      <div className="px-3 py-1.5 bg-muted/10 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b">
                        Other Therapists
                      </div>
                      {otherTherapists.map(t => (
                        <div
                          key={t.id || (t as any)._id}
                          className={`p-2.5 px-3 text-sm cursor-pointer flex items-center justify-between hover:bg-muted/10 transition-colors ${scheduleTherapistId === (t.id || (t as any)._id) ? 'bg-muted/20 text-muted-foreground font-bold' : ''}`}
                          onClick={() => setScheduleTherapistId(t.id || (t as any)._id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center text-[10px] font-bold">
                              {t.fullName.charAt(0)}
                            </div>
                            <span className="text-foreground">{t.fullName}</span>
                          </div>
                          {scheduleTherapistId === (t.id || (t as any)._id) && <Check size={14} className="text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {((schedulingPatient.gender?.toLowerCase() === 'female' && femaleTherapists.length === 0) ||
                    (schedulingPatient.gender?.toLowerCase() === 'male' && maleTherapists.length === 0)) && (
                      <div className="p-4 text-sm text-muted-foreground text-center italic bg-muted/5">
                        No matching {schedulingPatient.gender} therapists available.
                      </div>
                    )}

                  {therapists.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground text-center italic bg-muted/5">
                      No approved physiotherapists available.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t gap-2 shrink-0 mt-auto">
              <Button size="sm" variant="outline" onClick={() => {
                setIsScheduling(false);
                setSchedulingPatient(null);
                setReschedulingAptId(null);
              }}>Cancel</Button>
              <Button
                size="sm"
                className={`font-bold uppercase tracking-widest h-8 rounded-xl transition-all active:scale-95 ${
                  reschedulingAptId ? 'bg-warning hover:bg-warning/90' : 'bg-primary hover:bg-primary/90 text-white'
                }`}
                disabled={!scheduleDate || !scheduleTherapistId || !scheduleTime}
                onClick={async () => {
                  const selectedT = therapists.find(t => (t.id || (t as any)._id) === scheduleTherapistId);
                  if (!selectedT) return;

                  // Date & Time Validation: Prevent scheduling in the past
                  const todayStr = new Date().toISOString().split('T')[0];
                  if (scheduleDate < todayStr) {
                    toast.error("Cannot schedule for a past date.");
                    return;
                  }

                  if (scheduleDate === todayStr) {
                    const nowTime = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });
                    if (scheduleTime < nowTime) {
                      toast.error("Cannot schedule for a past time today.");
                      return;
                    }
                  }

                  const tId = selectedT.id || (selectedT as any)._id;
                  const tName = selectedT.fullName;

                  // Parse time for AM/PM format
                  const [hours, minutes] = scheduleTime.split(':');
                  const h = parseInt(hours);
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const formattedTime = `${h % 12 || 12}:${minutes} ${ampm}`;

                  const appointmentData = {
                    patientId: schedulingPatient.id || (schedulingPatient as any)._id,
                    patientName: schedulingPatient.fullName,
                    patientAge: schedulingPatient.age,
                    patientGender: schedulingPatient.gender,
                    physiotherapistId: tId,
                    physiotherapistName: tName,
                    date: scheduleDate,
                    time: formattedTime,
                    duration: 45,
                    status: 'upcoming' as const,
                    type: 'therapy' as const,
                    notes: reschedulingAptId 
                      ? `Rescheduled by Supervisor ${user?.fullName}`
                      : `Quick Scheduled Session: ${scheduleTime}. By Supervisor ${user?.fullName}`,
                    createdAt: new Date().toISOString(),
                  };

                  try {
                    if (reschedulingAptId) {
                      await updateAppointment(reschedulingAptId, appointmentData);
                      // Sync patient assignment
                      await updatePatient(schedulingPatient.id || (schedulingPatient as any)._id, {
                        assignedPhysiotherapistId: tId,
                        assignedPhysiotherapistName: tName
                      });
                      toast.success(`Rescheduled ${schedulingPatient.fullName} to ${scheduleDate}`);
                    } else {
                      await addAppointment({
                        id: `apt-${Date.now()}`,
                        ...appointmentData
                      });
                      // Sync patient assignment
                      await updatePatient(schedulingPatient.id || (schedulingPatient as any)._id, {
                        assignedPhysiotherapistId: tId,
                        assignedPhysiotherapistName: tName
                      });
                      toast.success(`Scheduled ${schedulingPatient.fullName} on ${scheduleDate}`);
                    }

                    addNotification({
                      title: reschedulingAptId ? 'Appointment Rescheduled' : 'Appointment Scheduled',
                      message: `Therapy session for ${schedulingPatient.fullName} with ${tName} is now set for ${scheduleDate} at ${formattedTime}.`,
                      type: 'success',
                      role: 'physiotherapist',
                      userId: tId,
                    });

                    setIsScheduling(false);
                    setSchedulingPatient(null);
                    setReschedulingAptId(null);
                  } catch (error: any) {
                    toast.error(error?.message || 'Failed to process appointment');
                  }
                }}
              >
                {reschedulingAptId ? 'Confirm Reschedule' : 'Confirm Schedule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
