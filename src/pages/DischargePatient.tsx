import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, FileText, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

export default function DischargePatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, dischargePatient, healthRecords } = useData();
  
  const patient = patients.find(p => p.id === id);
  const patientRecords = healthRecords.filter(r => r.patientId === id);
  
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Patient not found</div>
      </DashboardLayout>
    );
  }

  const handleDischarge = async () => {
    if (!dischargeSummary) {
      toast.error('Please enter a discharge summary');
      return;
    }

    setIsLoading(true);
    
    dischargePatient(patient.id);

    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Patient discharged successfully!');
    navigate('/patients');
    setIsLoading(false);
  };

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

        {/* Patient Info */}
        <div className="card-medical mb-6">
          <div className="flex items-center gap-4">
            <Avatar name={patient.fullName} size="lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{patient.fullName}</h1>
              <p className="text-muted-foreground">{patient.age} years • {patient.gender}</p>
              {patient.roomNumber && (
                <p className="text-sm text-primary">Room {patient.roomNumber}, Bed {patient.bedNumber}</p>
              )}
            </div>
            <span className="badge-warning">{patient.status}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Discharge Patient</h2>

        {/* Admission Info */}
        <div className="card-medical mb-6">
          <h3 className="font-semibold mb-4">Admission Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Admission Date</p>
              <p className="font-medium">{patient.admissionDate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diagnosis</p>
              <p className="font-medium">{patient.diagnosis || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Doctor</p>
              <p className="font-medium">{patient.assignedDoctorName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Therapist</p>
              <p className="font-medium">{patient.assignedPhysiotherapistName || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Recent Health Records */}
        {patientRecords.length > 0 && (
          <div className="card-medical mb-6">
            <h3 className="font-semibold mb-4">Recent Health Records</h3>
            <div className="space-y-3">
              {patientRecords.slice(-3).map(record => (
                <div key={record.id} className="p-3 bg-accent rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{record.date}</span>
                    <span className="text-sm text-muted-foreground">
                      {record.doctorName || record.physiotherapistName}
                    </span>
                  </div>
                  {record.bloodPressure && <p className="text-sm">BP: {record.bloodPressure}</p>}
                  {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discharge Form */}
        <div className="card-medical space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Discharge Summary
          </h3>

          <div>
            <label className="block text-sm font-medium mb-2">Summary *</label>
            <textarea
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              rows={4}
              placeholder="Enter discharge summary, treatment provided, and recommendations..."
              className="input-medical resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="input-medical"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button 
            onClick={handleDischarge}
            className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
            disabled={isLoading}
          >
            <LogOut size={18} className="mr-2" />
            {isLoading ? 'Processing...' : 'Confirm Discharge'}
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
