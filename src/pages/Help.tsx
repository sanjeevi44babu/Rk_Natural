import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, HelpCircle, BookOpen, MessageCircle, Shield, Users, Calendar, QrCode, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

const faqData = [
  {
    category: 'Getting Started',
    icon: BookOpen,
    questions: [
      { q: 'How do I register as a patient?', a: 'Click "Register as Patient" on the login page. Fill in your details including name, email, phone, and date of birth. You\'ll receive a unique patient ID automatically.' },
      { q: 'How do staff members get access?', a: 'Staff accounts (Doctor, Supervisor, Therapist) are created by the Admin. Contact your hospital administrator to get your login credentials.' },
      { q: 'What are the different user roles?', a: 'NatureCure HMS supports 5 roles: Admin (system management), Supervisor (facility logistics), Doctor (patient care), Therapist (treatment sessions), and Patient (personal health view).' },
    ],
  },
  {
    category: 'Patient Management',
    icon: Users,
    questions: [
      { q: 'How does the Patient ID system work?', a: 'Every patient receives an auto-generated unique ID (e.g., PAT-XXXX-XXX) upon registration. This ID is embedded in a QR code for quick identification.' },
      { q: 'How do I scan a patient QR code?', a: 'Navigate to "Scan Patient" from the dashboard. You can either scan the QR tag or manually enter the Patient ID to view their details.' },
      { q: 'Who can print QR tags?', a: 'Only Admin and Supervisor roles can print patient QR tags. Doctors can view and scan them but cannot print.' },
    ],
  },
  {
    category: 'Appointments',
    icon: Calendar,
    questions: [
      { q: 'How do supervisors schedule appointments?', a: 'Supervisors can book therapy appointments by selecting a therapist from the availability list on their dashboard, or through the "Book Appointment" action.' },
      { q: 'How do therapists complete sessions?', a: 'Therapists see their assigned sessions on the dashboard. Click the "Complete" button to mark a session as done. This automatically creates a health record.' },
      { q: 'Can doctors cancel appointments?', a: 'Yes, doctors can cancel upcoming appointments from the appointment detail page or from the patient\'s appointment history.' },
    ],
  },
  {
    category: 'Notifications',
    icon: Bell,
    questions: [
      { q: 'What notifications will I receive?', a: 'You\'ll receive notifications for: new patient admissions, treatment completions, appointment updates, patient discharges, and new registrations.' },
      { q: 'How do I manage notifications?', a: 'Click the bell icon on your dashboard to view notifications. You can mark individual ones as read, mark all as read, or clear all notifications.' },
    ],
  },
  {
    category: 'Security & Privacy',
    icon: Shield,
    questions: [
      { q: 'Is my data secure?', a: 'Yes! NatureCure HMS uses industry-standard encryption and role-based access control. Only authorized personnel can access patient records.' },
      { q: 'Can admin view medical records?', a: 'Admins have read-only access to patient details for oversight purposes. They cannot modify medical records, prescriptions, or treatment plans.' },
    ],
  },
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (key: string) => {
    setExpandedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredFaq = searchQuery
    ? faqData.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.questions.length > 0)
    : faqData;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <HelpCircle size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">Find answers to common questions</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search help articles..."
            className="input-medical pl-11"
          />
        </div>

        {/* FAQ Sections */}
        {filteredFaq.map((category) => (
          <div key={category.category} className="card-medical">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <category.icon size={20} className="text-primary" />
              {category.category}
            </h2>
            <div className="space-y-2">
              {category.questions.map((item, idx) => {
                const key = `${category.category}-${idx}`;
                const isOpen = expandedItems.includes(key);
                return (
                  <div key={key} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm font-medium pr-2">{item.q}</span>
                      {isOpen ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 text-sm text-muted-foreground animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact Support */}
        <div className="card-medical text-center bg-primary/5 border-primary/20">
          <MessageCircle size={32} className="mx-auto text-primary mb-2" />
          <h3 className="font-bold">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-3">Our support team is ready to assist you</p>
          <Button onClick={() => navigate('/contact')} className="btn-primary">
            Contact Support
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
