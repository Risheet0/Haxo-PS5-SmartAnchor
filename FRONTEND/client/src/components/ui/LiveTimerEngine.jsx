import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { formatTimer } from '../../utils/formatters';

/**
 * Professional Stage Operations Live Timer Engine
 * Supports countdown, elapsed tracking, pause/resume, reset, extend/reduce,
 * and three-tier semantic color thresholding (Normal -> Warning -> Critical).
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

  // Sync running state if isRunning prop changes
  useEffect(() => {
    setRunning(isRunning);
  }, [isRunning]);

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

  // Threshold calculation:
  // Normal: > 5 mins (300s) remaining
  // Warning: <= 5 mins and > 1 min (60s)
  // Critical: <= 1 min (60s) or Overtime
  const getThresholdTier = () => {
    if (isOvertime || remainingSecs <= 60) return 'critical';
    if (remainingSecs <= 300) return 'warning';
    return 'normal';
  };

  const tier = getThresholdTier();

  // Color mappings based on semantic threshold in light theme
  const tierStyles = {
    normal: {
      remainingText: 'text-indigo-600',
      elapsedText: 'text-slate-800',
      badgeBg: 'bg-indigo-50',
      badgeBorder: 'border-indigo-200',
      badgeText: 'text-indigo-700',
      badgeLabel: 'ON SCHEDULE',
      progressBar: 'bg-indigo-600'
    },
    warning: {
      remainingText: 'text-amber-700',
      elapsedText: 'text-amber-900',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-700',
      badgeLabel: 'TIME WARNING (≤ 5 MIN)',
      progressBar: 'bg-amber-500'
    },
    critical: {
      remainingText: 'text-red-600',
      elapsedText: 'text-red-900',
      badgeBg: 'bg-red-50',
      badgeBorder: 'border-red-200',
      badgeText: 'text-red-700',
      badgeLabel: isOvertime ? `OVERTIME (+${formatTimer(overtimeSecs)})` : 'FINAL MINUTE (WRAP UP)',
      progressBar: 'bg-red-600'
    }
  }[tier];

  // Actions
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
      <div className="flex items-center gap-3 font-mono">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTimer(elapsedSecs)}</span>
        </div>
        <span className="text-slate-300">/</span>
        <div className={`text-xs font-bold ${tierStyles.remainingText}`}>
          {formatTimer(remainingSecs)} remaining
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 select-none">
      {/* Tier Status Header */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${tierStyles.badgeBg} ${tierStyles.badgeText} border ${tierStyles.badgeBorder}`}
        >
          {tier === 'critical' ? (
            <AlertTriangle className="w-3 h-3 text-red-500" />
          ) : (
            <Clock className="w-3 h-3 text-indigo-600" />
          )}
          {tierStyles.badgeLabel}
        </span>

        <span className="text-xs font-mono text-slate-500">
          Allocated: {Math.round(totalDurationSecs / 60)} min
        </span>
      </div>

      {/* Dual Big Telemetry Display: Elapsed vs Remaining */}
      <div className="grid grid-cols-2 gap-3 font-mono text-center">
        {/* Elapsed Column */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Elapsed Time
          </span>
          <div className={`text-2xl sm:text-3xl font-black ${tierStyles.elapsedText} tracking-tight`}>
            {formatTimer(elapsedSecs)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {running ? 'Running' : 'Paused'}
          </span>
        </div>

        {/* Remaining Column */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Remaining
          </span>
          <div className={`text-2xl sm:text-3xl font-black ${tierStyles.remainingText} tracking-tight`}>
            {isOvertime ? `-${formatTimer(overtimeSecs)}` : formatTimer(remainingSecs)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {isOvertime ? 'Over schedule' : 'To wrap-up'}
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-slate-500">
          <span className="font-semibold uppercase text-[10px] tracking-wider">Session Progression</span>
          <span className={`font-bold ${tierStyles.remainingText}`}>{progressPercent}% Elapsed</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-100">
          <div
            className={`${tierStyles.progressBar} h-full rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Timer Controls Toolbar */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        {/* Primary Play / Pause & Reset */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 shadow-sm ${
              running
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{running ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition"
            title="Reset Timer to 00:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Extend / Reduce Quick Nudges */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => handleReduce(1)}
            className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold"
            title="Reduce 1 minute"
          >
            -1m
          </button>

          <button
            onClick={() => handleExtend(1)}
            className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold"
            title="Extend 1 minute"
          >
            +1m
          </button>

          <button
            onClick={() => handleExtend(5)}
            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold"
            title="Extend 5 minutes"
          >
            +5m
          </button>
        </div>
      </div>
    </div>
  );
}
