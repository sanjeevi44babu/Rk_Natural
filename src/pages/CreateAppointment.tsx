import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Activity, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarStrip } from '@/components/common/CalendarStrip';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM',
];

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTherapist = searchParams.get('therapist');
  
  const { patients, users, addAppointment, appointments, rooms } = useData();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    physiotherapistId: preselectedTherapist || '',
    type: 'therapy' as 'therapy' | 'consultation' | 'checkup' | 'follow-up',
    duration: '45',
    roomNumber: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Only therapists for supervisor (no doctors selection)
  const therapists = users.filter(u => u.role === 'physiotherapist' && u.isApproved);
  const admittedPatients = patients.filter(p => p.status === 'admitted' || p.status === 'outpatient');

  // Get booked slots for selected therapist on selected date
  const getBookedSlots = (therapistId: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments
      .filter(a => a.physiotherapistId === therapistId && a.date === dateStr)
      .map(a => a.time);
  };

  const bookedSlots = formData.physiotherapistId ? getBookedSlots(formData.physiotherapistId) : [];

  // Get therapist availability status
  const getTherapistStatus = (therapistId: string) => {
    const bookedCount = getBookedSlots(therapistId).length;
    return {
      bookedCount,
      isAvailable: bookedCount < timeSlots.length,
      status: bookedCount < 3 ? 'Available' : bookedCount < 6 ? 'Busy' : 'Almost Full',
      statusColor: bookedCount < 3 ? 'text-success' : bookedCount < 6 ? 'text-warning' : 'text-destructive',
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Reset time when therapist changes
    if (e.target.name === 'physiotherapistId') {
      setSelectedTime('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !selectedTime || !formData.physiotherapistId) {
      toast.error('Please select patient, therapist, and time');
      return;
    }

    setIsLoading(true);

    const patient = patients.find(p => p.id === formData.patientId);
    const therapist = therapists.find(t => t.id === formData.physiotherapistId);

    const appointment = {
      id: `apt-${Date.now()}`,
      patientId: formData.patientId,
      patientName: patient?.fullName || '',
      patientAge: patient?.age,
      patientGender: patient?.gender,
      physiotherapistId: formData.physiotherapistId,
      physiotherapistName: therapist?.fullName,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration: parseInt(formData.duration),
      status: 'upcoming' as const,
      type: formData.type,
      roomNumber: formData.roomNumber || undefined,
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    addAppointment(appointment);

    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Appointment scheduled successfully!');
    navigate('/appointments');
    setIsLoading(false);
  };

  // Only supervisors and doctors can create appointments
  const canCreate = user?.role === 'supervisor' || user?.role === 'doctor';

  if (!canCreate) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">You don't have permission to create appointments</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

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

        <h1 className="text-2xl font-bold mb-6">Schedule Therapy Session</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />

          {/* Therapist Selection with Availability */}
          <div className="card-medical space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Select Therapist
            </h3>

            <div className="space-y-2">
              {therapists.map(therapist => {
                const status = getTherapistStatus(therapist.id);
                const isSelected = formData.physiotherapistId === therapist.id;

                return (
                  <div
                    key={therapist.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-card-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, physiotherapistId: therapist.id }));
                      setSelectedTime('');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                      }`}>
                        {isSelected ? (
                          <CheckCircle size={18} />
                        ) : (
                          <span className="text-primary font-semibold text-sm">
                            {therapist.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{therapist.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {therapist.specialization || 'Physiotherapist'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${status.statusColor}`}>
                          {status.status}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {status.bookedCount}/{timeSlots.length} slots
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          {formData.physiotherapistId && (
            <div className="card-medical">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                Select Time
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {timeSlots.map(time => {
                  const isBooked = bookedSlots.includes(time);
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isBooked 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed line-through' 
                          : isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-accent hover:bg-accent/80'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Gray slots are already booked
              </p>
            </div>
          )}

          {/* Patient Selection */}
          <div className="card-medical space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User size={18} className="text-primary" />
              Appointment Details
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2">Patient *</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="input-medical"
                required
              >
                <option value="">Select Patient</option>
                {admittedPatients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName} - {patient.age} yrs, {patient.gender} 
                    {patient.diagnosis ? ` (${patient.diagnosis})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-medical"
                >
                  <option value="therapy">Therapy</option>
                  <option value="checkup">Checkup</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="input-medical"
                >
                  <option value="15">15 mins</option>
                  <option value="30">30 mins</option>
                  <option value="45">45 mins</option>
                  <option value="60">60 mins</option>
                  <option value="90">90 mins</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Room</label>
                <select
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className="input-medical"
                >
                  <option value="">Select Room</option>
                  {(rooms || []).map(room => (
                    <option key={room.id} value={room.roomNumber}>
                      {room.blockName} - Room {room.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Session notes, special instructions..."
                className="input-medical resize-none"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full btn-primary" 
            disabled={isLoading || !formData.patientId || !selectedTime || !formData.physiotherapistId}
          >
            <Calendar size={18} className="mr-2" />
            {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
