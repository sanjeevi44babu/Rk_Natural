import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, Briefcase, Edit, Check, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { UserRole } from '@/types';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, updateUser, approveUser, patients, appointments } = useData();
  const { user: currentUser } = useAuth();
  
  const userProfile = (users || []).find(u => u.id === id || (u as any)._id === id);

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">User not found</div>
      </DashboardLayout>
    );
  }

  const userPatients = (patients || []).filter(p => 
    p.assignedDoctorId === id || p.assignedPhysiotherapistId === id
  );
  
  const userAppointments = appointments.filter(a => 
    a.doctorId === id || a.physiotherapistId === id
  );

  const handleApprove = () => {
    const userId = userProfile.id || (userProfile as any)._id;
    approveUser(userId);
    toast.success('User approved successfully!');
  };


  const handleToggleActive = () => {
    updateUser(id!, { isActive: !userProfile.isActive });
    toast.success(`User ${userProfile.isActive ? 'deactivated' : 'activated'}!`);
  };

  const isAdmin = currentUser?.role === 'admin';

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

        {/* User Header */}
        <div className="card-medical mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar name={userProfile.fullName} size="xl" />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{userProfile.fullName}</h1>
              <p className="text-muted-foreground capitalize">{userProfile.role}</p>
              {userProfile.specialization && (
                <p className="text-sm text-primary">{userProfile.specialization}</p>
              )}
              <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                <span className={`${userProfile.isApproved ? 'badge-success' : 'badge-warning'}`}>
                  {userProfile.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
                <span className={`${userProfile.isActive ? 'badge-primary' : 'bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm'}`}>
                  {userProfile.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card-medical mb-6">
          <h3 className="font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
            </div>
            {userProfile.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{userProfile.phone}</p>
                </div>
              </div>
            )}
            {userProfile.dateOfBirth && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{userProfile.dateOfBirth}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Role Information */}
        <div className="card-medical mb-6">
          <h3 className="font-semibold mb-4">Account Role</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Briefcase size={18} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Role</p>
              <p className="font-medium capitalize">{userProfile.role}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {(userProfile.role === 'doctor' || userProfile.role === 'physiotherapist') && (
          <div className="card-medical mb-6">
            <h3 className="font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent rounded-xl">
                <p className="text-2xl font-bold text-primary">{userPatients.length}</p>
                <p className="text-sm text-muted-foreground">Patients</p>
              </div>
              <div className="text-center p-4 bg-accent rounded-xl">
                <p className="text-2xl font-bold text-secondary">{userAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Appointments</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className="space-y-3">
            {!userProfile.isApproved && (
              <Button onClick={handleApprove} className="w-full bg-success hover:bg-success/90">
                <Check size={18} className="mr-2" />
                Approve User
              </Button>
            )}
            <Button 
              onClick={handleToggleActive} 
              variant={userProfile.isActive ? "destructive" : "default"}
              className="w-full"
            >
              {userProfile.isActive ? 'Deactivate User' : 'Activate User'}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
