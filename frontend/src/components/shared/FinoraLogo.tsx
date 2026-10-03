import React from 'react';

interface FinoraLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full' | 'symbol';
  className?: string;
  showTagline?: boolean;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', icon: 24, text: 'text-sm', sub: 'text-[9px]' },
  sm: { box: 'w-8 h-8', icon: 32, text: 'text-base', sub: 'text-[10px]' },
  md: { box: 'w-10 h-10', icon: 40, text: 'text-xl', sub: 'text-xs' },
  lg: { box: 'w-12 h-12', icon: 48, text: 'text-2xl', sub: 'text-xs' },
  xl: { box: 'w-16 h-16', icon: 64, text: 'text-3xl', sub: 'text-sm' },
};

export const FinoraIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      <defs>
        {/* Background rounded container gradient */}
        <linearGradient id="finora-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1C1917" />
          <stop offset="50%" stopColor="#292524" />
          <stop offset="100%" stopColor="#18181B" />
        </linearGradient>

        {/* Primary Rich Gold Gradient */}
        <linearGradient id="finora-gold-primary" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="25%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Secondary Accent Gradient */}
        <linearGradient id="finora-gold-accent" x1="16" y1="12" x2="38" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Soft Inner Glow Filter */}
        <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Squircle Rounded Icon Tile */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="11"
        fill="url(#finora-bg)"
        stroke="#44403C"
        strokeWidth="1"
      />
      {/* Subtle border highlight */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="10"
        fill="none"
        stroke="#B45309"
        strokeOpacity="0.25"
        strokeWidth="0.75"
      />

      {/* Main F Monogram Geometric Vectors */}
      {/* 1. Vertical Spine Pillar */}
      <path
        d="M14 12C14 10.8954 14.8954 10 16 10H18C19.1046 10 20 10.8954 20 12V36C20 37.1046 19.1046 38 18 38H16C14.8954 38 14 37.1046 14 36V12Z"
        fill="url(#finora-gold-primary)"
      />

      {/* 2. Top Crossbeam with Angled Growth Facet */}
      <path
        d="M18 10H32.5C33.6046 10 34.3458 11.082 33.9856 12.1246L32.2572 17.1246C32.0039 17.8573 31.3149 18.35 30.5398 18.35H20V10H18Z"
        fill="url(#finora-gold-accent)"
      />

      {/* 3. Middle Dynamic Growth Arrow / Beam */}
      <path
        d="M20 22.5H27C27.9157 22.5 28.7412 23.1234 28.9881 24.0065L29.9881 27.5865C30.3444 28.8617 29.3877 30.08 28.0645 30.08H20V22.5Z"
        fill="url(#finora-gold-primary)"
      />

      {/* 4. Ascending Sparkle / Wealth Diamond at Top Right */}
      <path
        d="M33.5 8L34.6 10.9L37.5 12L34.6 13.1L33.5 16L32.4 13.1L29.5 12L32.4 10.9L33.5 8Z"
        fill="#FEF3C7"
        filter="url(#gold-glow)"
      />
    </svg>
  );
};

export const FinoraLogo: React.FC<FinoraLogoProps> = ({
  size = 'sm',
  variant = 'full',
  className = '',
  showTagline = true,
}) => {
  const cfg = SIZE_MAP[size];

  if (variant === 'icon') {
    return <FinoraIcon size={cfg.icon} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <FinoraIcon size={cfg.icon} />
      {variant === 'full' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-serif font-bold tracking-tight text-[#1C1917] ${cfg.text}`}>
              Finora
            </span>
          </div>
          {showTagline && (
            <span className={`font-sans font-semibold tracking-wider uppercase text-[#78716C] -mt-0.5 ${cfg.sub}`}>
              Personal Finance Suite
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FinoraLogo;
