import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Supervisors() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { users } = useData();
  const { user } = useAuth();
  const supervisors = users.filter(u => u.role === 'supervisor' && u.isApproved);
  const filtered = supervisors.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()));

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No supervisors found to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Created Date', 'Created Time'];
    const csvRows = filtered.map(sup => {
      const createdAt = sup.createdAt ? new Date(sup.createdAt) : new Date();
      return [
        `"${sup.fullName}"`,
        `"${sup.email}"`,
        `"${sup.phone || 'N/A'}"`,
        `"${sup.role}"`,
        `"${createdAt.toLocaleDateString()}"`,
        `"${createdAt.toLocaleTimeString()}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NatureCure_Supervisors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Supervisor list exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold truncate">Supervisors</h1>
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
            {user?.role !== 'doctor' && (
              <button 
                onClick={() => navigate('/users/create-staff?role=supervisor')}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm h-auto"
              >
                <UserPlus size={14} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden xs:inline">Create Supervisor</span>
                <span className="xs:hidden">Create</span>
              </button>
            )}
          </div>
        </div>
        <SearchBar placeholder="Search..." value={search} onChange={setSearch} />
        <div className="space-y-3">
          {filtered.map((sup) => (
            <div key={sup.id || (sup as any)._id} className="card-medical cursor-pointer" onClick={() => navigate(`/supervisors/${sup.id || (sup as any)._id}`)}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary-light flex items-center justify-center"><span className="text-secondary font-bold">{sup.fullName.split(' ').map(n => n[0]).join('')}</span></div>
                <div className="flex-1"><h3 className="font-semibold">{sup.fullName}</h3><p className="text-xs text-muted-foreground">{sup.email}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}