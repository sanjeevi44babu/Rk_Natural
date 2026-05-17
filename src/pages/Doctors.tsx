import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Doctors() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { users, patients } = useData();
  const { user } = useAuth();
  const doctors = users.filter(u => u.role === 'doctor' && u.isApproved);
  const filtered = doctors.filter(d => d.fullName.toLowerCase().includes(search.toLowerCase()));

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No doctors found to export');
      return;
    }

    // CSV Headers
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Created Date', 'Created Time', 'Specialization'];
    
    // Format data rows
    const csvRows = filtered.map(doc => {
      const createdAt = doc.createdAt ? new Date(doc.createdAt) : new Date();
      const date = createdAt.toLocaleDateString();
      const time = createdAt.toLocaleTimeString();
      
      return [
        `"${doc.fullName}"`,
        `"${doc.email}"`,
        `"${doc.phone || 'N/A'}"`,
        `"${doc.role}"`,
        `"${date}"`,
        `"${time}"`,
        `"${doc.specialization || 'General'}"`
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NatureCure_Doctors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Doctor list exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold truncate">Doctors</h1>
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
              onClick={() => navigate('/users/create-staff?role=doctor')}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm h-auto"
            >
              <UserPlus size={14} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden xs:inline">Create Doctor</span>
              <span className="xs:hidden">Create</span>
            </button>
          </div>
        </div>
        <SearchBar placeholder="Search doctors..." value={search} onChange={setSearch} />
        <div className="space-y-3">
          {filtered.map((doc) => (
            <div key={doc.id || (doc as any)._id} className="card-medical cursor-pointer" onClick={() => navigate(`/doctors/${doc.id || (doc as any)._id}`)}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center"><span className="text-primary font-bold">{doc.fullName.split(' ').map(n => n[0]).join('')}</span></div>
                <div className="flex-1"><h3 className="font-semibold">{doc.fullName}</h3><p className="text-sm text-primary">{doc.specialization || 'General'}</p></div>
                <p className="text-lg font-bold text-primary">{patients.filter(p => p.assignedDoctorId === doc.id || p.assignedDoctorId === (doc as any)._id).length}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}