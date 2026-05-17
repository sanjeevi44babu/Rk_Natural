import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle, Clock, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { appointments, updateAppointment, addHealthRecord } = useData();
  const { user } = useAuth();

  // Filter appointments based on role
  const getFilteredAppointments = () => {
    let filtered = appointments;
    
    if (user?.role === 'doctor') {
      filtered = appointments.filter(a => a.doctorId === user.id);
    } else if (user?.role === 'physiotherapist') {
      filtered = appointments.filter(a => a.physiotherapistId === user.id);
    }
    // Admin and supervisor see all

    // Search filter
    if (search) {
      filtered = filtered.filter(a => 
        (a.patientName || 'Patient').toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(a => a.status === activeFilter);
    }

    return filtered.sort((a, b) => {
      // Sort by date, then by time
      const dateA = a.date || '';
      const dateB = b.date || '';
      const dateCompare = dateA.localeCompare(dateB);
      if (dateCompare !== 0) return dateCompare;
      
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });
  };

  const filteredAppointments = getFilteredAppointments();

  // Can only supervisor and doctor create appointments
  const canCreate = user?.role === 'supervisor' || user?.role === 'doctor';

  // One-click complete for therapists
  const handleComplete = (aptId: string, patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateAppointment(aptId, { status: 'completed' });
    
    // Add health record
    addHealthRecord({
      id: `hr-${Date.now()}`,
      patientId,
      physiotherapistId: user?.id,
      physiotherapistName: user?.fullName,
      date: new Date().toISOString().split('T')[0],
      notes: 'Session completed successfully',
      createdAt: new Date().toISOString(),
    });

    toast.success('Treatment completed!');
  };

  const handleCancel = (aptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateAppointment(aptId, { status: 'cancelled' });
    toast.success('Appointment cancelled');
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">
              {user?.role === 'physiotherapist' 
                ? 'Your scheduled sessions - click Complete when done' 
                : 'Manage appointments'}
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => navigate('/appointments/new')} className="btn-primary">
              <Plus size={18} className="mr-2" />
              Schedule
            </Button>
          )}
        </div>

        {/* Search */}
        <SearchBar
          placeholder="Search by patient name..."
          value={search}
          onChange={setSearch}
        />

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div 
                key={apt.id || (apt as any)._id}
                className={`card-medical ${apt.status === 'completed' ? 'opacity-70' : ''}`}
                onClick={() => navigate(`/appointments/${apt.id || (apt as any)._id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    apt.status === 'completed' ? 'bg-success/10' :
                    apt.status === 'cancelled' ? 'bg-destructive/10' :
                    'bg-secondary/10'
                  }`}>
                    {apt.status === 'completed' ? (
                      <CheckCircle size={20} className="text-success" />
                    ) : apt.status === 'cancelled' ? (
                      <X size={20} className="text-destructive" />
                    ) : (
                      <Clock size={20} className="text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{apt.patientName}</h3>
                      {apt.patientAge && (
                        <span className="text-xs text-muted-foreground">
                          {apt.patientAge} yrs
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {apt.date} • {apt.time} • {apt.duration} mins
                    </p>
                    <p className="text-xs text-secondary capitalize">
                      {apt.type} {apt.physiotherapistName ? `with ${apt.physiotherapistName}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                      apt.status === 'completed' ? 'bg-success/10 text-success' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {apt.status}
                    </span>
                    <div className="flex gap-1">
                      {apt.status === 'upcoming' && user?.role === 'physiotherapist' && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-success hover:bg-success/90"
                          onClick={(e) => handleComplete(apt.id, apt.patientId, e)}
                        >
                          <CheckCircle size={12} className="mr-1" />
                          Complete
                        </Button>
                      )}
                      {apt.status === 'upcoming' && canCreate && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={(e) => handleCancel(apt.id, e)}
                        >
                          <X size={12} className="mr-1" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patients/${apt.patientId}`);
                        }}
                      >
                        <Eye size={12} className="mr-1" />
                        Patient
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB for creating appointment */}
      {canCreate && (
        <button 
          className="fab lg:hidden"
          onClick={() => navigate('/appointments/new')}
        >
          <Plus size={24} />
        </button>
      )}
    </DashboardLayout>
  );
}
