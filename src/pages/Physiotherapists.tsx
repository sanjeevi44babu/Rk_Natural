import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Physiotherapists() {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const navigate = useNavigate();
  const { users, patients } = useData();
  const { user } = useAuth();

  const therapists = users.filter(u => u.role === 'physiotherapist' && u.isApproved);
  
  const filtered = therapists.filter(t => {
    const matchesSearch = t.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === 'all' || t.gender?.toLowerCase() === genderFilter;
    return matchesSearch && matchesGender;
  });

  const maleCount = therapists.filter(t => t.gender?.toLowerCase() === 'male').length;
  const femaleCount = therapists.filter(t => t.gender?.toLowerCase() === 'female').length;

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No therapists found to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Gender', 'Role', 'Created Date', 'Created Time', 'Specialization'];
    const csvRows = filtered.map(t => {
      const createdAt = t.createdAt ? new Date(t.createdAt) : new Date();
      return [
        `"${t.fullName}"`,
        `"${t.email}"`,
        `"${t.phone || 'N/A'}"`,
        `"${t.gender || 'N/A'}"`,
        `"${t.role}"`,
        `"${createdAt.toLocaleDateString()}"`,
        `"${createdAt.toLocaleTimeString()}"`,
        `"${t.specialization || 'General'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NatureCure_Therapists_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Therapist list exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold truncate">Physiotherapists</h1>
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
                onClick={() => navigate('/users/create-staff?role=physiotherapist')}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm h-auto"
              >
                <UserPlus size={14} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden xs:inline">Create Therapist</span>
                <span className="xs:hidden">Create</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <SearchBar placeholder="Search..." value={search} onChange={setSearch} />
          
          {/* Gender Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                genderFilter === 'all' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-secondary/10 text-muted-foreground hover:bg-secondary/20'
              }`}
            >
              All ({therapists.length})
            </button>
            <button
              onClick={() => setGenderFilter('male')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                genderFilter === 'male' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
              }`}
            >
              Male ({maleCount})
            </button>
            <button
              onClick={() => setGenderFilter('female')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                genderFilter === 'female' 
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' 
                : 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20'
              }`}
            >
              Female ({femaleCount})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-accent/20 rounded-2xl border border-dashed">
              <p>No {genderFilter !== 'all' ? genderFilter : ''} therapists found</p>
            </div>
          ) : (
            filtered.map((t) => (
              <div 
                key={t.id || (t as any)._id} 
                className="user-card cursor-pointer group" 
                onClick={() => navigate(`/physiotherapists/${t.id || (t as any)._id}`)}
              >
                <div className="avatar-wrapper group-hover:scale-105 transition-transform">
                  <span className="text-primary font-bold">
                    {t.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground truncate">{t.fullName}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter ${
                      t.gender?.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-600' : 
                      t.gender?.toLowerCase() === 'female' ? 'bg-pink-100 text-pink-600' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {t.gender || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium">{t.specialization || 'General'}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1 text-primary mb-0.5">
                    <Users size={14} />
                    <span className="text-base font-bold tabular-nums">
                      {patients.filter(p => p.assignedPhysiotherapistId === (t.id || (t as any)._id)).length}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Patients</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}