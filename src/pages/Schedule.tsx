import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarStrip } from '@/components/common/CalendarStrip';
import { SearchBar } from '@/components/common/SearchBar';
import { AppointmentCard } from '@/components/common/AppointmentCard';
import { Appointment } from '@/types';

const mockSchedule: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Alexander Bennett',
    date: new Date().toISOString(),
    time: '09:00 AM',
    duration: 30,
    status: 'upcoming',
    type: 'consultation',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Michael Davidson',
    date: new Date().toISOString(),
    time: '10:30 AM',
    duration: 45,
    status: 'upcoming',
    type: 'therapy',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Olivia Turner',
    date: new Date().toISOString(),
    time: '02:00 PM',
    duration: 30,
    status: 'completed',
    type: 'follow-up',
    createdAt: new Date().toISOString(),
  },
];

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredSchedule = mockSchedule.filter(apt =>
    apt.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Manage your daily schedule</p>
        </div>

        {/* Calendar */}
        <CalendarStrip 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
        />

        {/* Search */}
        <SearchBar
          placeholder="Search schedule..."
          value={search}
          onChange={setSearch}
        />

        {/* Schedule List */}
        <div className="space-y-3">
          {filteredSchedule.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No appointments scheduled for this day</p>
            </div>
          ) : (
            filteredSchedule.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => navigate(`/appointments/${appointment.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
