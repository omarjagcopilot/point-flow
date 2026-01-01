interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
}

export function Logo({ className = '', size = 'md', variant = 'full' }: LogoProps) {
  const sizes = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20',
    xl: 'h-32'
  };

  const CardSvg = () => (
    <svg
      className={sizes[size] + ' transition-transform duration-300'}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="eliteCard" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="40%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        
        <linearGradient id="glassShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        
        <linearGradient id="flowElite1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.3" />
        </linearGradient>
        
        <linearGradient id="flowElite2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.3" />
        </linearGradient>
        
        <linearGradient id="flowElite3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F472B6" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0.3" />
        </linearGradient>
        
        <filter id="eliteDepth" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
          <feOffset dx="0" dy="10" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <filter id="velocityBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2,0.5" />
        </filter>
        
        <filter id="innerGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
          <feComposite in="SourceGraphic" in2="blurred" operator="over"/>
        </filter>
      </defs>
      
      <g filter="url(#eliteDepth)">
        <rect x="55" y="30" width="130" height="180" rx="22" fill="url(#eliteCard)" />
        <rect x="55" y="30" width="130" height="180" rx="22" fill="url(#glassShimmer)" />
        <rect x="60" y="35" width="120" height="170" rx="18" fill="none" stroke="white" strokeWidth="1.5" opacity="0.15" />
        <path d="M 70 45 L 75 45 L 75 50" stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
        <path d="M 170 45 L 165 45 L 165 50" stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
        <path d="M 70 195 L 75 195 L 75 190" stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
        <path d="M 170 195 L 165 195 L 165 190" stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
      </g>
      
      <g filter="url(#velocityBlur)">
        <path className="flow-line" d="M 75 80 Q 120 68, 165 80" stroke="url(#flowElite1)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path className="flow-line" d="M 75 120 Q 120 108, 165 120" stroke="url(#flowElite2)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path className="flow-line" d="M 75 160 Q 120 148, 165 160" stroke="url(#flowElite3)" strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>
      
      <g className="center-badge">
        <circle cx="120" cy="120" r="26" fill="white" opacity="0.08" filter="url(#innerGlow)"/>
        <circle cx="120" cy="120" r="22" fill="white" filter="url(#eliteDepth)"/>
      </g>
      
      <g opacity="0.8">
        <circle cx="112" cy="112" r="3" fill="#1E40AF"/>
        <circle cx="128" cy="112" r="3" fill="#4C1D95"/>
        <circle cx="112" cy="128" r="3" fill="#5B21B6"/>
        <circle cx="128" cy="128" r="3" fill="#7C3AED"/>
      </g>
      
      <g className="team-card opacity-0">
        <rect x="25" y="90" width="22" height="32" rx="3" fill="white" filter="url(#eliteDepth)"/>
        <text x="36" y="109" fontSize="14" fontWeight="bold" fill="#1E40AF" textAnchor="middle">5</text>
      </g>
      
      <g className="team-card opacity-0">
        <rect x="193" y="90" width="22" height="32" rx="3" fill="white" filter="url(#eliteDepth)"/>
        <text x="204" y="109" fontSize="14" fontWeight="bold" fill="#5B21B6" textAnchor="middle">8</text>
      </g>
      
      <g className="team-card opacity-0">
        <rect x="40" y="45" width="22" height="32" rx="3" fill="white" filter="url(#eliteDepth)"/>
        <text x="51" y="64" fontSize="14" fontWeight="bold" fill="#7C3AED" textAnchor="middle">3</text>
      </g>
      
      <g className="team-card opacity-0">
        <rect x="178" y="45" width="22" height="32" rx="3" fill="white" filter="url(#eliteDepth)"/>
        <text x="189" y="64" fontSize="14" fontWeight="bold" fill="#EC4899" textAnchor="middle">5</text>
      </g>
      
      <g className="team-card opacity-0">
        <rect x="109" y="25" width="22" height="32" rx="3" fill="white" filter="url(#eliteDepth)"/>
        <text x="120" y="44" fontSize="14" fontWeight="bold" fill="#4C1D95" textAnchor="middle">8</text>
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={'logo-group relative inline-block ' + className}>
        <CardSvg />
      </div>
    );
  }

  return (
    <div className={'flex items-center gap-2 ' + className}>
      <div className="logo-group relative inline-block">
        <CardSvg />
      </div>

      <div className="flex flex-col leading-none">
        <span className={'font-semibold tracking-tight bg-gradient-to-r from-blue-800 via-purple-700 to-violet-800 dark:from-blue-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent ' + (
          size === 'sm' ? 'text-xl' : 
          size === 'md' ? 'text-3xl' : 
          size === 'lg' ? 'text-5xl' : 
          'text-6xl'
        )}>
          PointFlow
        </span>
        {size !== 'sm' && (
          <span className={'font-medium text-gray-500 dark:text-gray-400 tracking-[0.25em] uppercase ' + (
            size === 'md' ? 'text-[0.55rem] mt-1' : 
            size === 'lg' ? 'text-[0.6rem] mt-1.5' : 
            'text-xs mt-2'
          )}>
            Planning Poker
          </span>
        )}
      </div>
    </div>
  );
}
