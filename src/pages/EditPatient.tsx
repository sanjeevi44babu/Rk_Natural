import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Stethoscope, FileText, Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Patient } from '@/types';
import { toast } from 'sonner';
import {
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import treatmentsData from '@/data/treatments.json';

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, updatePatient, users, addHealthRecord } = useData();
  const { user } = useAuth();

  const patient = patients.find(p => p.id === id || (p as any)._id === id);
  const therapists = users.filter(u => u.role === 'physiotherapist' && u.isApproved);

  const [formData, setFormData] = useState({
    fullName: patient?.fullName || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
    age: patient?.age?.toString() || '',
    gender: patient?.gender || 'male',
    address: patient?.address || '',
    bloodType: patient?.bloodType || '',
    weight: patient?.weight?.toString() || '',
    height: patient?.height?.toString() || '',
    bloodPressure: patient?.bloodPressure || '',
    temperature: patient?.temperature?.toString() || '',
    heartRate: patient?.heartRate?.toString() || '',
    oxygenSaturation: patient?.oxygenSaturation?.toString() || '',
    respiratoryRate: patient?.respiratoryRate?.toString() || '',
    bloodSugar: patient?.bloodSugar?.toString() || '',
    diagnosis: patient?.diagnosis || '',
    medicalHistory: patient?.medicalHistory || '',
    notes: patient?.notes || '',
    prescription: patient?.prescription || '',
    treatmentPlan: patient?.treatmentPlan || '',
    followUpDate: patient?.followUpDate || '',
    problem: (patient as any)?.problem || '',
    assignedPhysiotherapistId: patient?.assignedPhysiotherapistId || '',
  });

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Patient not found</div>
      </DashboardLayout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updateData: Partial<Patient> = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      age: parseInt(formData.age),
      gender: formData.gender as 'male' | 'female' | 'other',
      address: formData.address,
      bloodType: formData.bloodType,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      bloodPressure: formData.bloodPressure,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
      oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : undefined,
      respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
      bloodSugar: formData.bloodSugar ? parseInt(formData.bloodSugar) : undefined,
      diagnosis: formData.diagnosis,
      medicalHistory: formData.medicalHistory,
      notes: formData.notes,
      prescription: formData.prescription,
      treatmentPlan: formData.treatmentPlan,
      followUpDate: formData.followUpDate,
      problem: formData.problem,
      assignedPhysiotherapistId: formData.assignedPhysiotherapistId || undefined,
      assignedPhysiotherapistName: formData.assignedPhysiotherapistId,
    };

    await updatePatient(id!, updateData);

    // Also add a health record for history if vitals were updated
    if (formData.bloodPressure || formData.temperature || formData.heartRate) {
      addHealthRecord({
        patientId: id!,
        date: new Date().toISOString().split('T')[0],
        bloodPressure: formData.bloodPressure,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        notes: formData.notes || 'Updated via Edit Profile',
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        treatment: formData.assignedPhysiotherapistId,
        problem: formData.problem,
        doctorName: user?.fullName,
        doctorId: user?.id,
      });
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Patient information updated successfully!');
    navigate(`/patients/${id}`);
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 pb-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-6">Patient Consultation & Edit</h1>

        <form onSubmit={handleSubmit} className="space-y-6 pb-32">
          {/* Medical & Personal Information */}
          <div className="card-medical space-y-4">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Users size={18} />
              Medical & Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-medical"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-medical"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-medical"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-medical"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-medical"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-medical"
              />
            </div>

          </div>

          {/* Health Check & Vitals */}
          <div className="card-medical space-y-4 border-l-4 border-success/70">
            <h3 className="font-semibold text-success flex items-center gap-2">
              <Stethoscope size={18} />
              Vital Signs & Measurements
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Blood Pressure</label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                  placeholder="120/80"
                  className="input-medical"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="98.6"
                  className="input-medical"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="input-medical"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="170"
                  className="input-medical"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  placeholder="72"
                  className="input-medical"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Oxygen (%)</label>
                <input
                  type="number"
                  name="oxygenSaturation"
                  value={formData.oxygenSaturation}
                  onChange={handleChange}
                  placeholder="98"
                  className="input-medical"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Respiration</label>
                <input
                  type="number"
                  name="respiratoryRate"
                  value={formData.respiratoryRate}
                  onChange={handleChange}
                  placeholder="16"
                  className="input-medical"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Blood Sugar</label>
                <input
                  type="number"
                  name="bloodSugar"
                  value={formData.bloodSugar}
                  onChange={handleChange}
                  placeholder="100"
                  className="input-medical"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Blood Type</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="input-medical"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                {formData.weight && formData.height && (
                  <div className="flex flex-col justify-end">
                    <div className="p-2.5 bg-accent rounded-xl text-center border border-border">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground mr-2">BMI:</span>
                      <span className="font-bold text-primary">
                        {(parseFloat(formData.weight) / ((parseFloat(formData.height)/100) ** 2)).toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Medical Assessment Section */}
          <div className="card-medical space-y-4 border-l-4 border-primary">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <FileText size={18} />
              Medical Assessment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  placeholder="Enter diagnosis..."
                  className="input-medical font-bold text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Patient Problem</label>
                <textarea
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Note the patient problem..."
                  className="input-medical resize-none font-bold text-secondary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Additional observations..."
                    className="input-medical resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Prescription</label>
                  <textarea
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Prescribed medications and instructions..."
                    className="input-medical resize-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Treatment Plan</label>
                  <textarea
                    name="treatmentPlan"
                    value={formData.treatmentPlan}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Recommended treatment plan..."
                    className="input-medical resize-none"
                  />
                </div>

                {/* Assign Therapy / Treatment moved here */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Assign Therapy / Treatment</label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between input-medical h-11 bg-muted/30"
                      >
                        {formData.assignedPhysiotherapistId
                          ? treatmentsData.find((item) => item === formData.assignedPhysiotherapistId)
                          : "Select Treatment / Therapy..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[calc(100vw-2rem)] md:w-[500px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search therapy items..." />
                        <CommandList>
                          <CommandEmpty>No treatment found.</CommandEmpty>
                          <CommandGroup>
                            {treatmentsData.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    assignedPhysiotherapistId: currentValue === formData.assignedPhysiotherapistId ? "" : currentValue
                                  }));
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.assignedPhysiotherapistId === name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-4">
                   <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={formData.followUpDate}
                      onChange={handleChange}
                      className="input-medical"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Medical History</label>
                    <textarea
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Relevant past conditions..."
                      className="input-medical resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

  
          <div className="fixed bottom-[64px] sm:bottom-[80px] lg:bottom-0 left-0 right-0 p-4 lg:left-64 bg-background/80 backdrop-blur-sm border-t border-border z-40">
            <Button type="submit" className="w-full btn-primary h-12 shadow-lg max-w-2xl mx-auto block" disabled={isLoading}>
              <Save size={18} className="inline mr-2" />
              {isLoading ? 'Saving Changes...' : 'Save Patient Information'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
