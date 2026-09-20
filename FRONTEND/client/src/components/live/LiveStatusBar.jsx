import React from 'react';
import {
  Radio,
  Pause,
  Clock,
  Hourglass,
  Wifi,
  WifiOff,
  User,
  Tv,
  CheckCircle2,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { formatTimer } from '../../utils/formatters';

export default function LiveStatusBar({
  event,
  currentActivity,
  activeSessionIndex = 0,
  totalSessionsCount = 1,
  elapsedSecs = 0,
  totalDurationSecs = 0,
  isTimerRunning = true,
  connected = true,
  onOpenStageDisplay,
  onOpenDelay
}) {
  const eventName = event?.name || 'SmartStage Live Event';
  const sessionNumberStr = `SESSION ${String((currentActivity?.order_index || activeSessionIndex + 1)).padStart(2, '0')} / ${String(totalSessionsCount).padStart(2, '0')}`;
  const sessionTitle = currentActivity?.title || 'No Active Session';
  const durationMins = currentActivity?.duration_minutes || Math.round(totalDurationSecs / 60) || 30;

  const isOvertime = elapsedSecs > totalDurationSecs && totalDurationSecs > 0;
  const remainingSecs = Math.max(0, totalDurationSecs - elapsedSecs);
  const overtimeSecs = isOvertime ? elapsedSecs - totalDurationSecs : 0;

  // Determine Live Status (LIVE, PAUSED, OVERTIME, UPCOMING, COMPLETED)
  const getLiveStatus = () => {
    const rawStatus = currentActivity?.status || 'LIVE';
    if (rawStatus === 'COMPLETED') {
      return {
        label: 'COMPLETED',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
        dotClass: 'bg-emerald-500'
      };
    }
    if (rawStatus === 'UPCOMING') {
      return {
        label: 'UPCOMING',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: Clock,
        dotClass: 'bg-indigo-500'
      };
    }
    if (isOvertime) {
      return {
        label: 'OVERTIME',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        icon: AlertTriangle,
        dotClass: 'bg-red-500 animate-ping'
      };
    }
    if (!isTimerRunning && rawStatus === 'LIVE') {
      return {
        label: 'PAUSED',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Pause,
        dotClass: 'bg-amber-500'
      };
    }
    return {
      label: 'LIVE',
      badgeBg: 'bg-red-50 text-red-600 border-red-200',
      icon: Radio,
      dotClass: 'bg-red-500 animate-ping'
    };
  };

  const liveStatus = getLiveStatus();
  const StatusIcon = liveStatus.icon;

  // Determine Schedule Status (ON SCHEDULE, +X MIN DELAY, OVERTIME)
  const currentDelay = event?.current_delay_minutes || 0;
  const getScheduleStatus = () => {
    if (isOvertime) {
      return {
        label: `OVERTIME (+${formatTimer(overtimeSecs)})`,
        colorClass: 'text-red-600 bg-red-50 border-red-200'
      };
    }
    if (currentDelay > 0) {
      return {
        label: `+${currentDelay} MIN DELAY`,
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    }
    return {
      label: 'ON SCHEDULE',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    };
  };

  const scheduleStatus = getScheduleStatus();

  // Speaker info
  const speakerName = currentActivity?.speaker_name;
  const speakerOrg = [currentActivity?.speaker_designation, currentActivity?.speaker_org].filter(Boolean).join(' • ');

  return (
    <div
      role="region"
      aria-label="Live Event Operational Status Bar"
      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 select-none"
    >
      {/* TOP ROW: Current Event & Connection Status & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 text-xs">
        {/* Event Name */}
        <div className="flex items-center gap-2 font-semibold text-slate-800 truncate">
          <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span className="truncate uppercase tracking-wider font-mono text-[11px] sm:text-xs">
            {eventName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-50 border border-slate-200 text-slate-600"
            title={connected ? 'Real-time WebSocket active' : 'Disconnected from server'}
            aria-label={connected ? 'Socket Connected' : 'Socket Disconnected'}
          >
            {connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3 h-3 text-emerald-600" />
                <span className="font-bold text-slate-800">SOCKET CONNECTED</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <WifiOff className="w-3 h-3 text-red-500" />
                <span className="font-bold text-red-600">DISCONNECTED</span>
              </>
            )}
          </div>

          {/* Quick Action Controls preserved from top bar */}
          <div className="flex items-center gap-1.5">
            {onOpenStageDisplay && (
              <button
                onClick={onOpenStageDisplay}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition shadow-sm"
                title="Open Stage Display Confidence Monitor HUD"
                aria-label="Open Confidence Monitor HUD"
              >
                <Tv className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Confidence HUD</span>
              </button>
            )}

            {onOpenDelay && (
              <button
                onClick={() => onOpenDelay({ targetActivityId: currentActivity?.id })}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition active:scale-95 shadow-sm"
                aria-label="Add 10 minute delay"
              >
                <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                <span>+10m Delay</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN OPERATIONS CONSOLE GRID: Live Status, Session, Speaker, Timers, Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

        {/* SECTION 1: LIVE STATUS & SESSION INFO */}
        <div className="md:col-span-6 lg:col-span-5 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${liveStatus.badgeBg}`}
              aria-label={`Live Status: ${liveStatus.label}`}
            >
              <span className={`w-2 h-2 rounded-full ${liveStatus.dotClass}`} />
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{liveStatus.label}</span>
            </span>

            {/* Session Number */}
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {sessionNumberStr}
            </span>
          </div>

          {/* Activity / Session Title */}
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-1">
            {sessionTitle}
          </h2>

          {/* Speaker Info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-semibold text-slate-900 truncate">
              {speakerName || 'Emcee / Stage Anchor'}
            </span>
            {speakerOrg && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 truncate">{speakerOrg}</span>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: TIMER TELEMETRY & SCHEDULE STATUS */}
        <div className="md:col-span-6 lg:col-span-7 flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">

          {/* TIMER METRICS PANEL */}
          <div className="flex items-center gap-3 sm:gap-4 font-mono text-center bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
            {/* Elapsed */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                ELAPSED
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900">
                {formatTimer(elapsedSecs)}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Remaining */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                REMAINING
              </span>
              <span className={`text-sm sm:text-base font-black ${isOvertime ? 'text-red-600' : 'text-indigo-600'}`}>
                {isOvertime ? `-${formatTimer(overtimeSecs)}` : formatTimer(remainingSecs)}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Scheduled Duration */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                DURATION
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-700">
                {durationMins} MIN
              </span>
            </div>
          </div>

          {/* SCHEDULE STATUS CHIP */}
          <div className="flex items-center">
            <span
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${scheduleStatus.colorClass}`}
              title="Schedule Status"
              aria-label={`Schedule status: ${scheduleStatus.label}`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{scheduleStatus.label}</span>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
