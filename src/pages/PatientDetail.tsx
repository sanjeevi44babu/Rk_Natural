import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Edit, Heart, Stethoscope, LogOut, Plus, QrCode, Copy, Check, Printer, Droplets, Thermometer, Weight, Ruler, Activity, XCircle, FileText, Calendar, Building2, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import treatmentsData from '@/data/treatments.json';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, healthRecords, appointments, updateAppointment } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const patient = (patients || []).find(p =>
    p.id?.toLowerCase() === id?.toLowerCase() ||
    (p as any)._id?.toLowerCase() === id?.toLowerCase()
  );

  const patientRecords = (healthRecords || []).filter(r =>
    r.patientId?.toLowerCase() === id?.toLowerCase() ||
    (r as any).patient_id?.toLowerCase() === id?.toLowerCase() ||
    (patient?.id && r.patientId === patient.id)
  );

  const patientAppointments = (appointments || []).filter(a =>
    a.patientId?.toLowerCase() === id?.toLowerCase() ||
    (a as any).patient_id?.toLowerCase() === id?.toLowerCase() ||
    (patient?.id && a.patientId === patient.id)
  );

  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'appointments'>('profile');
  const [copied, setCopied] = useState(false);
  const [isEditingTherapy, setIsEditingTherapy] = useState(false);
  const [tempTherapy, setTempTherapy] = useState(patient?.assignedPhysiotherapistName || '');
  const [therapyType, setTherapyType] = useState<'Therapy' | 'Treatment'>('Therapy');
  const [isSaving, setIsSaving] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const { updatePatient: updatePatientData, users, addAppointment, addHealthRecord } = useData();

  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleOutTime, setScheduleOutTime] = useState('09:45');
  const [scheduleTherapistId, setScheduleTherapistId] = useState('');

  // Sync tempTherapy when patient loads
  useEffect(() => {
    if (patient?.assignedPhysiotherapistName) {
      setTempTherapy(patient.assignedPhysiotherapistName);
    }
  }, [patient]);

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Patient not found</div>
      </DashboardLayout>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isSupervisor = user?.role === 'supervisor';
  const isTherapist = user?.role === 'physiotherapist';

  const canEdit = isDoctor; // Supervisor no longer gets the direct Edit button here
  const canHealthCheck = isDoctor || isTherapist;
  const canDischarge = isDoctor || isSupervisor;
  const therapists = (users || []).filter(u => u.role === 'physiotherapist' && u.isApproved);
  const maleTherapists = therapists.filter(t => t.gender?.toLowerCase() === 'male');
  const femaleTherapists = therapists.filter(t => t.gender?.toLowerCase() === 'female');
  const otherTherapists = therapists.filter(t => t.gender?.toLowerCase() !== 'male' && t.gender?.toLowerCase() !== 'female');
  const canSchedule = isSupervisor;

  const copyPatientId = () => {
    const pId = patient.id || (patient as any)._id || 'N/A';
    navigator.clipboard.writeText(pId.toUpperCase());
    setCopied(true);
    toast.success('Patient ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const qrData = JSON.stringify({
    patientId: patient.id,
    name: patient.fullName,
    age: patient.age,
    gender: patient.gender,
    bloodType: patient.bloodType,
    phone: patient.phone,
  });

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Patient ID Card with QR */}
        <div className="card-medical bg-primary/5 border-primary/20 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex-shrink-0 bg-white p-2 rounded-lg">
                <QRCodeSVG value={qrData} size={48} level="M" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wider font-bold">Patient ID</p>
                <p className="text-base sm:text-xl font-bold font-mono text-primary truncate">{(patient.id || (patient as any)._id || 'N/A').toUpperCase()}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={copyPatientId} className="flex-1 sm:flex-initial">
                {copied ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/patients/${id}/qr-tag`)} className="flex-1 sm:flex-initial">
                <Printer size={16} className="mr-1" />
                Print
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Header */}
        <div className="card-medical mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar name={patient.fullName} size="xl" />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{patient.fullName}</h1>
              <p className="text-muted-foreground">{patient.age} years • {patient.gender}</p>
              <p className="text-[10px] text-muted-foreground/70 italic flex items-center gap-1 mt-0.5 justify-center sm:justify-start">
                <Calendar size={10} />
                Registered: {patient.createdAt ? new Date(patient.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
              </p>
              {patient.diagnosis && (
                <span className="badge-primary inline-block mt-2">{patient.diagnosis}</span>
              )}
              {patient.roomNumber && (
                <p className="text-sm text-secondary mt-1">
                  Room {patient.roomNumber}, {patient.blockName} - Bed {patient.bedNumber}
                </p>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${patient.status === 'admitted' ? 'bg-success/10 text-success' :
              patient.status === 'discharged' ? 'bg-muted text-muted-foreground' :
                'bg-secondary/10 text-secondary'
              }`}>
              {(patient.status || 'outpatient')}
            </span>
          </div>
        </div>

        {/* Quick Actions (Unified Box Bar) */}
        {!isAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 animate-fade-in">
            {canSchedule && (
              <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
                <DialogTrigger asChild>
                  <button className="role-card flex-col items-center justify-center p-4 border-secondary/20 hover:border-secondary hover:bg-secondary/5 shadow-sm">
                    <Calendar size={24} className="mb-2 text-secondary" />
                    <span className="text-sm font-medium text-secondary">Schedule</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col p-4 md:p-6">
                  <DialogHeader className="shrink-0 pb-2">
                    <DialogTitle className="text-lg text-foreground">Schedule Appointment</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3 py-1">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-foreground/80 font-bold tracking-wider">Patient Details</Label>
                      <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/20">
                        <p className="font-bold text-foreground">{patient.fullName}</p>
                        <p className="text-sm text-muted-foreground">ID: {patient.id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm mt-1 text-foreground">
                          <span className="font-medium">Current Therapist:</span> {patient.assignedPhysiotherapistName || 'None'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="date" className="text-xs text-foreground/80 font-medium">Date</Label>
                        <Input
                          id="date"
                          type="date"
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
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="input-medical h-8 text-sm bg-secondary/10 border-secondary/20 text-foreground"
                            style={{ colorScheme: 'initial' }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="out-time" className="text-xs text-foreground/80 font-medium">Out-Time</Label>
                          <Input
                            id="out-time"
                            type="time"
                            value={scheduleOutTime}
                            onChange={(e) => setScheduleOutTime(e.target.value)}
                            className="input-medical h-8 text-sm bg-secondary/10 border-secondary/20 text-foreground"
                            style={{ colorScheme: 'initial' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-foreground/80 tracking-wider">Select Therapist (Matches Patient Gender: {patient.gender || 'Unspecified'})</Label>
                      <div className="border rounded-xl overflow-hidden divide-y max-h-[160px] overflow-y-auto">
                        {/* Female Therapists - Only show for female patients */}
                        {femaleTherapists.length > 0 && patient.gender?.toLowerCase() === 'female' && (
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
                        {maleTherapists.length > 0 && patient.gender?.toLowerCase() === 'male' && (
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

                        {/* Other/Non-binary Therapists - Show for matching gender patients */}
                        {otherTherapists.length > 0 && patient.gender?.toLowerCase() !== 'male' && patient.gender?.toLowerCase() !== 'female' && (
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

                        {((patient.gender?.toLowerCase() === 'female' && femaleTherapists.length === 0) ||
                          (patient.gender?.toLowerCase() === 'male' && maleTherapists.length === 0)) && (
                            <div className="p-4 text-sm text-muted-foreground text-center italic bg-muted/5">
                              No matching {patient.gender} therapists available.
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
                    <Button size="sm" variant="outline" onClick={() => setIsScheduling(false)}>Cancel</Button>
                    <Button
                      size="sm"
                      disabled={!scheduleTherapistId || !scheduleDate || !scheduleTime}
                      onClick={async () => {
                        const selectedT = therapists.find(t => (t.id || (t as any)._id) === scheduleTherapistId);
                        if (!selectedT) return;

                        const tId = selectedT.id || (selectedT as any)._id;
                        const tName = selectedT.fullName;

                        // Parse time for AM/PM format
                        const [hours, minutes] = scheduleTime.split(':');
                        const h = parseInt(hours);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const formattedTime = `${h % 12 || 12}:${minutes} ${ampm}`;

                        const newAppointment = {
                          id: `apt-${Date.now()}`,
                          patientId: id!,
                          patientName: patient.fullName,
                          patientAge: patient.age,
                          patientGender: patient.gender,
                          physiotherapistId: tId,
                          physiotherapistName: tName,
                          date: scheduleDate,
                          time: formattedTime,
                          duration: 45, // Default for now, can be calculated
                          status: 'upcoming' as const,
                          type: 'therapy' as const,
                          notes: `Scheduled Session: ${scheduleTime} - ${scheduleOutTime}. By Supervisor ${user?.fullName}`,
                          createdAt: new Date().toISOString(),
                        };

                        try {
                          await addAppointment(newAppointment);

                          addNotification({
                            title: 'Appointment Scheduled',
                            message: `Therapy session scheduled for ${patient.fullName} with ${tName} at ${formattedTime}.`,
                            type: 'success',
                            role: 'physiotherapist',
                            userId: tId,
                          });

                          if (!patient.assignedPhysiotherapistId) {
                            await updatePatientData(id!, {
                              assignedPhysiotherapistId: tId,
                              assignedPhysiotherapistName: tName,
                            });
                          }

                          toast.success(`Scheduled ${patient.fullName} with ${tName} on ${scheduleDate}`);
                          setIsScheduling(false);
                        } catch (error: any) {
                          toast.error(error?.message || 'Failed to schedule appointment');
                        }
                      }}
                    >
                      Confirm Schedule
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {(user?.role === 'doctor' || user?.role === 'frontdesk') && (
              <button className="role-card flex-col items-center justify-center p-4 border-primary/20 hover:border-primary hover:bg-primary/5 shadow-sm" onClick={() => navigate(`/patients/${id}/edit`)}>
                <Edit size={24} className="mb-2 text-primary" />
                <span className="text-sm font-medium text-primary">Edit Profile</span>
              </button>
            )}

            <button className="role-card flex-col items-center justify-center p-4 border-secondary/20 hover:border-secondary hover:bg-secondary/5 shadow-sm" onClick={() => navigate(`/patients/${id}/qr-tag`)}>
              <QrCode size={24} className="mb-2 text-secondary" />
              <span className="text-sm font-medium text-secondary">QR Tag</span>
            </button>

            {canDischarge && patient.status === 'admitted' && (
              <button className="role-card flex-col items-center justify-center p-4 border-destructive/20 hover:border-destructive hover:bg-destructive/5 text-destructive shadow-sm" onClick={() => navigate(`/patients/${id}/discharge`)}>
                <LogOut size={24} className="mb-2" />
                <span className="text-sm font-medium">Discharge</span>
              </button>
            )}
          </div>
        )}



        {isAdmin && (
          <div className="bg-muted/50 border border-border rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              👁️ Admin View Only - You can view patient details but cannot modify them
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {(['profile', 'history', 'appointments'] as const)
            .filter(tab => !(isTherapist && tab === 'appointments'))
            .map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            {/* Vitals */}
            <div className="card-medical">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart size={18} className="text-destructive" />
                Current Vitals & Measurements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="text-center p-3 bg-accent rounded-xl">
                  <Droplets size={20} className="mx-auto mb-1 text-destructive" />
                  <p className="text-lg font-bold text-primary">{patient.bloodPressure || '—'}</p>
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-xl">
                  <Thermometer size={20} className="mx-auto mb-1 text-warning" />
                  <p className="text-lg font-bold text-warning">{patient.temperature ? `${patient.temperature}°F` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-xl">
                  <Weight size={20} className="mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold text-secondary">{patient.weight ? `${patient.weight} kg` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Weight</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-xl">
                  <Ruler size={20} className="mx-auto mb-1 text-foreground" />
                  <p className="text-lg font-bold text-foreground">{patient.height ? `${patient.height} cm` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Height</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-xl">
                  <Activity size={20} className="mx-auto mb-1 text-success" />
                  <p className="text-lg font-bold text-success">{patient.weight && patient.height ? (patient.weight / ((patient.height / 100) ** 2)).toFixed(1) : '—'}</p>
                  <p className="text-xs text-muted-foreground">BMI</p>
                </div>
                <div className="text-center p-3 bg-destructive/5 rounded-xl border border-destructive/20">
                  <Droplets size={20} className="mx-auto mb-1 text-destructive" />
                  <p className="text-lg font-bold text-destructive">{patient.bloodType || '—'}</p>
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                </div>
              </div>
            </div>

            {/* Contact Information (Hidden for Physiotherapists as requested) */}
            {!isTherapist && (
              <div className="card-medical">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Mail size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{patient.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medical Info */}
            <div className="card-medical">
              <h3 className="font-semibold mb-4 text-primary">Medical Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Blood Group</p>
                  <p className="font-medium text-lg text-destructive">{patient.bloodType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Admission Date</p>
                  <p className="font-medium">{patient.admissionDate || 'N/A'}</p>
                </div>
                <div className="col-span-2 p-3 bg-secondary/5 rounded-xl border border-secondary/20 relative group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold uppercase text-secondary">
                      Assigned {therapyType}
                    </p>
                    {isTherapist && !isEditingTherapy && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 transition-opacity"
                        onClick={() => {
                          setTempTherapy(patient.assignedPhysiotherapistName || '');
                          setIsEditingTherapy(true);
                        }}
                      >
                        <Edit size={14} className="text-secondary" />
                      </Button>
                    )}
                  </div>

                  {isEditingTherapy ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3 py-1">
                        <Label htmlFor="therapy-type-toggle" className="text-[10px] font-bold uppercase text-muted-foreground">Treatment</Label>
                        <Switch
                          id="therapy-type-toggle"
                          checked={therapyType === 'Therapy'}
                          onCheckedChange={(checked) => setTherapyType(checked ? 'Therapy' : 'Treatment')}
                        />
                        <Label htmlFor="therapy-type-toggle" className="text-[10px] font-bold uppercase text-secondary">Therapy</Label>
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between bg-background border-secondary/20 text-foreground"
                          >
                            <span className="truncate">
                              {tempTherapy || "Select " + therapyType + "..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-3rem)] sm:w-80 p-0 border-secondary/20" align="start">
                          <Command>
                            <CommandInput placeholder={"Search " + therapyType + "..."} className="border-none focus:ring-0" />
                            <CommandEmpty className="py-6 text-center text-sm">No {therapyType.toLowerCase()} found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {treatmentsData.map((item) => (
                                <CommandItem
                                  key={item}
                                  value={item}
                                  onSelect={(currentValue) => {
                                    setTempTherapy(currentValue);
                                  }}
                                  className="cursor-pointer hover:bg-secondary/5"
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 text-secondary ${tempTherapy === item ? "opacity-100" : "opacity-0"
                                      }`}
                                  />
                                  {item}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-bold h-9"
                          disabled={isSaving}
                          onClick={async () => {
                            setIsSaving(true);
                            try {
                              await updatePatientData(id!, {
                                assignedPhysiotherapistName: tempTherapy,
                                assignedPhysiotherapistId: tempTherapy,
                              });

                              // Add a health record for history tracking
                              await addHealthRecord({
                                patientId: id!,
                                date: new Date().toISOString().split('T')[0],
                                treatment: tempTherapy,
                                notes: `${therapyType} updated: ${tempTherapy}`,
                                doctorName: user?.fullName,
                                doctorId: (user as any).id || (user as any)._id,
                              });

                              setIsEditingTherapy(false);
                              toast.success(`${therapyType} updated successfully`);
                            } catch (error) {
                              toast.error('Failed to update therapy');
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-3 text-muted-foreground hover:bg-accent rounded-xl"
                          disabled={isSaving}
                          onClick={() => setIsEditingTherapy(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-bold text-lg">{patient.assignedPhysiotherapistName || 'Not Assigned'}</p>
                  )}
                </div>
                {patient.dischargeDate && (
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Discharge Date</p>
                    <p className="font-medium">{patient.dischargeDate}</p>
                  </div>
                )}
              </div>
              {(patient.problem || (patient as any).problem) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Patient Problem</p>
                  <p className="font-bold text-secondary text-lg">{patient.problem || (patient as any).problem}</p>
                </div>
              )}
              {patient.diagnosis && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Primary Diagnosis</p>
                  <p className="font-bold text-primary">{patient.diagnosis}</p>
                </div>
              )}
              {patient.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Observation Notes</p>
                  <p className="text-sm italic text-muted-foreground">{patient.notes}</p>
                </div>
              )}
              {patient.prescription && (
                <div className="mt-4 pt-4 border-t border-border bg-primary/5 -mx-4 px-4 py-4 mb-2">
                  <p className="text-xs font-bold uppercase text-primary mb-1">Prescription</p>
                  <p className="font-medium text-sm text-primary">{patient.prescription}</p>
                </div>
              )}
              {patient.treatmentPlan && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Treatment Plan</p>
                  <p className="text-sm">{patient.treatmentPlan}</p>
                </div>
              )}
              {patient.followUpDate && (
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Next Follow-up</p>
                  <span className="badge-primary px-3 py-1">{patient.followUpDate}</span>
                </div>
              )}
              {(user?.role === 'doctor') && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Status Management</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updatePatientData(patient.id || (patient as any)._id, { status: 'admitted' });
                        toast.success(`Status updated: ${patient.fullName} is now Admitted`);
                      }}
                      className={patient.status === 'admitted' ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-background text-muted-foreground border hover:bg-success/10 hover:text-success'}
                    >
                      Admit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        updatePatientData(patient.id || (patient as any)._id, { status: 'outpatient' });
                        toast.success(`Status updated: ${patient.fullName} is now Not Admitted`);
                      }}
                      className={patient.status !== 'admitted' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background text-muted-foreground border hover:bg-primary/10 hover:text-primary'}
                    >
                      Not Admit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3 animate-fade-in">
            {patientRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><p>No health records found</p></div>
            ) : (
              patientRecords.map((record) => (
                <div key={record.id} className="card-medical">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="badge-secondary">{record.date}</span>
                      <p className="text-sm text-muted-foreground mt-1">{record.doctorName || record.physiotherapistName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {record.bloodPressure && (<div className="text-center p-2 bg-accent rounded-lg"><p className="text-sm font-medium">{record.bloodPressure}</p><p className="text-xs text-muted-foreground">BP</p></div>)}
                    {record.temperature && (<div className="text-center p-2 bg-accent rounded-lg"><p className="text-sm font-medium">{record.temperature}°F</p><p className="text-xs text-muted-foreground">Temp</p></div>)}
                    {record.heartRate && (<div className="text-center p-2 bg-accent rounded-lg"><p className="text-sm font-medium">{record.heartRate}</p><p className="text-xs text-muted-foreground">Heart Rate</p></div>)}
                    {record.weight && (<div className="text-center p-2 bg-accent rounded-lg"><p className="text-sm font-medium">{record.weight} kg</p><p className="text-xs text-muted-foreground">Weight</p></div>)}
                  </div>
                  {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                  {record.treatment && (
                    <div className="mt-2 p-2 bg-secondary/5 rounded-lg border border-secondary/20">
                      <p className="text-xs text-secondary font-bold uppercase tracking-wider">Assigned Treatment</p>
                      <p className="text-sm font-bold text-secondary">{record.treatment}</p>
                    </div>
                  )}
                  {record.problem && (
                    <div className="mt-2 p-2 bg-accent rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Patient Problem</p>
                      <p className="text-sm font-medium text-foreground">{record.problem}</p>
                    </div>
                  )}
                  {record.prescription && (
                    <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-primary font-bold uppercase tracking-wider">Prescription</p>
                      <p className="text-sm font-medium text-primary">{record.prescription}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-3 animate-fade-in">
            {patientAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><p>No appointments found</p></div>
            ) : (
              patientAppointments.map((apt) => (
                <div key={apt.id} className="card-medical">
                  <div className="flex items-center justify-between">
                    <div className="cursor-pointer flex-1" onClick={() => navigate(`/appointments/${apt.id}`)}>
                      <p className="font-medium">{apt.date} at {apt.time}</p>
                      <p className="text-sm text-muted-foreground capitalize">{apt.type}</p>
                      {apt.doctorName && <p className="text-xs text-primary">Doctor: {apt.doctorName}</p>}
                      {apt.physiotherapistName && <p className="text-xs text-secondary">Therapist: {apt.physiotherapistName}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${apt.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                        apt.status === 'completed' ? 'bg-success/10 text-success' :
                          'b  g-destructive/10 text-destructive'
                        }`}>{apt.status}</span>
                      {apt.status === 'upcoming' && (isDoctor || isSupervisor) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            updateAppointment(apt.id, { status: 'cancelled' });
                            addNotification({
                              title: 'Appointment Cancelled',
                              message: `Appointment for ${patient.fullName} on ${apt.date} at ${apt.time} was cancelled`,
                              type: 'warning',
                              role: 'all',
                            });
                            toast.success('Appointment cancelled');
                          }}
                        >
                          <XCircle size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
