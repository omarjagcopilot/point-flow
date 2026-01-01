interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#logoGrad)" />
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fill="white"
          fontSize="40"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          P
        </text>
      </svg>
    </div>
  );
}
