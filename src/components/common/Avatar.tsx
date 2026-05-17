import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
}

export function Avatar({ src, name, size = 'md', showStatus = false, isOnline = false }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 40,
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  const initials = (name || 'U')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full bg-primary-light border-2 border-card-border flex items-center justify-center overflow-hidden`}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-primary font-semibold text-sm">
            {initials || <User size={iconSizes[size]} className="text-primary" />}
          </span>
        )}
      </div>
      {showStatus && (
        <div 
          className={`absolute bottom-0 right-0 ${statusSizes[size]} rounded-full border-2 border-white ${
            isOnline ? 'bg-success' : 'bg-muted-foreground'
          }`}
        />
      )}
    </div>
  );
}
