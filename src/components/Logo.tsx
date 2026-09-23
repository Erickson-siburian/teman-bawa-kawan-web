import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  const dimensionClass =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'md'
      ? 'w-11 h-11'
      : size === 'lg'
      ? 'w-14 h-14'
      : size === 'xl'
      ? 'w-20 h-20'
      : 'w-28 h-28';

  if (imgError) {
    return (
      <div className={`relative ${dimensionClass} shrink-0 select-none ${className}`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full rounded-full shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="sunburstGrad" cx="50%" cy="38%" r="52%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
            <filter id="badgeShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#091427" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Concentric rings */}
          <circle cx="100" cy="100" r="98" fill="#0f172a" />
          <circle cx="100" cy="100" r="93" fill="#ea580c" />
          <circle cx="100" cy="100" r="88" fill="#1e293b" />
          <circle cx="100" cy="100" r="83" fill="url(#sunburstGrad)" />

          {/* Radial Sunburst rays */}
          <g opacity="0.4" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round">
            <line x1="100" y1="90" x2="30" y2="40" />
            <line x1="100" y1="90" x2="52" y2="24" />
            <line x1="100" y1="90" x2="80" y2="18" />
            <line x1="100" y1="90" x2="100" y2="16" />
            <line x1="100" y1="90" x2="120" y2="18" />
            <line x1="100" y1="90" x2="148" y2="24" />
            <line x1="100" y1="90" x2="170" y2="40" />
          </g>

          {/* Silhouette of Two Friends (arms over shoulders looking toward sunrise) */}
          <g fill="#0f172a">
            {/* Friend 1 (Left - Cap) */}
            <circle cx="78" cy="66" r="16" />
            <path d="M 58 68 Q 76 62 92 66 L 94 70 Q 76 66 58 72 Z" fill="#091427" />
            <path d="M 58 82 Q 78 70 98 82 L 96 122 L 56 122 Z" />

            {/* Friend 2 (Right - Hair) */}
            <circle cx="122" cy="68" r="15" />
            <path d="M 102 82 Q 120 70 142 82 L 140 122 L 100 122 Z" />

            {/* Orange Arm embracing */}
            <path
              d="M 78 82 Q 102 74 128 78 Q 124 86 102 84 Q 82 86 78 82 Z"
              fill="#f97316"
            />
          </g>

          {/* Ribbon typography container */}
          <path
            d="M 20 124 Q 100 108 180 124 L 176 178 Q 100 160 24 178 Z"
            fill="#0f172a"
            filter="url(#badgeShadow)"
          />

          {/* Orange brush swipe underline */}
          <path
            d="M 38 171 Q 100 155 162 171"
            stroke="#ea580c"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Typography */}
          <text
            x="100"
            y="131"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
            fontWeight="900"
            fontSize="26"
            letterSpacing="-0.5"
          >
            Teman
          </text>
          <text
            x="100"
            y="146"
            textAnchor="middle"
            fill="#fbbf24"
            fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
            fontWeight="800"
            fontSize="13"
            letterSpacing="2"
          >
            - bawa -
          </text>
          <text
            x="100"
            y="169"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
            fontWeight="900"
            fontSize="28"
            letterSpacing="-0.5"
          >
            Kawan
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${dimensionClass} shrink-0 select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Logo Teman Bawa Kawan"
        onError={() => setImgError(true)}
        className="w-full h-full rounded-full object-cover shadow-md ring-2 ring-amber-400/80 bg-slate-900"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: 'dark' | 'light';
  subtitle?: string;
  onClick?: () => void;
}

export const LogoBrand: React.FC<LogoBrandProps> = ({
  size = 'md',
  textColor = 'light',
  subtitle,
  onClick,
}) => {
  const isLight = textColor === 'light';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <Logo size={size} />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`font-black tracking-tight leading-tight ${
              size === 'sm'
                ? 'text-base sm:text-lg'
                : size === 'md'
                ? 'text-lg sm:text-xl'
                : size === 'lg'
                ? 'text-xl sm:text-2xl'
                : 'text-2xl sm:text-3xl'
            } ${isLight ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-emerald-700'} transition-colors`}
          >
            Teman <span className="text-amber-400 font-extrabold">bawa</span> Kawan
          </span>
        </div>
        {subtitle ? (
          <span
            className={`text-[11px] font-medium tracking-wide mt-0.5 ${
              isLight ? 'text-emerald-200/80' : 'text-slate-500'
            }`}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
};
