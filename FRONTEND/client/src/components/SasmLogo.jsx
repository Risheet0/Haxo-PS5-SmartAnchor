import React from 'react';
import logoBlack from '../assets/sasm-logo.png';
import logoWhite from '../assets/sasm-logo-white.png';

export default function SasmLogo({
  variant = 'default', // 'default' | 'compact' | 'light' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  onClick,
  className = ''
}) {
  const sizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-11 sm:h-12'
  }[size] || 'h-8 sm:h-9';

  const isDark = variant === 'dark';
  const logoSrc = isDark ? logoWhite : logoBlack;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${
        onClick ? 'cursor-pointer group hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      <img
        src={logoSrc}
        alt="SASM Logo"
        className={`${sizeClasses} w-auto object-contain transition-transform duration-200 ${
          onClick ? 'group-hover:scale-[1.02]' : ''
        }`}
      />
    </div>
  );
}
