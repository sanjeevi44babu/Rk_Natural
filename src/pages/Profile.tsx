import { useNavigate } from 'react-router-dom';
import { Edit, Phone, Mail, Calendar, MapPin, Briefcase, Lock, Settings as SettingsIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, appointments } = useData();

  // Calculate stats based on user role
  const myPatients = patients.filter(p => 
    p.assignedDoctorId === user?.id || p.assignedPhysiotherapistId === user?.id
  );
  const myAppointments = appointments.filter(a => 
    a.doctorId === user?.id || a.physiotherapistId === user?.id
  );
  const completedAppointments = myAppointments.filter(a => a.status === 'completed');

  const patientData = user?.role === 'patient' 
    ? patients.find(p => p.id === user?.id || p.id === (user as any)?._id || p.email === user?.email) 
    : null;

  const profileDetails = [
    { icon: Mail, label: 'Email', value: user?.email || 'Not set' },
    { icon: Phone, label: 'Phone', value: user?.phone || 'Not set' },
    { icon: Calendar, label: 'Date of Birth', value: user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set' },
    { icon: Briefcase, label: 'Role', value: user?.role?.charAt(0).toUpperCase() + (user?.role?.slice(1) || '') || 'Not set' },
    { icon: MapPin, label: 'Address', value: patientData?.address || user?.address || 'Not set' },
  ];

  // Add specialization for doctors/physiotherapists
  if (user?.specialization) {
    profileDetails.splice(3, 0, {
      icon: Briefcase,
      label: 'Specialization',
      value: user.specialization,
    });
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Profile Header */}
        <div className="card-medical">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar name={user?.fullName || 'User'} size="xl" />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{user?.fullName}</h1>
              <p className="text-muted-foreground capitalize">{user?.role}</p>
              {user?.specialization && (
                <p className="text-sm text-primary">{user.specialization}</p>
              )}
              <span className="badge-success inline-block mt-2">Active</span>
            </div>
            <Button 
              className="btn-secondary"
              onClick={() => navigate('/profile/edit')}
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="card-medical">
          <h3 className="font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            {profileDetails.map((detail, index) => {
              const Icon = detail.icon;
              return (
                <div key={`${detail.label}-${index}`} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{detail.label}</p>
                    <p className="font-medium">{detail.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="card-medical">
          <h3 className="font-semibold mb-4">Activity</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{myPatients.length}</p>
              <p className="text-sm text-muted-foreground">Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{myAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Appointments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{completedAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-medical">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/profile/edit')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Edit size={18} className="text-primary" />
              </div>
              <span className="flex-1 text-left font-medium">Edit Profile</span>
            </button>
            <button
              onClick={() => navigate('/change-password')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Lock size={18} className="text-secondary" />
              </div>
              <span className="flex-1 text-left font-medium">Change Password</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <SettingsIcon size={18} className="text-muted-foreground" />
              </div>
              <span className="flex-1 text-left font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/settings')}
          >
            Settings
          </Button>
          <Button 
            className="flex-1 btn-primary"
            onClick={() => navigate('/change-password')}
          >
            <Lock size={16} className="mr-2" />
            Change Password
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
