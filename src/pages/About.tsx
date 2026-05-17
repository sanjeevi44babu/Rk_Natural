import { ArrowLeft, Heart, Shield, Users, Award, Globe, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function About() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">NatureCure HMS</h1>
          <p className="text-muted-foreground mt-2">Healthcare Management System</p>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
        </div>

        <div className="card-medical">
          <h2 className="text-lg font-bold mb-3">About Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            NatureCure HMS is a comprehensive healthcare management system designed to streamline 
            hospital operations, patient care, and medical staff coordination. Our platform connects 
            doctors, supervisors, therapists, and patients in one unified system.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Shield, label: 'Secure', desc: 'HIPAA compliant data protection' },
            { icon: Users, label: 'Multi-Role', desc: '5 user roles supported' },
            { icon: Award, label: 'Reliable', desc: '99.9% uptime guarantee' },
            { icon: Globe, label: 'Accessible', desc: 'Works on all devices' },
          ].map((item) => (
            <div key={item.label} className="card-medical text-center">
              <item.icon size={24} className="mx-auto text-primary mb-2" />
              <h3 className="font-semibold text-sm">{item.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="card-medical">
          <h2 className="text-lg font-bold mb-3">Key Features</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'Patient registration with auto-generated IDs & QR tags',
              'Doctor & therapist scheduling and appointment management',
              'Real-time health monitoring and vitals tracking',
              'Room & bed management with block allocation',
              'Prescription & treatment history management',
              'Multi-role dashboards with role-based access',
              'Real-time notifications across all user roles',
              'QR code scanning for quick patient lookup',
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-medical text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 NatureCure HMS. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Built with ❤️ for better healthcare
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
