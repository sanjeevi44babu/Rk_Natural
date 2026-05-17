import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Download, RefreshCcw, ArrowLeft, Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function RegistrationReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, patients, fetchAllData } = useData();
  const [search, setSearch] = useState('');
  const [reportDate, setReportDate] = useState('');

  const filteredAppointments = (appointments || [])
    .filter(a => a.status !== 'cancelled')
    .filter(a => !reportDate || a.date === reportDate)
    .filter(a => {
      const matchesSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) ||
                           a.physiotherapistName.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleExportCSV = () => {
    if (filteredAppointments.length === 0) return;

    const headers = ['Patient Name', 'Therapist Name', 'Therapy Name', 'Time', 'Status'];
    const csvData = filteredAppointments.map(a => {
      const patient = (patients || []).find(p => (p.id || (p as any)._id) === a.patientId);
      return [
        a.patientName,
        a.physiotherapistName,
        patient?.treatmentPlan || 'Therapy Session',
        a.time,
        a.status.toUpperCase()
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Registration_Report_${reportDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Registration Report</h1>
              <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                <Calendar size={14} className="text-primary" />
                {reportDate ? new Date(reportDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'Complete History'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const id = toast.loading('Syncing data...');
                await fetchAllData();
                toast.success('Data synced', { id });
              }}
              className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-bold uppercase tracking-widest text-[10px]"
            >
              <RefreshCcw size={14} className="mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="rounded-xl border-secondary/20 bg-secondary/5 text-secondary hover:bg-secondary/10 font-bold uppercase tracking-widest text-[10px]"
            >
              <Download size={14} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <div className="card-medical p-1.5 md:p-2 w-full shadow-sm border-primary/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient or therapist name..."
                  className="pl-9 h-8 md:h-9 bg-transparent border-none focus-visible:ring-0 text-xs md:text-sm font-bold"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56 group">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
              <Input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="pl-9 h-10 md:h-11 bg-white border-primary/10 rounded-xl text-xs font-bold focus-visible:ring-primary shadow-sm hover:border-primary/30 transition-all cursor-pointer"
                style={{ colorScheme: 'initial' }}
              />
              {reportDate && (
                <button 
                  onClick={() => setReportDate('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                  title="Clear Date Filter"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card-medical p-4 flex flex-col items-center text-center bg-primary/5 border-primary/10">
            <Users size={20} className="text-primary mb-2" />
            <span className="text-lg font-black">{filteredAppointments.length}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Sessions</span>
          </div>
          <div className="card-medical p-4 flex flex-col items-center text-center bg-warning/5 border-warning/10">
            <Clock size={20} className="text-warning mb-2" />
            <span className="text-lg font-black">
              {filteredAppointments.filter(a => a.status === 'in-progress' || a.status === 'upcoming').length}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending</span>
          </div>
          <div className="card-medical p-4 flex flex-col items-center text-center bg-success/5 border-success/10">
            <CheckCircle2 size={20} className="text-success mb-2" />
            <span className="text-lg font-black">
              {filteredAppointments.filter(a => a.status === 'completed').length}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Completed</span>
          </div>
        </div>

        {/* Table View (Excel Format) */}
        <div className="card-medical overflow-hidden border-2 border-primary/10 shadow-md">
          <div className="overflow-x-auto md:overflow-x-hidden">
            <table className="w-full text-left border-collapse table-fixed md:table-auto">
              <thead>
                <tr className="bg-primary/5 border-b border-primary/10">
                  <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary w-[35%] md:w-auto">Patient / Staff</th>
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-widest text-primary hidden md:table-cell">Assigned Therapist</th>
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-widest text-primary hidden lg:table-cell">Therapy (Treatment)</th>
                  <th className="px-2 md:px-6 py-4 md:py-5 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary w-[25%] md:w-auto text-center md:text-left">Date / Time</th>
                  <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary text-right w-[40%] md:w-auto">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic font-medium">
                      {reportDate 
                        ? `No records found for ${new Date(reportDate).toLocaleDateString()}.`
                        : "No registration records found in history."}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const patient = (patients || []).find(p => (p.id || (p as any)._id) === apt.patientId);
                    return (
                      <tr 
                        key={apt.id || (apt as any)._id} 
                        className="hover:bg-accent/30 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/appointments/${apt.id || (apt as any)._id}`)}
                      >
                        <td className="px-3 md:px-6 py-4 md:py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                              {apt.patientName.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm md:text-base text-foreground truncate">{apt.patientName}</span>
                              <span className="text-[10px] md:hidden text-muted-foreground font-medium truncate">{apt.physiotherapistName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <span className="text-sm font-semibold text-foreground/80">{apt.physiotherapistName}</span>
                        </td>
                        <td className="px-6 py-5 hidden lg:table-cell">
                          <div className="p-2 bg-accent/20 rounded-lg border border-accent/10 max-w-[200px]">
                            <p className="text-xs font-bold text-muted-foreground line-clamp-1" title={patient?.treatmentPlan}>
                              {patient?.treatmentPlan || 'Standard Therapy Session'}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 md:px-6 py-4 md:py-5 text-center md:text-left">
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-black text-foreground">{apt.time}</span>
                            <span className="text-[10px] md:text-xs font-bold text-primary/70">{new Date(apt.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 md:py-5 text-right">
                          <span className={`px-2 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${
                            apt.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                            apt.status === 'in-progress' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
