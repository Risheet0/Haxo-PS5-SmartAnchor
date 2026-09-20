import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { formatTimer } from '../../utils/formatters';

/**
 * Modern Soft-SaaS Live Timer Engine for Stage Operations
 */
export default function LiveTimerEngine({
  durationMinutes = 30,
  initialElapsedSeconds = 0,
  isRunning = true,
  onStateChange,
  onComplete,
  compact = false
}) {
  const [totalDurationSecs, setTotalDurationSecs] = useState(durationMinutes * 60);
  const [elapsedSecs, setElapsedSecs] = useState(initialElapsedSeconds);
  const [running, setRunning] = useState(isRunning);

  // Sync duration if prop changes
  useEffect(() => {
    setTotalDurationSecs(durationMinutes * 60);
  }, [durationMinutes]);

  // Main 1-second operational tick loop
  useEffect(() => {
    let interval = null;
    if (running) {
      interval = setInterval(() => {
        setElapsedSecs((prev) => {
          const next = prev + 1;
          if (next >= totalDurationSecs && prev < totalDurationSecs) {
            if (onComplete) onComplete();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running, totalDurationSecs, onComplete]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        elapsedSecs,
        remainingSecs: Math.max(0, totalDurationSecs - elapsedSecs),
        running,
        totalDurationSecs
      });
    }
  }, [elapsedSecs, running, totalDurationSecs, onStateChange]);

  const remainingSecs = Math.max(0, totalDurationSecs - elapsedSecs);
  const isOvertime = elapsedSecs > totalDurationSecs;
  const overtimeSecs = isOvertime ? elapsedSecs - totalDurationSecs : 0;
  const progressPercent = Math.min(100, Math.round((elapsedSecs / (totalDurationSecs || 1)) * 100));

  const getThresholdTier = () => {
    if (isOvertime || remainingSecs <= 60) return 'critical';
    if (remainingSecs <= 300) return 'warning';
    return 'normal';
  };

  const tier = getThresholdTier();

  const tierStyles = {
    normal: {
      remainingText: 'text-indigo-600',
      elapsedText: 'text-slate-800',
      badgeBg: 'bg-indigo-50',
      badgeBorder: 'border-indigo-100',
      badgeText: 'text-indigo-700',
      badgeLabel: 'ON SCHEDULE',
      progressBar: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    },
    warning: {
      remainingText: 'text-amber-600',
      elapsedText: 'text-amber-950',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-700',
      badgeLabel: 'TIME WARNING (≤ 5 MIN)',
      progressBar: 'bg-gradient-to-r from-amber-400 to-amber-500'
    },
    critical: {
      remainingText: 'text-red-600',
      elapsedText: 'text-red-950',
      badgeBg: 'bg-red-50',
      badgeBorder: 'border-red-200',
      badgeText: 'text-red-700',
      badgeLabel: isOvertime ? `OVERTIME (+${formatTimer(overtimeSecs)})` : 'FINAL MINUTE (WRAP UP)',
      progressBar: 'bg-gradient-to-r from-red-500 to-red-600'
    }
  }[tier];

  const handleTogglePlay = () => setRunning(!running);
  const handleReset = () => {
    setElapsedSecs(0);
    setRunning(false);
  };
  const handleExtend = (minutesToAdd) => {
    setTotalDurationSecs((prev) => prev + minutesToAdd * 60);
  };
  const handleReduce = (minutesToSubtract) => {
    setTotalDurationSecs((prev) => Math.max(60, prev - minutesToSubtract * 60));
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTimer(elapsedSecs)}</span>
        </div>
        <span className="text-slate-300">/</span>
        <div className={`font-bold ${tierStyles.remainingText}`}>
          {formatTimer(remainingSecs)} left
        </div>
      </div>
    );
  }

  // Circular Dial Mode inspired by Reference Image
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4 select-none flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 tracking-tight block">
            Time Tracker
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Allocated: {Math.round(totalDurationSecs / 60)} min
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tierStyles.badgeBg} ${tierStyles.badgeText} border ${tierStyles.badgeBorder}`}
        >
          {tierStyles.badgeLabel}
        </span>
      </div>

      {/* Circular Gauge Display */}
      <div className="flex flex-col items-center justify-center relative py-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* Background dashed circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="7"
              strokeDasharray="4 4"
              fill="transparent"
            />
            {/* Active progress arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={tier === 'critical' ? '#EF4444' : tier === 'warning' ? '#F59E0B' : '#3B82F6'}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Centered Digital Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
              {formatTimer(elapsedSecs)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              {running ? 'Stage Time' : 'Paused'}
            </span>
            <span className={`text-[10px] font-mono font-semibold mt-0.5 ${tierStyles.remainingText}`}>
              {isOvertime ? `+${formatTimer(overtimeSecs)}` : `${formatTimer(remainingSecs)} left`}
            </span>
          </div>
        </div>
      </div>

      {/* Timer Controls Toolbar */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        {/* Play/Pause & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`p-2.5 rounded-full text-xs font-semibold transition active:scale-95 shadow-sm ${
              running
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title={running ? 'Pause Timer' : 'Resume Timer'}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Adjustments */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => handleReduce(1)}
            className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[11px] transition"
          >
            -1m
          </button>
          <button
            onClick={() => handleExtend(1)}
            className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[11px] transition"
          >
            +1m
          </button>
          <button
            onClick={() => handleExtend(5)}
            className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] transition"
          >
            +5m
          </button>
        </div>
      </div>
    </div>
  );
}
