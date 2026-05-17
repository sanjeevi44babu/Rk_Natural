import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  variant?: 'default' | 'primary' | 'secondary';
  onClick?: () => void;
}

export function StatCard({ icon: Icon, value, label, variant = 'default', onClick }: StatCardProps) {
  const variantClasses = {
    default: 'bg-card border-card-border text-foreground',
    primary: 'bg-primary/10 border-primary/20 text-primary',
    secondary: 'bg-secondary/10 border-secondary/20 text-secondary',
  };

  return (
    <div 
      className={`card-stat border ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <Icon size={24} className={variant === 'default' ? 'text-primary' : ''} />
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}
