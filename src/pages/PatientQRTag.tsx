import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, ShieldAlert } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientQRTag() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients } = useData();
  const { user } = useAuth();

  const patient = (patients || []).find(p => p.id === id || (p as any)._id === id);
  const canPrint = true; // All staff can print QR tags

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Patient not found</div>
      </DashboardLayout>
    );
  }

  const qrData = JSON.stringify({
    patientId: patient.id,
    name: patient.fullName,
    age: patient.age,
    gender: patient.gender,
    bloodType: patient.bloodType,
    phone: patient.phone,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        <div className="no-print">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold mb-6">Patient ID Tag</h1>
        </div>

        {/* Printable Tag */}
        <div className="max-w-md mx-auto">
          <div className="card-medical border-2 border-primary/30 p-6 print-area" id="patient-tag">
            <div className="text-center border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-primary">NatureCure Hospital</h2>
              <p className="text-xs text-muted-foreground">Patient Identification Tag</p>
            </div>

            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-xl border border-border">
                <QRCodeSVG value={qrData} size={180} level="H" includeMargin={true} />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-xl font-bold">{patient.fullName}</h3>
              <p className="text-sm font-mono font-bold text-primary">{patient.id.toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="bg-accent p-2 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-semibold">{patient.age} yrs</p>
              </div>
              <div className="bg-accent p-2 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-semibold capitalize">{patient.gender}</p>
              </div>
              <div className="bg-accent p-2 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Blood Type</p>
                <p className="font-semibold">{patient.bloodType || 'N/A'}</p>
              </div>
              <div className="bg-accent p-2 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-semibold text-xs">{patient.phone}</p>
              </div>
            </div>

            {patient.roomNumber && (
              <div className="mt-4 p-2 bg-primary/5 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Room / Bed</p>
                <p className="font-semibold text-primary">
                  {patient.blockName} - Room {patient.roomNumber}, Bed {patient.bedNumber}
                </p>
              </div>
            )}

            {patient.diagnosis && (
              <div className="mt-3 p-2 bg-warning/5 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Diagnosis</p>
                <p className="font-semibold text-sm">{patient.diagnosis}</p>
              </div>
            )}

            {patient.assignedDoctorName && (
              <div className="mt-3 text-center text-xs text-muted-foreground">
                <p>Doctor: <strong>{patient.assignedDoctorName}</strong></p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border text-center">
              <p className="text-[10px] text-muted-foreground">
                Scan QR code to access patient details • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 no-print">
            <Button onClick={handlePrint} className="flex-1 btn-primary">
              <Printer size={18} className="mr-2" />
              Print A4
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate(`/patients/${id}`)}>
              View Details
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print, nav, header, aside, footer, .bottom-nav { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          main { margin: 0 !important; padding: 0 !important; }
          .print-area {
            border: 2px solid #2d7a45 !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 160mm !important;
            margin: 0 auto !important;
            padding: 10mm !important;
            border-radius: 8px !important;
            page-break-inside: avoid;
          }
          .print-a4-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 257mm;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}