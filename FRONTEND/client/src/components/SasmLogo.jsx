import React from 'react';

export default function SasmLogo({
  variant = 'default', // 'default' | 'compact' | 'light' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  onClick
}) {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-base', sub: 'text-[8px]', gap: 'gap-2' },
    md: { icon: 'w-8 h-8', text: 'text-xl', sub: 'text-[9px]', gap: 'gap-2.5' },
    lg: { icon: 'w-11 h-11', text: 'text-3xl', sub: 'text-[11px]', gap: 'gap-3.5' }
  }[size] || { icon: 'w-8 h-8', text: 'text-xl', sub: 'text-[9px]', gap: 'gap-2.5' };

  const isDark = variant === 'dark';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${sizeClasses.gap} select-none ${onClick ? 'cursor-pointer group' : ''}`}
    >
      {/* SASM Universal Event Emblem: Node Lattice & Stage Frame */}
      <div className={`relative ${sizeClasses.icon} flex items-center justify-center rounded-xl transition duration-200 ${
        isDark ? 'bg-white text-black' : 'bg-slate-900 text-white group-hover:bg-black'
      } shadow-xs`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 stroke-current"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Universal Stage/Pin Node Geometry */}
          <path d="M16 6C11.5817 6 8 9.58172 8 14C8 19.5 16 26 16 26C16 26 24 19.5 24 14C24 9.58172 20.4183 6 16 6Z" />
          <circle cx="16" cy="13" r="2.5" fill="currentColor" />
        </svg>
      </div>

      {/* SASM Wordmark & Tagline */}
      {variant !== 'compact' && (
        <div className="flex flex-col leading-none">
          <span className={`font-mono font-black tracking-tighter ${sizeClasses.text} ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            SASM
          </span>
          <span className={`font-mono font-bold uppercase tracking-widest ${sizeClasses.sub} ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            EVENT PLATFORM
          </span>
        </div>
      )}
    </div>
  );
}
