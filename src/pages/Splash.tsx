import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function Splash() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (isAuthenticated && user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white" />
        <div className="absolute bottom-40 right-10 w-24 h-24 rounded-full bg-white" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white" />
      </div>

      {/* Logo and content */}
      <div className="relative z-10 animate-scale-in">
        <div className="flex flex-col items-center gap-6">
          <div className="w-28 h-28 bg-white/20 rounded-3xl flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-12 h-12 text-primary"
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity="0.1"/>
                <path d="M17 12c0 1.5-1.5 3-3 4s-3 1.5-3 3" strokeLinecap="round"/>
                <path d="M7 12c0-1.5 1.5-3 3-4s3-1.5 3-3" strokeLinecap="round"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              NatureCure HMS
            </h1>
            <p className="text-white/80 text-sm">
              Healthcare Management System
            </p>
          </div>

          {isLoading && (
            <div className="mt-8">
              <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-pulse-soft w-1/2" 
                  style={{
                    animation: 'loading 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 50%; margin-left: 25%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
