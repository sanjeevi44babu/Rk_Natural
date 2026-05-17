import { useState } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground">Get in touch with our support team</p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Phone, label: 'Phone', value: '+1 (800) 123-4567', desc: '24/7 Support Line' },
            { icon: Mail, label: 'Email', value: 'support@naturecure.com', desc: 'Response within 24hrs' },
            { icon: MapPin, label: 'Address', value: '123 Healthcare Ave, Medical District', desc: 'New York, NY 10001' },
            { icon: Clock, label: 'Working Hours', value: 'Mon - Fri: 8AM - 8PM', desc: 'Sat: 9AM - 5PM' },
          ].map((item) => (
            <div key={item.label} className="card-medical">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{item.label}</h3>
                  <p className="text-sm font-medium">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="card-medical">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" />
            Send us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="input-medical" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" className="input-medical" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input type="text" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} placeholder="How can we help?" className="input-medical" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message *</label>
              <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="Describe your issue or question..." rows={4} className="input-medical resize-none" required />
            </div>
            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
              <Send size={18} className="mr-2" />
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
