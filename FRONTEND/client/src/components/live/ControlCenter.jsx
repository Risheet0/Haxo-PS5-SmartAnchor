import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Hourglass,
  SkipForward,
  AlertTriangle,
  Tv,
  Sliders,
  Monitor,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export default function ControlCenter({
  isTimerRunning = true,
  currentActivity,
  hasNextSession = false,
  connected = true,
  isUpdatingStatus = false,
  onToggleTimer,
  onResetTimer,
  onAdjustDuration,
  onNextSession,
  onOpenDelay,
  onOpenEmergency,
  onOpenTeleprompter,
  onOpenStageDisplay
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isDisabled = isUpdatingStatus || !currentActivity;

  return (
    <div
      role="region"
      aria-label="Live Stage Control Center"
      className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER ROW: CLEAR TITLE, SUBTITLE & SYSTEM READY STATUS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 flex-shrink-0">
            <Sliders className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900 font-mono">
                CONTROL CENTER
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live stage operations &amp; session controls
            </p>
          </div>
        </div>

        {/* System Ready Status Indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-700"
          title={connected ? 'System calibration & socket connection ready' : 'Socket disconnected'}
        >
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span>{connected ? 'System Ready' : 'Offline'}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. PRIMARY CONTROLS: SESSION TIMING, DURATION & ADVANCE
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
            PRIMARY CONTROLS
            <span className="text-slate-400 font-normal font-sans text-[11px] normal-case hidden sm:inline">
              • Essential controls for smooth session flow
            </span>
          </span>
        </div>

        {/* Responsive Primary Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-2.5">
          {/* STATE-DRIVEN PRIMARY CONTROL BUTTON (Featured - 3 cols on desktop) */}
          {(() => {
            const status = currentActivity?.status || 'LIVE';
            if (status === 'UPCOMING' || status === 'PREPARING') {
              return (
                <button
                  type="button"
                  onClick={onToggleTimer}
                  disabled={isDisabled}
                  className="col-span-2 sm:col-span-3 lg:col-span-3 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs tracking-wider transition active:scale-98 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Start session live"
                >
                  <Play className="w-4 h-4 fill-current flex-shrink-0" />
                  <span className="uppercase">START SESSION</span>
                </button>
              );
            }
            if (status === 'PAUSED') {
              return (
                <button
                  type="button"
                  onClick={onToggleTimer}
                  disabled={isDisabled}
                  className="col-span-2 sm:col-span-3 lg:col-span-3 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs tracking-wider transition active:scale-98 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Resume session timer"
                >
                  <Play className="w-4 h-4 fill-current flex-shrink-0" />
                  <span className="uppercase">RESUME TIMER</span>
                </button>
              );
            }
            if (status === 'COMPLETED') {
              return (
                <button
                  type="button"
                  onClick={onNextSession}
                  disabled={isDisabled}
                  className="col-span-2 sm:col-span-3 lg:col-span-3 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs tracking-wider transition active:scale-98 bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Advance to next session"
                >
                  <SkipForward className="w-4 h-4 flex-shrink-0" />
                  <span className="uppercase">ADVANCE SESSION</span>
                </button>
              );
            }
            // Default LIVE status
            return (
              <button
                type="button"
                onClick={onToggleTimer}
                disabled={isDisabled}
                className="col-span-2 sm:col-span-3 lg:col-span-3 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs tracking-wider transition active:scale-98 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                aria-label="Pause session timer"
              >
                <Pause className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="uppercase">PAUSE TIMER</span>
              </button>
            );
          })()}

          {/* RESET TIMER (1.5 cols on desktop) */}
          <button
            type="button"
            onClick={onResetTimer}
            disabled={isDisabled}
            className="col-span-1 sm:col-span-1 lg:col-span-2 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 shadow-sm"
            title="Reset session timer to 00:00"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span>RESET</span>
          </button>

          {/* -1 MIN (1.5 cols on desktop) */}
          <button
            type="button"
            onClick={() => onAdjustDuration && onAdjustDuration(-1)}
            disabled={isDisabled}
            className="col-span-1 sm:col-span-1 lg:col-span-2 flex items-center justify-center gap-1 px-3 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-mono font-bold text-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 shadow-sm"
            title="Reduce session duration by 1 minute"
            aria-label="Reduce duration by 1 minute"
          >
            <Minus className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span>-1 MIN</span>
          </button>

          {/* +1 MIN (1.5 cols on desktop) */}
          <button
            type="button"
            onClick={() => onAdjustDuration && onAdjustDuration(1)}
            disabled={isDisabled}
            className="col-span-1 sm:col-span-1 lg:col-span-2 flex items-center justify-center gap-1 px-3 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-mono font-bold text-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 shadow-sm"
            title="Extend session duration by 1 minute"
            aria-label="Extend duration by 1 minute"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span>+1 MIN</span>
          </button>

          {/* +5 MIN (1.5 cols on desktop) */}
          <button
            type="button"
            onClick={() => onAdjustDuration && onAdjustDuration(5)}
            disabled={isDisabled}
            className="col-span-1 sm:col-span-1 lg:col-span-1 flex items-center justify-center gap-1 px-2.5 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 font-mono font-bold text-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 shadow-sm"
            title="Extend session duration by 5 minutes"
            aria-label="Extend duration by 5 minutes"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span>+5 MIN</span>
          </button>

          {/* NEXT SESSION (2 cols on desktop) */}
          <button
            type="button"
            onClick={onNextSession}
            disabled={isDisabled}
            className="col-span-2 sm:col-span-2 lg:col-span-2 flex flex-col items-center justify-center py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 shadow-sm"
            aria-label="Advance to next session"
          >
            <div className="flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <span>NEXT SESSION</span>
              <SkipForward className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            </div>
            <span className="text-[10px] font-normal text-slate-400 normal-case hidden sm:inline">
              Continue / advance
            </span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SECONDARY CONTROLS: EQUAL-WIDTH TOOL CARDS WITH DESCRIPTIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
            SECONDARY CONTROLS
            <span className="text-slate-400 font-normal font-sans text-[11px] normal-case hidden sm:inline">
              • Additional tools for better management
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* + DELAY SESSION */}
          <button
            type="button"
            onClick={() => onOpenDelay && onOpenDelay({ targetActivityId: currentActivity?.id })}
            disabled={isDisabled}
            className="p-3 rounded-xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200 text-left transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 shadow-sm flex items-center gap-3"
            aria-label="Open delay session settings"
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 flex-shrink-0">
              <Hourglass className="w-4 h-4 text-amber-700" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold font-mono text-amber-950 uppercase block truncate">
                + DELAY SESSION
              </span>
              <span className="text-[11px] text-amber-800 font-medium block truncate mt-0.5">
                Open delay settings
              </span>
            </div>
          </button>

          {/* TELEPROMPTER */}
          <button
            type="button"
            onClick={onOpenTeleprompter}
            disabled={isDisabled}
            className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 shadow-sm flex items-center gap-3"
            aria-label="Open stage teleprompter modal"
          >
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 flex-shrink-0">
              <Tv className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold font-mono text-slate-900 uppercase block truncate">
                TELEPROMPTER
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate mt-0.5">
                Open teleprompter
              </span>
            </div>
          </button>

          {/* STAGE DISPLAY */}
          <button
            type="button"
            onClick={onOpenStageDisplay}
            disabled={isDisabled}
            className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40 shadow-sm flex items-center gap-3"
            aria-label="Open stage display confidence monitor modal"
          >
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 flex-shrink-0">
              <Monitor className="w-4 h-4 text-slate-700" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold font-mono text-slate-900 uppercase block truncate">
                STAGE DISPLAY
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate mt-0.5">
                Open projector display
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CRITICAL ACTION AREA: EMERGENCY BROADCAST
          ───────────────────────────────────────────────────────────── */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
          CRITICAL ACTION
        </span>

        <button
          type="button"
          onClick={onOpenEmergency}
          className="w-full p-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm flex items-center justify-between gap-3 text-left"
          aria-label="Broadcast emergency announcement modal"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-red-700 text-white flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider block truncate">
                ⚠ EMERGENCY BROADCAST
              </span>
              <span className="text-xs text-red-100 font-medium block truncate mt-0.5">
                Send emergency announcement
              </span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-red-200 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
