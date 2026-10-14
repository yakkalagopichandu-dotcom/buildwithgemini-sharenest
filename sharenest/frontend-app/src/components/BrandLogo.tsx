import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  tagline?: string;
  useImage?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  tagline,
  useImage = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Brand Logo Mark */}
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform hover:scale-105 duration-200`}>
        {useImage ? (
          <img
            src="/brand_logo.png"
            alt="ShareNest Logo"
            className="w-full h-full object-contain filter drop-shadow-sm rounded-full"
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-md"
          >
            <defs>
              <radialGradient id="blGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#047857" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="blNestOuter" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="blNestInner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="blWingLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="blWingRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="blGrainGold" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <filter id="blShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#064e3b" floodOpacity="0.25" />
              </filter>
            </defs>

            <circle cx="100" cy="100" r="92" fill="url(#blGlow)" />
            <circle cx="100" cy="100" r="88" stroke="#059669" strokeWidth="2.5" strokeDasharray="8 6" strokeOpacity="0.35" />

            <g filter="url(#blShadow)">
              <path d="M 40 120 C 40 162 160 162 160 120 C 145 152 55 152 40 120 Z" fill="url(#blNestInner)" />
              <path d="M 32 112 C 48 166 152 166 168 112 C 150 156 50 156 32 112 Z" fill="url(#blNestOuter)" />
              <path d="M 45 128 Q 100 160 155 128" stroke="#fef3c7" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.6" />
              <path d="M 56 138 Q 100 165 144 138" stroke="#fef3c7" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4" />
            </g>

            <g filter="url(#blShadow)">
              <path d="M 100 118 C 88 110 50 96 46 64 C 44 46 60 36 74 42 C 86 48 94 66 100 80 Z" fill="url(#blWingLeft)" />
              <path d="M 100 118 C 112 110 150 96 154 64 C 156 46 140 36 126 42 C 114 48 106 66 100 80 Z" fill="url(#blWingRight)" />
              <path d="M 100 102 C 92 88 72 68 76 56 C 80 48 90 48 96 56 L 100 62 L 104 56 C 110 48 120 48 124 56 C 128 68 108 88 100 102 Z" fill="#ffffff" fillOpacity="0.95" />
            </g>

            <path d="M 100 96 Q 100 70 100 58" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <path d="M 100 82 C 94 80 88 74 91 66 C 94 65 99 72 100 78 Z" fill="url(#blGrainGold)" />
            <path d="M 100 74 C 106 72 112 66 109 58 C 106 57 101 64 100 70 Z" fill="url(#blGrainGold)" />
            <circle cx="100" cy="52" r="5" fill="#fbbf24" />
            <path d="M 100 42 L 101.5 48.5 L 108 50 L 101.5 51.5 L 100 58 L 98.5 51.5 L 92 50 L 98.5 48.5 Z" fill="#f59e0b" />
          </svg>
        )}
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
              Share<span className="text-emerald-700">Nest</span>
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              India
            </span>
          </div>
          {tagline && <p className="text-[11px] font-medium text-slate-500 hidden sm:block">{tagline}</p>}
        </div>
      )}
    </div>
  );
};
