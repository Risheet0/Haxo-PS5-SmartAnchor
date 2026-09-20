import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  WifiOff,
  Hourglass,
  UserX,
  Radio,
  ChevronRight
} from 'lucide-react';
import { formatTimer } from '../../utils/formatters';

export default function AttentionPanel({
  event,
  currentActivity,
  nextActivity,
  elapsedSecs = 0,
  totalDurationSecs = 0,
  connected = true,
  activeAnnouncement,
  onOpenEmergency,
  onOpenDelay,
  onOpenStageDisplay
}) {
  const attentionItems = [];

  // 1. CRITICAL: Active Emergency Broadcast
  if (activeAnnouncement && activeAnnouncement.is_active === 1) {
    attentionItems.push({
      id: 'active_emergency',
      priority: 'CRITICAL',
      title: 'Emergency announcement active',
      description: activeAnnouncement.ai_script || activeAnnouncement.original_prompt || 'Broadcast active on live stage HUD',
      actionLabel: 'VIEW EMERGENCY',
      onAction: onOpenEmergency,
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-600'
    });
  }

  // 2. CRITICAL: Socket Disconnection
  if (!connected) {
    attentionItems.push({
      id: 'socket_disconnected',
      priority: 'CRITICAL',
      title: 'Real-time connection disconnected',
      description: 'Stage control room is operating in offline mode. Telemetry updates paused.',
      actionLabel: 'CHECK STATUS',
      onAction: onOpenStageDisplay,
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      icon: WifiOff,
      iconColor: 'text-red-600'
    });
  }

  // 3. WARNING: Active Session Overtime
  const isOvertime = elapsedSecs > totalDurationSecs && totalDurationSecs > 0 && currentActivity?.status === 'LIVE';
  if (isOvertime) {
    const overtimeSecs = elapsedSecs - totalDurationSecs;
    attentionItems.push({
      id: 'session_overtime',
      priority: 'WARNING',
      title: `Session overtime (+${formatTimer(overtimeSecs)})`,
      description: `"${currentActivity?.title || 'Current session'}" has exceeded its allocated duration of ${Math.round(totalDurationSecs / 60)} min.`,
      actionLabel: 'ADD DELAY',
      onAction: () => onOpenDelay && onOpenDelay({ targetActivityId: currentActivity?.id }),
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
      iconColor: 'text-amber-600'
    });
  }

  // 4. WARNING: Schedule Delay Injected
  const currentDelay = event?.current_delay_minutes || 0;
  if (currentDelay > 0 && !isOvertime) {
    attentionItems.push({
      id: 'schedule_delay',
      priority: 'WARNING',
      title: `Schedule running behind (+${currentDelay} min)`,
      description: 'Overall event run-of-show has been shifted by delay injection.',
      actionLabel: 'VIEW DELAY',
      onAction: () => onOpenDelay && onOpenDelay({ targetActivityId: currentActivity?.id }),
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Hourglass,
      iconColor: 'text-amber-600'
    });
  }

  // 5. INFO: Next Speaker Information Missing
  if (nextActivity && !nextActivity.speaker_name) {
    attentionItems.push({
      id: 'next_speaker_missing',
      priority: 'INFO',
      title: 'Next session speaker unassigned',
      description: `"${nextActivity.title}" is scheduled next but has no assigned speaker profile.`,
      actionLabel: 'INSPECT NEXT',
      onAction: null,
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: UserX,
      iconColor: 'text-indigo-600'
    });
  }

  const hasIssues = attentionItems.length > 0;

  return (
    <div
      role="region"
      aria-label="Operational Needs Attention Panel"
      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          HEADER ROW
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border flex-shrink-0 ${hasIssues ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            {hasIssues ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 font-mono">
              NEEDS ATTENTION
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time actionable operational items
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            hasIssues
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {hasIssues ? `${attentionItems.length} ITEM${attentionItems.length > 1 ? 'S' : ''} REQUIRING ATTENTION` : 'ALL SYSTEMS READY'}
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ATTENTION ITEMS LIST / READY STATE
          ───────────────────────────────────────────────────────────── */}
      {hasIssues ? (
        <div className="space-y-2.5">
          {attentionItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-wrap items-center justify-between gap-3 transition hover:bg-slate-50"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 flex-shrink-0 mt-0.5">
                    <ItemIcon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${item.badgeBg}`}>
                        {item.priority}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-normal line-clamp-2 font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.onAction && (
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold font-mono transition active:scale-95 shadow-sm flex-shrink-0"
                  >
                    <span>{item.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-950">
                ✓ ALL SYSTEMS READY
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                No immediate operational attention required. Run-of-show schedule &amp; stage controls operating normally.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
