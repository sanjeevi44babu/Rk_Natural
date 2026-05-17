import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, QrCode, User, Phone, Droplets, Activity, Heart, Stethoscope, FileText, Printer, ShieldAlert } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function ScanPatient() {
  const navigate = useNavigate();
  const { patients, healthRecords, appointments } = useData();
  const { user } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [foundPatient, setFoundPatient] = useState<typeof patients[0] | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const isDoctor = user?.role === 'doctor';
  const canPrint = user?.role === 'admin' || user?.role === 'supervisor';

  const triggerSearch = (idToSearch: string) => {
    if (!idToSearch.trim()) {
      toast.error('Please enter a Patient ID');
      return;
    }
    const normalizedSearch = idToSearch.trim().toLowerCase().replace(/-/g, '');
    const patient = patients.find(p =>
      p.id.toLowerCase().replace(/-/g, '') === normalizedSearch ||
      p.id.toLowerCase() === normalizedSearch ||
      p.id.toUpperCase() === idToSearch.trim().toUpperCase()
    );
    if (patient) {
      setFoundPatient(patient);
      setScanned(true);
      setShowCamera(false); // Hide camera upon success
      toast.success('Patient found!');
    } else {
      setFoundPatient(null);
      setScanned(true);
      toast.error('No patient found with this ID');
    }
  };

  const handleSearch = () => {
    triggerSearch(searchId);
  };

  const handleQRScanResult = (result: any) => {
    if (!result) return;
    
    // Safely extract string depending on library version returns
    const text: string = Array.isArray(result) ? result[0].rawValue : result.text || result;

    if (text) {
      try {
        const data = JSON.parse(text);
        if (data && data.patientId) {
          setSearchId(data.patientId.toUpperCase());
          triggerSearch(data.patientId);
        } else {
          setSearchId(text.toUpperCase());
          triggerSearch(text);
        }
      } catch (e) {
        setSearchId(text.toUpperCase());
        triggerSearch(text);
      }
    }
  };
  const patientRecords = foundPatient ? healthRecords.filter(r => r.patientId === foundPatient.id) : [];
  const patientAppointments = foundPatient ? appointments.filter(a => a.patientId === foundPatient.id) : [];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Scan Patient</h1>
          <p className="text-muted-foreground">Scan QR tag or enter Patient ID to get details</p>
        </div>

        {/* QR Scanner */}
        <div className="card-medical text-center">
          {showCamera ? (
            <div className="max-w-md mx-auto overflow-hidden rounded-2xl mb-4 border-4 border-primary/30">
              <Scanner 
                onScan={(result) => handleQRScanResult(result)}
                onError={(err) => console.log('Scanner error:', err)}
                constraints={{ facingMode: 'environment' }}
              />
              <Button onClick={() => setShowCamera(false)} variant="outline" className="mt-4 w-full">
                Cancel Scan
              </Button>
            </div>
          ) : (
            <>
              <div className="w-48 h-48 mx-auto rounded-2xl border-4 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 mb-4">
                <div className="text-center">
                  <QrCode size={48} className="mx-auto text-primary/50 mb-2" />
                  <p className="text-xs text-muted-foreground">Point camera at QR code</p>
                </div>
              </div>
              <Button onClick={() => setShowCamera(true)} className="btn-primary">
                <QrCode size={18} className="mr-2" />
                Start Camera Scan
              </Button>
            </>
          )}
        </div>

        {/* Manual Search */}
        <div className="card-medical">
          <h3 className="font-semibold mb-3">Or Enter Patient ID</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter Patient ID (e.g., P1, PAT-xxx)"
                className="input-medical pl-11"
              />
            </div>
            <Button onClick={handleSearch} className="btn-primary px-6">
              <Search size={18} />
            </Button>
          </div>
        </div>

        {/* Result */}
        {scanned && foundPatient && (
          <div className="space-y-4 animate-fade-in">
            {/* Patient ID Card */}
            <div className="card-medical bg-primary/5 border-primary/20">
              <div className="flex items-center gap-4">
                <QRCodeSVG value={JSON.stringify({ patientId: foundPatient.id })} size={64} level="M" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="text-xl font-bold font-mono text-primary">{foundPatient.id.toUpperCase()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  foundPatient.status === 'admitted' ? 'bg-success/10 text-success' :
                  foundPatient.status === 'discharged' ? 'bg-muted text-muted-foreground' :
                  'bg-secondary/10 text-secondary'
                }`}>
                  {foundPatient.status}
                </span>
              </div>
            </div>

            {/* Basic Details */}
            <div className="card-medical">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-primary font-bold text-xl">
                    {foundPatient.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{foundPatient.fullName}</h2>
                  <p className="text-muted-foreground">{foundPatient.age} years • {foundPatient.gender}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-accent rounded-xl">
                  <Phone size={16} className="text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{foundPatient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                  <Droplets size={16} className="text-destructive" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Blood Group</p>
                    <p className="text-sm font-bold text-destructive">{foundPatient.bloodType || 'N/A'}</p>
                  </div>
                </div>
                {foundPatient.weight && (
                  <div className="flex items-center gap-2 p-3 bg-accent rounded-xl">
                    <Activity size={16} className="text-secondary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Weight</p>
                      <p className="text-sm font-medium">{foundPatient.weight} kg</p>
                    </div>
                  </div>
                )}
                {foundPatient.height && (
                  <div className="flex items-center gap-2 p-3 bg-accent rounded-xl">
                    <User size={16} className="text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Height</p>
                      <p className="text-sm font-medium">{foundPatient.height} cm</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Info */}
            {(foundPatient.diagnosis || foundPatient.roomNumber || foundPatient.assignedDoctorName) && (
              <div className="card-medical">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope size={16} className="text-primary" />
                  Medical Info
                </h3>
                <div className="space-y-2">
                  {foundPatient.diagnosis && (
                    <div className="p-3 bg-warning/5 rounded-xl border border-warning/10">
                      <p className="text-xs text-muted-foreground">Diagnosis</p>
                      <p className="font-medium">{foundPatient.diagnosis}</p>
                    </div>
                  )}
                  {foundPatient.roomNumber && (
                    <div className="p-3 bg-accent rounded-xl">
                      <p className="text-xs text-muted-foreground">Room / Bed</p>
                      <p className="font-medium text-primary">
                        {foundPatient.blockName} - Room {foundPatient.roomNumber}, Bed {foundPatient.bedNumber}
                      </p>
                    </div>
                  )}
                  {foundPatient.assignedDoctorName && (
                    <div className="p-3 bg-accent rounded-xl">
                      <p className="text-xs text-muted-foreground">Assigned Doctor</p>
                      <p className="font-medium">{foundPatient.assignedDoctorName}</p>
                    </div>
                  )}
                  {foundPatient.assignedPhysiotherapistName && (
                    <div className="p-3 bg-accent rounded-xl">
                      <p className="text-xs text-muted-foreground">Assigned Therapist</p>
                      <p className="font-medium">{foundPatient.assignedPhysiotherapistName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vitals */}
            {(foundPatient.bloodPressure || foundPatient.temperature) && (
              <div className="card-medical">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart size={16} className="text-destructive" />
                  Vitals
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {foundPatient.bloodPressure && (
                    <div className="text-center p-2 bg-accent rounded-xl">
                      <p className="text-lg font-bold text-primary">{foundPatient.bloodPressure}</p>
                      <p className="text-[10px] text-muted-foreground">BP</p>
                    </div>
                  )}
                  {foundPatient.temperature && (
                    <div className="text-center p-2 bg-accent rounded-xl">
                      <p className="text-lg font-bold text-warning">{foundPatient.temperature}°F</p>
                      <p className="text-[10px] text-muted-foreground">Temp</p>
                    </div>
                  )}
                  {foundPatient.weight && foundPatient.height && (
                    <div className="text-center p-2 bg-accent rounded-xl">
                      <p className="text-lg font-bold text-success">
                        {(foundPatient.weight / ((foundPatient.height / 100) ** 2)).toFixed(1)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">BMI</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Health Records - visible to doctors */}
            {isDoctor && patientRecords.length > 0 && (
              <div className="card-medical">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-success" />
                  Health Records ({patientRecords.length})
                </h3>
                <div className="space-y-2">
                  {patientRecords.map((record) => (
                    <div key={record.id} className="p-3 bg-accent rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-primary">{record.date}</span>
                        <span className="text-xs text-muted-foreground">{record.doctorName || record.physiotherapistName}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {record.bloodPressure && <span className="text-xs bg-background px-2 py-0.5 rounded">BP: {record.bloodPressure}</span>}
                        {record.temperature && <span className="text-xs bg-background px-2 py-0.5 rounded">Temp: {record.temperature}°F</span>}
                        {record.heartRate && <span className="text-xs bg-background px-2 py-0.5 rounded">HR: {record.heartRate}</span>}
                        {record.weight && <span className="text-xs bg-background px-2 py-0.5 rounded">{record.weight} kg</span>}
                      </div>
                      {record.diagnosis && <p className="text-xs text-foreground mt-1 font-medium">{record.diagnosis}</p>}
                      {record.notes && <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>}
                      {record.prescription && (
                        <p className="text-xs text-primary mt-1">💊 {record.prescription}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appointment History - visible to doctors */}
            {isDoctor && patientAppointments.length > 0 && (
              <div className="card-medical">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope size={16} className="text-secondary" />
                  Appointments ({patientAppointments.length})
                </h3>
                <div className="space-y-2">
                  {patientAppointments.map((apt) => (
                    <div key={apt.id} className="p-3 bg-accent rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{apt.date} • {apt.time}</p>
                        <p className="text-xs text-muted-foreground">{apt.type} • {apt.doctorName || apt.physiotherapistName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        apt.status === 'completed' ? 'bg-success/10 text-success' :
                        apt.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                        'bg-destructive/10 text-destructive'
                      }`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 btn-primary" onClick={() => navigate(`/patients/${foundPatient.id}`)}>
                View Full Details
              </Button>
              {canPrint ? (
                <Button variant="outline" className="flex-1" onClick={() => navigate(`/patients/${foundPatient.id}/qr-tag`)}>
                  <Printer size={16} className="mr-2" />
                  Print QR Tag
                </Button>
              ) : (
                <Button variant="outline" className="flex-1" onClick={() => navigate(`/patients/${foundPatient.id}/qr-tag`)}>
                  <QrCode size={16} className="mr-2" />
                  View QR Tag
                </Button>
              )}
            </div>
          </div>
        )}

        {scanned && !foundPatient && (
          <div className="card-medical text-center py-8 animate-fade-in">
            <User size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
            <h3 className="font-semibold text-lg mb-1">Patient Not Found</h3>
            <p className="text-muted-foreground text-sm">No patient found with ID: {searchId}</p>
            <p className="text-xs text-muted-foreground mt-2">Please check the ID and try again</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}