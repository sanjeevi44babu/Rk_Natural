interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'white';
}

export function Logo({
  size = 'md',
  showText = true,
  variant = 'default',
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const bgClass =
    variant === 'white'
      ? 'bg-white/20 border-white/30'
      : 'bg-primary/10 border-primary/30';

  const textClass =
    variant === 'white' ? 'text-white' : 'text-foreground';

  const subTextClass =
    variant === 'white' ? 'text-white/80' : 'text-muted-foreground';

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Logo Container */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-2xl
          ${bgClass}
          border
          flex items-center justify-center
          shadow-lg
          backdrop-blur-sm
        `}
      >
        <img
          src="/logo.png"
          alt="NatureCure Logo"
          className="w-full h-full object-contain p-2"
          draggable={false}
        />
      </div>

      {showText && (
        <div className="text-center leading-tight">
          <h1 className={`${textSizes[size]} font-bold ${textClass}`}>
            NatureCure HMS
          </h1>
          <p className={`text-xs ${subTextClass}`}>
            Healthcare Management System
          </p>
        </div>
      )}
    </div>
  );
}