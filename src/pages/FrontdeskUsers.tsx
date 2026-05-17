import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function FrontdeskUsers() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { users } = useData();
  const { user } = useAuth();
  const frontdesks = users.filter(u => u.role === 'frontdesk' && u.isApproved);
  const filtered = frontdesks.filter(f => f.fullName.toLowerCase().includes(search.toLowerCase()));

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No frontdesk staff found to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Created Date', 'Created Time'];
    const csvRows = filtered.map(staff => {
      const createdAt = staff.createdAt ? new Date(staff.createdAt) : new Date();
      return [
        `"${staff.fullName}"`,
        `"${staff.email}"`,
        `"${staff.phone || 'N/A'}"`,
        `"${staff.role}"`,
        `"${createdAt.toLocaleDateString()}"`,
        `"${createdAt.toLocaleTimeString()}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NatureCure_Frontdesk_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Frontdesk list exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold truncate">Frontdesk Staff</h1>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {user?.role === 'admin' && (
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 transition-all font-bold text-[10px] md:text-sm shadow-sm border border-secondary/20 group"
                title="Download CSV"
              >
                <Download size={14} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Export</span>
              </button>
            )}
            <button 
              onClick={() => navigate('/users/create-staff?role=frontdesk')}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm h-auto"
            >
              <UserPlus size={14} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden xs:inline">Create Frontdesk</span>
              <span className="xs:hidden">Create</span>
            </button>
          </div>
        </div>
        <SearchBar placeholder="Search frontdesk staff..." value={search} onChange={setSearch} />
        <div className="space-y-3">
          {filtered.map((staff) => (
            <div 
              key={staff.id || (staff as any)._id} 
              className="card-medical cursor-pointer" 
              onClick={() => navigate(`/users/${staff.id || (staff as any)._id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {staff.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{staff.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">Active</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-accent/50 rounded-2xl">
              <p>No frontdesk staff found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
