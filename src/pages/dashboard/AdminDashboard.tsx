import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCog, Activity, Calendar, ChevronRight, 
  ClipboardList, Eye, Shield, UserPlus
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarStrip } from '@/components/common/CalendarStrip';
import { StatCard } from '@/components/common/StatCard';
import { UserCard } from '@/components/common/UserCard';
import { NotificationBell } from '@/components/common/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users, patients, appointments } = useData();

  const doctors = (users || []).filter(u => u.role === 'doctor' && (u.isApproved !== false));
  const supervisors = (users || []).filter(u => u.role === 'supervisor' && (u.isApproved !== false));
  const therapists = (users || []).filter(u => (u.role === 'physiotherapist' || u.role === 'therapist') && (u.isApproved !== false));
  const frontdesks = (users || []).filter(u => u.role === 'frontdesk' && (u.isApproved !== false));
  const pendingUsers = (users || []).filter(u => u.isApproved === false);
  const todayAppointments = (appointments || []).filter(a =>
    a.date === new Date().toISOString().split('T')[0]
  );

  const stats = {
    doctors: doctors.length,
    patients: (users || []).filter(u => u.role === 'patient').length,
    therapists: therapists.length,
    supervisors: supervisors.length,
    frontdesks: frontdesks.length,
    todayAppointments: todayAppointments.length,
    pendingApprovals: pendingUsers.length,
  };

  const recentStaff = (users || [])
    .filter(u => u.isApproved && u.role !== 'admin' && u.role !== 'patient')
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome Header */}
        <div className="dashboard-header animate-fade-in">
          <div className="flex items-start justify-between mb-2 md:mb-4">
            <div>
              <p className="text-primary-foreground/80 text-[10px] md:text-sm uppercase tracking-wider font-bold">Welcome back,</p>
              <h1 className="text-xl md:text-2xl font-bold">{user?.fullName || 'Admin'}</h1>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 md:px-3 md:py-1 bg-white/20 rounded-full text-[10px] md:text-sm">
                <Shield size={12} className="md:w-[14px] md:h-[14px]" />
                Administrator
              </span>
            </div>
            <NotificationBell />
          </div>

          <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Pending Approvals Alert */}
        {stats.pendingApprovals > 0 && (
          <div
            className="card-medical bg-warning/10 border-warning/30 cursor-pointer animate-fade-in"
            onClick={() => navigate('/users?filter=pending')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Users size={20} className="text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-warning">{stats.pendingApprovals} Pending Approval(s)</p>
                <p className="text-sm text-muted-foreground">New user signup requests waiting</p>
              </div>
              <ChevronRight size={20} className="text-warning" />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <StatCard icon={UserCog} value={stats.doctors} label="Doctors" variant="primary" onClick={() => navigate('/doctors')} />
          <StatCard icon={Users} value={stats.frontdesks} label="Frontdesk" onClick={() => navigate('/frontdesk-users')} />
          <StatCard icon={Activity} value={stats.therapists} label="Therapists" onClick={() => navigate('/physiotherapists')} />
          <StatCard icon={Users} value={stats.supervisors} label="Supervisors" onClick={() => navigate('/supervisors')} />
          <StatCard icon={Users} value={stats.patients} label="Patients" onClick={() => navigate('/patients')} />
          <StatCard icon={ClipboardList} value={users.length} label="Total Users" onClick={() => navigate('/users')} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <button onClick={() => navigate('/frontdesk-users')} className="role-card">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <UserPlus size={20} className="text-success" />
            </div>
            <span className="flex-1 text-left font-medium">View Frontdesk</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/doctors')} className="role-card">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCog size={20} className="text-primary" />
            </div>
            <span className="flex-1 text-left font-medium">View Doctors</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/supervisors')} className="role-card">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Users size={20} className="text-secondary" />
            </div>
            <span className="flex-1 text-left font-medium">View Supervisors</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/patients')} className="role-card">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Eye size={20} className="text-success" />
            </div>
            <span className="flex-1 text-left font-medium">View Patients</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Recent Staff */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">All Staff Members</h2>
            <button onClick={() => navigate('/users')} className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentStaff.map((staff) => (
              <UserCard
                key={staff.id || (staff as any)._id}
                id={staff.id || (staff as any)._id}
                name={staff.fullName}
                role={(staff.role || 'user').charAt(0).toUpperCase() + (staff.role || 'user').slice(1)}
                subtitle={staff.specialization || staff.email}
                variant="grid"
                onClick={() => navigate(`/users/${staff.id || (staff as any)._id}`)}
              />
            ))}
          </div>
        </div>

        {/* Recent Patients (View Only) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Patients (View Only)</h2>
            <button onClick={() => navigate('/patients')} className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {patients.slice(0, 5).map((patient) => (
              <UserCard
                key={patient.id || (patient as any)._id}
                id={patient.id || (patient as any)._id}
                name={patient.fullName}
                subtitle={`${patient.age || 'N/A'}y • ${patient.gender || 'N/A'}`}
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
