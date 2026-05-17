import { ChevronRight, Phone, Mail, Star } from 'lucide-react';
import { Avatar } from './Avatar';

interface UserCardProps {
  id: string;
  name: string;
  role?: string;
  subtitle?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  rating?: number;
  showActions?: boolean;
  onClick?: () => void;
  variant?: 'list' | 'grid';
}

export function UserCard({
  name,
  role,
  subtitle,
  avatar,
  email,
  phone,
  rating,
  showActions = false,
  onClick,
  variant = 'list',
}: UserCardProps) {
  if (variant === 'grid') {
    return (
      <div 
        className="user-card-grid animate-fade-in group"
        onClick={onClick}
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
          <Avatar src={avatar} name={name} size="md" />
        </div>
        
        <div className="flex-1 min-w-0 w-full">
          <h3 className="font-bold text-foreground line-clamp-1 text-sm md:text-base mb-1">{name}</h3>
          <div className="flex flex-col md:items-center">
            {role && (
              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider w-fit">
                {role}
              </span>
            )}
            {subtitle && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1 hidden md:block">{subtitle}</p>
            )}
          </div>
        </div>

        {rating !== undefined && (
          <div className="flex items-center gap-0.5 mt-1 bg-warning/10 px-2 py-0.5 rounded-full shrink-0 md:mt-2">
            <Star size={10} className="text-warning fill-warning" />
            <span className="text-[10px] font-bold text-warning">{rating}.0</span>
          </div>
        )}

        {/* Intelligent Right Section (Fills empty space on mobile) */}
        <div className="flex flex-row items-center gap-3 shrink-0">
          {!phone && !email && subtitle && (
            <div className="md:hidden flex flex-col items-end">
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter line-clamp-1 max-w-[100px]">{subtitle}</p>
              <ChevronRight size={14} className="text-primary/30 mt-1" />
            </div>
          )}

          {(phone || email) && (
            <div className="flex flex-row gap-2 md:mt-2">
              {phone && (
                <a 
                  href={`tel:${phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors border border-primary/10"
                  title={`Call ${name}`}
                >
                  <Phone size={14} />
                </a>
              )}
              {email && (
                <a 
                  href={`mailto:${email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-secondary/5 text-secondary hover:bg-secondary/10 transition-colors border border-secondary/10"
                  title={`Email ${name}`}
                >
                  <Mail size={14} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity md:hidden lg:flex">
          <div className="p-1 rounded-full bg-primary/10 text-primary">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="user-card animate-fade-in"
      onClick={onClick}
    >
      <Avatar src={avatar} name={name} size="md" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        {role && (
          <span className="badge-primary inline-block mt-1">{role}</span>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>
        )}
        
        {rating !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={star <= rating ? 'text-warning fill-warning' : 'text-muted-foreground'}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        {showActions && (
          <div className="flex gap-2">
            {phone && (
              <button className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Phone size={16} />
              </button>
            )}
            {email && (
              <button className="p-2 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors">
                <Mail size={16} />
              </button>
            )}
          </div>
        )}
        {onClick && (
          <ChevronRight size={20} className="text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
