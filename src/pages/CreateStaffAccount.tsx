import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Shield, Copy, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { toast } from 'sonner';

// Generate a random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function CreateStaffAccount() {
  const navigate = useNavigate();
  const { addUser } = useData();
  const { user: currentUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role') as UserRole;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: generatePassword(),
    role: (queryRole || 'doctor') as UserRole,
    specialization: '',
    gender: 'male',
  });

  useEffect(() => {
    if (queryRole && ['doctor', 'supervisor', 'physiotherapist', 'frontdesk'].includes(queryRole)) {
      setFormData(prev => ({ ...prev, role: queryRole }));
    }
  }, [queryRole]);

  if (currentUser?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p className="text-destructive font-semibold">Access Denied</p>
          <p className="text-muted-foreground mt-2">Only admins can create staff accounts.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const regeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generatePassword() }));
    toast.success('New password generated');
  };

  const copyCredentials = () => {
    const text = `Staff Account Credentials\n\nName: ${formData.fullName}\nRole: ${formData.role}\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nPlease change your password after first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await addUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: formData.role,
        specialization: formData.specialization || undefined,
        gender: formData.gender,
      });

      setAccountCreated(true);
      toast.success(`${formData.role === 'physiotherapist' ? 'Therapist' : formData.role} account created successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create Staff Account</h1>
            <p className="text-muted-foreground">Create login credentials for doctors, supervisors, and therapists</p>
          </div>
        </div>

        {accountCreated ? (
          <div className="space-y-6 animate-fade-in">
            {/* Success Card */}
            <div className="card-medical bg-success/5 border-success/20 text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-success mb-2">Account Created!</h2>
              <p className="text-muted-foreground">Share these credentials with the staff member</p>
            </div>

            {/* Credentials Card */}
            <div className="card-medical border-2 border-primary/20">
              <h3 className="font-semibold mb-4">Login Credentials</h3>
              <div className="space-y-3 bg-accent p-4 rounded-xl font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-semibold capitalize">{formData.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-semibold">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <span className="font-semibold">{formData.password}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button onClick={copyCredentials} className="flex-1" variant="outline">
                  {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                  {copied ? 'Copied!' : 'Copy Credentials'}
                </Button>
                <Button onClick={() => window.print()} variant="outline" className="flex-1">
                  Print
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setAccountCreated(false);
                  setFormData({
                    fullName: '', email: '', phone: '', 
                    password: generatePassword(), role: 'doctor',
                    specialization: '',
                    gender: 'male',
                  });
                }} 
                className="flex-1 btn-primary"
              >
                Create Another Account
              </Button>
              <Button onClick={() => navigate('/users')} variant="outline" className="flex-1">
                View All Users
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            {!queryRole && (
              <div className="card-medical">
                <h3 className="font-semibold mb-4">Select Role</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['doctor', 'supervisor', 'physiotherapist', 'frontdesk'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role }))}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.role === role 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <p className="font-semibold capitalize text-sm">
                        {role === 'physiotherapist' ? 'Therapist' : role}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {queryRole && (
              <div className="card-medical bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <p className="font-medium">
                    Creating <span className="capitalize font-bold">{queryRole === 'physiotherapist' ? 'Therapist' : queryRole}</span> Account
                  </p>
                </div>
              </div>
            )}
            {/* Personal Details */}
            <div className="card-medical space-y-4">
              <h3 className="font-semibold">Personal Details</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="input-medical pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="staff@naturecure.com"
                    className="input-medical pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className="input-medical pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-medical"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {(formData.role === 'doctor' || formData.role === 'physiotherapist') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Cardiologist, Sports Therapy"
                    className="input-medical"
                  />
                </div>
              )}
            </div>

            {/* Password */}
            <div className="card-medical space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Login Password</h3>
                <Button type="button" variant="outline" size="sm" onClick={regeneratePassword}>
                  Regenerate
                </Button>
              </div>
              
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-medical pl-11 pr-11 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-generated password. You can edit or regenerate it. Share securely with the staff member.
              </p>
            </div>

            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : `Create ${formData.role === 'physiotherapist' ? 'Therapist' : formData.role} Account`}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
