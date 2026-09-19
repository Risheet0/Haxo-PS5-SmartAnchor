import React from 'react';
import { Hourglass, CheckCircle2, Play, AlertCircle } from 'lucide-react';

/**
 * Standardized Semantic Status Badge for Stage Operations System
 * Semantic Colors:
 * - LIVE -> Red / Crimson with pinging dot
 * - COMPLETED / SUCCESS -> Green
 * - DELAYED / WARNING -> Amber
 * - UPCOMING / INFO -> Blue
 * - QUEUED / NEUTRAL -> Slate
 */
export default function StatusBadge({ status, delayMinutes = 0, size = 'md' }) {
  const normalizedStatus = (status || 'UPCOMING').toUpperCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-[11px]',
    lg: 'px-3.5 py-1 text-xs font-bold'
  }[size] || 'px-2.5 py-0.5 text-[11px]';

  switch (normalizedStatus) {
    case 'LIVE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 ${sizeClasses}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span>Live Now</span>
        </span>
      );

    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );

    case 'DELAYED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Hourglass className="w-3 h-3 text-amber-600" />
          <span>Delayed {delayMinutes > 0 ? `(+${delayMinutes}m)` : ''}</span>
        </span>
      );

    case 'SKIPPED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Skipped</span>
        </span>
      );

    case 'UPCOMING':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>Upcoming</span>
        </span>
      );
  }
}
