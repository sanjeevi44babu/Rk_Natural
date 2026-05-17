import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addPatient } = useData();
  const { addNotification } = useNotifications();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);

    try {
      // 1️⃣ Call backend signup (now also creates Patient record)
      await signup(formData);

      // 2️⃣ Send notification
      await addNotification({
        title: 'New Patient Registered',
        message: `${formData.fullName} has registered as a new patient`,
        type: 'info',
        role: 'all',
      });

      toast.success('Patient account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-center">
          <Logo size="lg" variant="white" />
          <p className="mt-8 text-white/80 max-w-md mx-auto">
            Register as a patient to access your health records, appointments, and more.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="md" />
          </div>

          <h2 className="text-2xl font-bold text-primary mb-2">
            Patient Registration
          </h2>
          <p className="text-muted-foreground mb-6">
            Create your patient account to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input icon={<User size={18} />} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" />
            <Input icon={<Mail size={18} />} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" />
            <Input icon={<Phone size={18} />} name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile Number" />
            <Input icon={<Calendar size={18} />} name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-medical pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register as Patient'}
            </Button>

            <p className="text-center text-sm mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input {...props} className="input-medical pl-11 w-full" required />
    </div>
  );
}