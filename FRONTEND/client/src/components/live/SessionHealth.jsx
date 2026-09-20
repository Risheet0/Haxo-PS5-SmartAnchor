import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Radio,
  Tv,
  Clock,
  FileText,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function SessionHealth({
  connected = true,
  isTimerRunning = false,
  elapsedSecs = 0,
  totalDurationSecs = 0,
  currentActivity = null,
  scriptText = '',
  isTeleprompterOpen = false,
  isStageDisplayOpen = false,
  onOpenTeleprompter,
  onOpenStageDisplay,
  onToggleTimer
}) {
  // Derive session overtime
  const isOvertime = elapsedSecs > totalDurationSecs && totalDurationSecs > 0 && currentActivity?.status === 'LIVE';

  // 1. SESSION TIMER HEALTH
  let timerStatus = 'READY';
  let timerHealthy = true;
  let timerDotClass = 'bg-emerald-500';
  if (isOvertime) {
    timerStatus = 'OVERTIME';
    timerHealthy = false;
    timerDotClass = 'bg-amber-500';
  } else if (isTimerRunning) {
    timerStatus = 'RUNNING';
    timerHealthy = true;
    timerDotClass = 'bg-emerald-500 animate-pulse';
  } else if (currentActivity?.status === 'PAUSED') {
    timerStatus = 'PAUSED';
    timerHealthy = false;
    timerDotClass = 'bg-amber-500';
  } else if (currentActivity?.status === 'COMPLETED') {
    timerStatus = 'COMPLETED';
    timerHealthy = true;
    timerDotClass = 'bg-slate-400';
  } else if (!currentActivity) {
    timerStatus = 'NOT ACTIVE';
    timerHealthy = false;
    timerDotClass = 'bg-slate-300';
  }

  // 2. REAL-TIME CONNECTION HEALTH
  const connectionStatus = connected ? 'CONNECTED' : 'DISCONNECTED';
  const connectionHealthy = connected;

  // 3. TELEPROMPTER HEALTH
  let teleprompterStatus = 'NOT OPEN';
  let teleprompterHealthy = true;
  if (isTeleprompterOpen) {
    teleprompterStatus = 'ACTIVE';
  } else if (scriptText && scriptText.trim().length > 0) {
    teleprompterStatus = 'READY';
  } else {
    teleprompterStatus = 'NOT READY';
    teleprompterHealthy = false;
  }

  // 4. STAGE DISPLAY HEALTH
  const stageDisplayStatus = isStageDisplayOpen ? 'ACTIVE' : 'READY';
  const stageDisplayHealthy = true;

  // 5. CURRENT SESSION HEALTH
  const sessionStatus = currentActivity?.status || 'UPCOMING';
  const sessionHealthy = sessionStatus === 'LIVE' || sessionStatus === 'COMPLETED';

  // 6. STAGE SCRIPT HEALTH
  const scriptHasContent = Boolean(scriptText && scriptText.trim().length > 0);
  const scriptStatus = scriptHasContent ? 'SCRIPT READY' : 'SCRIPT NOT READY';
  const scriptHealthy = scriptHasContent;

  // Construct health items list dynamically
  const healthItems = [
    {
      id: 'connection',
      name: 'REAL-TIME CONNECTION',
      statusText: connectionStatus,
      isHealthy: connectionHealthy,
      isCritical: !connectionHealthy,
      dotClass: connectionHealthy ? 'bg-emerald-500' : 'bg-red-500 animate-pulse',
      actionLabel: !connectionHealthy ? 'RECONNECT' : null,
      onAction: !connectionHealthy ? onOpenStageDisplay : null
    },
    {
      id: 'timer',
      name: 'SESSION TIMER',
      statusText: timerStatus,
      isHealthy: timerHealthy,
      isCritical: false,
      dotClass: timerDotClass,
      actionLabel: !isTimerRunning && currentActivity?.status === 'LIVE' ? 'RESUME' : null,
      onAction: !isTimerRunning && currentActivity?.status === 'LIVE' ? onToggleTimer : null
    },
    {
      id: 'session',
      name: 'CURRENT SESSION',
      statusText: sessionStatus,
      isHealthy: sessionHealthy,
      isCritical: false,
      dotClass: sessionStatus === 'LIVE' ? 'bg-emerald-500' : sessionStatus === 'PAUSED' ? 'bg-amber-500' : 'bg-indigo-500',
      actionLabel: null,
      onAction: null
    },
    {
      id: 'script',
      name: 'STAGE SCRIPT',
      statusText: scriptStatus,
      isHealthy: scriptHealthy,
      isCritical: false,
      dotClass: scriptHealthy ? 'bg-emerald-500' : 'bg-amber-500',
      actionLabel: onOpenTeleprompter ? 'OPEN SCRIPT' : null,
      onAction: onOpenTeleprompter ? () => onOpenTeleprompter(scriptText) : null
    },
    {
      id: 'teleprompter',
      name: 'TELEPROMPTER',
      statusText: teleprompterStatus,
      isHealthy: teleprompterHealthy,
      isCritical: false,
      dotClass: isTeleprompterOpen ? 'bg-indigo-500' : teleprompterHealthy ? 'bg-emerald-500' : 'bg-slate-300',
      actionLabel: !isTeleprompterOpen && onOpenTeleprompter ? 'OPEN' : null,
      onAction: !isTeleprompterOpen && onOpenTeleprompter ? () => onOpenTeleprompter(scriptText) : null
    },
    {
      id: 'stage_display',
      name: 'STAGE DISPLAY HUD',
      statusText: stageDisplayStatus,
      isHealthy: stageDisplayHealthy,
      isCritical: false,
      dotClass: isStageDisplayOpen ? 'bg-indigo-500' : 'bg-emerald-500',
      actionLabel: !isStageDisplayOpen && onOpenStageDisplay ? 'OPEN' : null,
      onAction: !isStageDisplayOpen && onOpenStageDisplay ? onOpenStageDisplay : null
    }
  ];

  // Dynamic Summary Calculations
  const totalItems = healthItems.length;
  const healthyCount = healthItems.filter(item => item.isHealthy).length;
  const unhealthyCount = totalItems - healthyCount;

  let summaryStatusText = 'ALL SYSTEMS READY';
  let summaryBadgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let summaryIcon = CheckCircle2;
  let summaryIconColor = 'text-emerald-600';

  if (!connected) {
    summaryStatusText = 'CRITICAL ISSUE';
    summaryBadgeBg = 'bg-red-50 text-red-800 border-red-200';
    summaryIcon = AlertTriangle;
    summaryIconColor = 'text-red-600';
  } else if (unhealthyCount > 0) {
    summaryStatusText = `${unhealthyCount} ITEM${unhealthyCount > 1 ? 'S' : ''} NEED ATTENTION`;
    summaryBadgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
    summaryIcon = AlertTriangle;
    summaryIconColor = 'text-amber-600';
  }

  const SummaryIconComponent = summaryIcon;

  return (
    <div
      role="region"
      aria-label="Session Infrastructure Health Panel"
      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          HEADER ROW: TITLE & DYNAMIC READY COUNTER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex-shrink-0">
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 font-mono">
              SESSION HEALTH
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Live operational infrastructure status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${summaryBadgeBg}`}>
            {summaryStatusText}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {healthyCount} / {totalItems} READY
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HEALTH ITEMS LIST
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {healthItems.map((item) => (
          <div
            key={item.id}
            className="p-2.5 sm:p-3 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.dotClass}`}
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-slate-800 font-mono tracking-tight truncate">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`text-[11px] font-mono font-bold uppercase ${
                  item.isHealthy ? 'text-slate-700' : item.isCritical ? 'text-red-700' : 'text-amber-800'
                }`}
              >
                {item.statusText}
              </span>

              {item.onAction && (
                <button
                  type="button"
                  onClick={item.onAction}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold font-mono transition active:scale-95 shadow-sm"
                >
                  <span>[{item.actionLabel}]</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
