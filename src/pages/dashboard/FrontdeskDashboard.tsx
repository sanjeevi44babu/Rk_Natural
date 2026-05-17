import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Calendar, Plus, 
  Search, QrCode, ChevronRight, Clock,
  FileText, CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { SearchBar } from '@/components/common/SearchBar';
import { NotificationBell } from '@/components/common/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function FrontdeskDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, appointments } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const activePatients = (patients || []).filter(p => p.status !== 'discharged');
  const todayAppointments = (appointments || []).filter(a => 
    isSameDay(new Date(a.date), new Date()) && a.status !== 'cancelled'
  );
  const pendingRegistrations = (patients || []).filter(p => p.status === 'outpatient' && !p.assignedDoctorId);

  const filteredPatients = activePatients
    .filter(p => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome Header */}
        <div className="dashboard-header animate-fade-in">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div>
              <p className="text-primary-foreground/80 text-[10px] uppercase tracking-wider font-bold">Frontdesk Administration</p>
              <h1 className="text-xl font-bold">Welcome, {user?.fullName || 'Staff'}</h1>
              <p className="text-primary-foreground/80 text-xs mt-1 line-clamp-1">
                Manage patient registrations and appointments efficiently.
              </p>
            </div>
            <NotificationBell />
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-4 mt-4 md:mt-6">
            <button 
              onClick={() => navigate('/patients/new')}
              className="bg-white text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 hover:bg-white/90 transition-colors shadow-sm"
            >
              <UserPlus size={16} className="md:w-[18px] md:h-[18px]" />
              Register Patient
            </button>
            <button 
              onClick={() => navigate('/appointments/new')}
              className="bg-primary-foreground/10 text-white border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 hover:bg-primary-foreground/20 transition-colors"
            >
              <Calendar size={16} className="md:w-[18px] md:h-[18px]" />
              Book Appointment
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard 
            icon={Users} 
            value={activePatients.length} 
            label="Active Patients" 
            variant="primary"
            onClick={() => navigate('/patients')}
          />
          <StatCard 
            icon={Calendar} 
            value={todayAppointments.length} 
            label="Today's Appointments" 
            variant="secondary"
            onClick={() => navigate('/appointments')}
          />
          <StatCard 
            icon={UserPlus} 
            value={pendingRegistrations.length} 
            label="New Registrations"
          />
          <StatCard 
            icon={CheckCircle} 
            value={(appointments || []).filter(a => a.status === 'completed').length} 
            label="Total Completed" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Find Patient */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Quick Find Patient</h2>
              <button 
                onClick={() => navigate('/patients')}
                className="text-primary text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            
            <SearchBar 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Recent Patients Section (Copied from Doctor style) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  {searchQuery ? 'Search Results' : 'Recent Patients'} ({filteredPatients.length})
                </h2>
                <button 
                  onClick={() => navigate('/patients')}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {filteredPatients.length === 0 ? (
                  <div className="card-medical text-center py-8 text-muted-foreground">
                    <Users size={32} className="mx-auto mb-2 opacity-20" />
                    <p>No patients found</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <div key={patient.id} className="card-medical">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                          <span className="text-primary font-bold text-sm">
                            {(patient.fullName || 'Patient').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                          <h3 className="font-semibold">{patient.fullName}</h3>
                          <p className="text-sm text-muted-foreground">ID: {patient.id.toUpperCase()} • {patient.phone}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          patient.status === 'admitted' ? 'bg-success/10 text-success' :
                          patient.status === 'discharged' ? 'bg-muted text-muted-foreground' :
                          'bg-secondary/10 text-secondary'
                        }`}>{patient.status}</span>
                      </div>
                      
                      {/* Quick actions for Frontdesk */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => navigate(`/patients/${patient.id}`)}>
                          <FileText size={14} className="mr-1" /> Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => navigate(`/patients/${patient.id}/qr-tag`)}>
                          <QrCode size={14} className="mr-1" /> QR Tag
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => navigate(`/rooms/allocate/${patient.id}`)}>
                          <Plus size={14} className="mr-1" /> Room
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Today's Schedule Snapshot */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Today's Schedule</h2>
            <div className="space-y-3">
              {todayAppointments.slice(0, 6).length === 0 ? (
                <div className="card-medical text-center py-8 text-muted-foreground">
                  <Clock size={32} className="mx-auto mb-2 opacity-20" />
                  <p>No appointments for today</p>
                </div>
              ) : (
                todayAppointments.slice(0, 6).map((apt) => (
                  <div key={apt.id} className="card-medical p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex flex-col items-center justify-center text-[10px] font-bold text-secondary">
                      {apt.time.split(' ')[0]}
                      <span className="text-[8px] uppercase">{apt.time.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground truncate">{apt.doctorName || apt.physiotherapistName || 'General'}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${
                      apt.status === 'upcoming' ? 'bg-primary' : 
                      apt.status === 'in-progress' ? 'bg-secondary' : 
                      'bg-success'
                    }`} />
                  </div>
                ))
              )}
              {todayAppointments.length > 6 && (
                <button 
                  onClick={() => navigate('/appointments')}
                  className="w-full py-2 text-xs text-center text-primary font-medium hover:underline"
                >
                  View all {todayAppointments.length} appointments
                </button>
              )}
            </div>

            {/* Quick Links */}
            <div className="card-medical p-4 space-y-3">
              <h3 className="text-sm font-bold border-b pb-2 mb-2">Helpful Tools</h3>
              <button onClick={() => navigate('/scan-patient')} className="w-full flex items-center gap-3 text-sm hover:text-primary transition-colors py-1">
                <QrCode size={16} /> Scan Patient QR
              </button>
              <button onClick={() => navigate('/rooms')} className="w-full flex items-center gap-3 text-sm hover:text-primary transition-colors py-1">
                <FileText size={16} /> Room Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
