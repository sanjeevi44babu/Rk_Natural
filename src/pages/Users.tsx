import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, Edit, Eye, Search, Filter, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UserRole } from '@/types';

export default function Users() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'pending' ? 'pending' : 'all';
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(initialFilter === 'pending' ? 'all' : 'all');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { users, approveUser, updateUser, patients } = useData();

  const filteredUsers = (users || []).filter(u => {
    const fullName = u?.fullName || '';
    const email = u?.email || '';
    const matchesSearch = fullName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ? true : 
      statusFilter === 'pending' ? !u.isApproved : u.isApproved;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleApprove = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    approveUser(userId);
    toast.success('User approved successfully!');
  };

  const handleReject = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateUser(userId, { isActive: false });
    toast.success('User rejected');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users, approve signups, edit roles</p>
          </div>
        </div>

        <SearchBar 
          placeholder="Search users by name or email..." 
          value={search} 
          onChange={setSearch} 
        />

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'approved'].map((status) => (
            <button 
              key={status} 
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap ${
                statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-accent'
              }`}
            >
              {status === 'pending' ? `Pending (${users.filter(u => !u.isApproved).length})` : status}
            </button>
          ))}
        </div>

        {/* Role Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'doctor', 'supervisor', 'physiotherapist', 'frontdesk'].map((role) => (
            <button 
              key={role} 
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap ${
                roleFilter === role ? 'bg-secondary text-secondary-foreground' : 'bg-accent'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div 
                key={u.id || (u as any)._id} 
                className="card-medical"
                onClick={() => navigate(`/users/${u.id || (u as any)._id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="avatar-wrapper">
                    <span className="text-primary font-semibold">
                      {(u.fullName || 'User').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{u.fullName}</h3>
                      <span className="badge-primary capitalize">{u.role}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    {u.phone && <p className="text-sm text-muted-foreground">{u.phone}</p>}
                    {u.specialization && (
                      <p className="text-xs text-secondary">{u.specialization}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status Badge */}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      u.isApproved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {u.isApproved ? 'Active' : 'Pending'}
                    </span>

                    {/* Action Buttons */}
                    {currentUser?.role === 'admin' && (
                      <div className="flex gap-1">
                        {!u.isApproved && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-success hover:bg-success/90 h-8 w-8 p-0"
                              onClick={(e) => handleApprove(u.id, e)}
                              title="Approve"
                            >
                              <Check size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={(e) => handleReject(u.id, e)}
                              title="Reject"
                            >
                              <X size={14} />
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${u.id}`);
                          }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
