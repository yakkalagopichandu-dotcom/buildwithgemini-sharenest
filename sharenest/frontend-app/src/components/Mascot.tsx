import React from 'react';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hasSpeechBubble?: boolean;
  bubbleText?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  size = 'md',
  className = '',
  hasSpeechBubble = false,
  bubbleText = 'How can I help you share or rescue today?',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      {/* Bird in Nest SVG */}
      <div className={`relative ${sizeClasses[size]} animate-mascot transition-transform hover:scale-110 duration-200 cursor-pointer`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          {/* Nest */}
          <ellipse cx="50" cy="74" rx="36" ry="18" fill="#d97706" />
          <path d="M16 72 Q50 94 84 72 Q50 82 16 72" fill="#b45309" />
          <path d="M22 68 Q50 86 78 68" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <path d="M28 75 Q50 88 72 75" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />

          {/* Bird Body */}
          <circle cx="50" cy="46" r="24" fill="#14b8a6" />
          {/* Belly */}
          <circle cx="52" cy="50" r="16" fill="#ccfbf1" />
          {/* Head Tuft */}
          <path d="M46 22 Q48 14 54 18 Q50 22 46 22" fill="#0d9488" />
          {/* Eyes */}
          <circle cx="43" cy="42" r="3.5" fill="#0f172a" />
          <circle cx="44" cy="41" r="1.2" fill="#ffffff" />
          <circle cx="57" cy="42" r="3.5" fill="#0f172a" />
          <circle cx="58" cy="41" r="1.2" fill="#ffffff" />
          {/* Beak */}
          <polygon points="46,47 54,47 50,54" fill="#f59e0b" />
          {/* Wings */}
          <ellipse cx="30" cy="48" rx="6" ry="10" fill="#0d9488" transform="rotate(-15 30 48)" />
          <ellipse cx="70" cy="48" rx="6" ry="10" fill="#0d9488" transform="rotate(15 70 48)" />
        </svg>
      </div>

      {hasSpeechBubble && (
        <div className="bg-white border border-teal-200 text-slate-800 text-xs px-3 py-1.5 rounded-2xl shadow-sm relative animate-fadeIn max-w-[200px]">
          <span className="font-semibold text-teal-700">ShareNest: </span>
          {bubbleText}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-teal-200 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};
