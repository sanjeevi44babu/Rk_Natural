import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Thermometer, Weight, 
  Activity, ClipboardList, CheckCircle2, XCircle,
  Stethoscope, Save, AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

export default function HealthCheck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, addHealthRecord, updatePatient } = useData();
  const { addNotification } = useNotifications();

  const patient = patients.find(p => p.id === id);

  const [formData, setFormData] = useState({
    bloodPressure: '',
    temperature: '',
    weight: '',
    heartRate: '',
    notes: '',
    diagnosis: '',
    prescription: '',
    admit: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <AlertCircle size={40} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Patient not found</p>
          <Button onClick={() => navigate('/patients')} className="mt-4">Back to Patients</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const todayString = new Date().toISOString().split('T')[0];

      // 1. Save Health Record
      await addHealthRecord({
        patientId: (patient as any)._id || id, // Prioritize internal MongoDB _id
        doctorId: (user as any)?.id, 
        date: todayString,
        bloodPressure: formData.bloodPressure,
        temperature: formData.temperature ? Number(formData.temperature) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        notes: formData.notes,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription
      });

      // 2. Handle Admission Logic
      if (formData.admit) {
        await updatePatient(id!, { 
          status: 'admitted',
          admissionDate: todayString,
          diagnosis: formData.diagnosis || patient.diagnosis,
          prescription: formData.prescription || patient.prescription,
          notes: formData.notes || patient.notes
        });

        addNotification({
          title: 'Admission Required',
          message: `Dr. ${user?.fullName} has admitted ${patient.fullName}. Please allocate a room.`,
          type: 'warning',
          role: 'all',
        });
        toast.success(`${patient.fullName} has been admitted successfully!`);
      } else {
        // Just update diagnosis/notes without changing to admitted
        await updatePatient(id!, { 
          status: 'outpatient',
          diagnosis: formData.diagnosis || patient.diagnosis,
          prescription: formData.prescription || patient.prescription
        });
        toast.success("Health assessment saved as outpatient record.");
      }

      navigate(`/patients/${id}`);
    } catch (error) {
      console.error("Add health record error:", error);
      toast.error("Failed to save health assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Profile</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="text-primary" />
            Clinical Assessment
          </h1>
          <p className="text-muted-foreground">Patient: {patient.fullName} ({patient.id})</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vitals Section */}
          <div className="card-medical">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Vital Signs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Pressure</label>
                <div className="relative">
                  <Input 
                    placeholder="120/80" 
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                  />
                  <Heart className="absolute right-3 top-2.5 text-muted-foreground" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Temperature (°C)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="36.5" 
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  />
                  <Thermometer className="absolute right-3 top-2.5 text-muted-foreground" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Heart Rate (bpm)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="72" 
                    value={formData.heartRate}
                    onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                  />
                  <Activity className="absolute right-3 top-2.5 text-muted-foreground" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (kg)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="70" 
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                  <Weight className="absolute right-3 top-2.5 text-muted-foreground" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="card-medical">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-secondary" />
              Assessment & Prescription
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnosis</label>
                <Input 
                  placeholder="Primary diagnosis..." 
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prescription / Instructions</label>
                <Textarea 
                  placeholder="Medicine, dosage, etc..." 
                  className="min-h-[100px]"
                  value={formData.prescription}
                  onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Internal Notes</label>
                <Textarea 
                  placeholder="Confidential notes for staff..." 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Admission Decision */}
          <div className="card-medical border-2 border-primary/20 bg-primary/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Save size={18} className="text-primary" />
              Final Action
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, admit: true})}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  formData.admit 
                    ? 'border-primary bg-primary/20 shadow-inner' 
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  formData.admit ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <CheckCircle2 size={18} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Admit Patient</p>
                  <p className="text-xs text-muted-foreground tracking-tight">Requires room allocation</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, admit: false})}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  !formData.admit 
                    ? 'border-secondary bg-secondary/10 shadow-inner' 
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  !formData.admit ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <XCircle size={18} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Not Admit</p>
                  <p className="text-xs text-muted-foreground tracking-tight">Outpatient record only</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" className="px-8" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
