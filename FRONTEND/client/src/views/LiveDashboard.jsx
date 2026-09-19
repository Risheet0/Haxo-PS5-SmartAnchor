import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Hourglass, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  User, 
  Radio, 
  ChevronRight, 
  Activity, 
  ArrowUpRight,
  Tv,
  ListOrdered,
  ShieldCheck,
  Check,
  Mic2,
  FileCheck
} from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import LiveTimerEngine from '../components/ui/LiveTimerEngine';
import { formatTimer, getSpeakerAvatar } from '../utils/formatters';
import { useToast } from '../components/ui/ToastContext';
import EmptyState from '../components/ui/EmptyState';

export default function LiveDashboard({
  event,
  agenda = [],
  speakers = [],
  logs = [],
  onUpdateStatus,
  onOpenDelay,
  onOpenEmergency,
  onGenerateScript,
  onOpenTeleprompter
}) {
  const toast = useToast();
  // Identify current activity (LIVE or first non-completed)
  const currentActivity = agenda.find(a => a.status === 'LIVE') || agenda.find(a => a.status === 'UPCOMING') || agenda[0];
  const currentIndex = agenda.findIndex(a => a.id === currentActivity?.id);
  const nextActivity = currentIndex >= 0 && currentIndex + 1 < agenda.length ? agenda[currentIndex + 1] : null;

  // Real-time Timer Telemetry
  const totalDurationSecs = (currentActivity?.duration_minutes || 40) * 60;
  const [elapsedSecs, setElapsedSecs] = useState(1122); // 18m 42s default
  const remainingSecs = Math.max(0, totalDurationSecs - elapsedSecs);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSecs(prev => (prev < totalDurationSecs ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [totalDurationSecs]);

  const sessionProgress = Math.min(100, Math.round((elapsedSecs / totalDurationSecs) * 100));

  const completedCount = agenda.filter(a => a.status === 'COMPLETED').length;
  const totalAgendaCount = agenda.length || 1;
  const overallProgress = Math.round((completedCount / totalAgendaCount) * 100);

  // Health Metrics
  const isDelayed = (event?.current_delay_minutes || 0) > 0;
  const isLive = currentActivity?.status === 'LIVE';

  if (agenda.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState
          icon={Radio}
          title="NO AGENDA SESSIONS SCHEDULED"
          description="Initialize your event agenda items in the Agenda Manager or Event Setup to unlock the live command dashboard."
          actionLabel="Go to Agenda"
          onAction={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. EVENT HEALTH & OPS TELEMETRY BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {/* Metric 1: Schedule Health */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isDelayed ? 'bg-amber-50 border border-amber-200 text-amber-600' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-none">
              Schedule
            </span>
            <span className={`text-xs font-bold font-mono ${isDelayed ? 'text-amber-700' : 'text-emerald-700'}`}>
              {isDelayed ? `+${event.current_delay_minutes}m Shift` : 'On Track'}
            </span>
          </div>
        </div>

        {/* Metric 2: Current Session State */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isLive ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-blue-50 border border-blue-200 text-blue-600'
          }`}>
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-none">
              Session
            </span>
            <span className={`text-xs font-bold ${isLive ? 'text-red-700' : 'text-blue-700'}`}>
              {isLive ? 'Live On Stage' : 'Queued'}
            </span>
          </div>
        </div>

        {/* Metric 3: Speaker Readiness */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-none">
              Speaker
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {currentActivity?.speaker_name ? 'Ready On Stage' : 'Emcee Led'}
            </span>
          </div>
        </div>

        {/* Metric 4: Next Transition Readiness */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-none">
              Transition
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {nextActivity ? 'Bridge Ready' : 'Event Wrap'}
            </span>
          </div>
        </div>

        {/* Metric 5: AI Scripts Ready */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-none">
              AI Scripts
            </span>
            <span className="text-xs font-bold text-indigo-700">
              {agenda.length > 0 ? `${agenda.length} Generated` : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MASTER STAGE CONTROL GRID: LIVE NOW + NEXT UP
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left 8 Cols: LIVE NOW HERO CARD */}
        <div className="lg:col-span-8 space-y-6">
          {currentActivity ? (
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              {/* Subtle top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-500" />

              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    LIVE NOW
                  </span>
                  
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                    Session #{currentActivity.order_index} • {currentActivity.activity_type}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{currentActivity.start_time} - {currentActivity.end_time}</span>
                  <span className="text-slate-400">({currentActivity.duration_minutes}m)</span>
                </div>
              </div>

              {/* Activity Main Title */}
              <div className="mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                  {currentActivity.title}
                </h2>
                {currentActivity.notes && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {currentActivity.notes}
                  </p>
                )}
              </div>

              {/* Speaker Card on Stage */}
              {currentActivity.speaker_name && (
                <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={getSpeakerAvatar(currentActivity.speaker_name, currentActivity.speaker_avatar)}
                      alt={currentActivity.speaker_name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {currentActivity.speaker_name}
                        <span className="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          SPEAKER ON STAGE
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {currentActivity.speaker_designation} • {currentActivity.speaker_org}
                      </p>
                      {currentActivity.speaker_topic && (
                        <p className="text-xs text-indigo-700 mt-0.5 font-medium">
                          Topic: "{currentActivity.speaker_topic}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onGenerateScript && onGenerateScript({
                      scriptType: 'Speaker Introduction',
                      speakerId: currentActivity.speaker_id,
                      currentActivityId: currentActivity.id,
                      nextActivityId: nextActivity?.id
                    })}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold transition flex-shrink-0 shadow-sm"
                    title="Generate Anchor Intro Script"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Anchor Script</span>
                  </button>
                </div>
              )}

              {/* Live Timer Engine with Semantic Color Thresholds */}
              <div className="mb-5">
                <LiveTimerEngine
                  durationMinutes={currentActivity?.duration_minutes || 40}
                  initialElapsedSeconds={18 * 60 + 42}
                  isRunning={true}
                />
              </div>

              {/* Primary Operations Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  {currentActivity.status !== 'LIVE' ? (
                    <button
                      onClick={() => {
                        onUpdateStatus(currentActivity.id, 'LIVE');
                        toast.success('Session started and transitioned to LIVE NOW.');
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Activity</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onUpdateStatus(currentActivity.id, 'COMPLETED');
                        toast.success('Session completed.');
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200 transition active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Complete Activity</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenDelay({ targetActivityId: currentActivity.id })}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-semibold transition active:scale-95"
                  >
                    <Hourglass className="w-4 h-4 text-amber-600" />
                    <span>+10m Delay</span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenTeleprompter && onOpenTeleprompter()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs sm:text-sm font-semibold transition shadow-sm"
                >
                  <Tv className="w-4 h-4 text-indigo-600" />
                  <span>Launch Teleprompter</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 shadow-sm">
              No active agenda session currently loaded.
            </div>
          )}

          {/* Live Stage Audit Stream */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Stage Audit Log
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Recent stage adjustments
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.slice(0, 6).map((log) => (
                  <div 
                    key={log.id} 
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          log.action_type === 'DELAY_ADDED' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          log.action_type === 'ANNOUNCEMENT_BROADCAST' ? 'bg-red-50 text-red-700 border border-red-200' :
                          log.action_type === 'ACTIVITY_START' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}>
                          {log.action_type}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-snug">{log.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No audit log entries recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: NEXT UP PREVIEW & STAGE SCHEDULE FLOW */}
        <div className="lg:col-span-4 space-y-6">

          {/* NEXT UP CARD */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                NEXT UP ON STAGE
              </span>
              {nextActivity && (
                <span className="text-xs font-mono font-bold text-slate-700">
                  {nextActivity.start_time}
                </span>
              )}
            </div>

            {nextActivity ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {nextActivity.activity_type}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1.5">
                    {nextActivity.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    Scheduled: {nextActivity.start_time} - {nextActivity.end_time} ({nextActivity.duration_minutes} min)
                  </p>
                </div>

                {nextActivity.speaker_name && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <img 
                      src={getSpeakerAvatar(nextActivity.speaker_name, nextActivity.speaker_avatar)} 
                      alt={nextActivity.speaker_name} 
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900">{nextActivity.speaker_name}</p>
                      <p className="text-slate-500 truncate max-w-[170px]">{nextActivity.speaker_org}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => onGenerateScript && onGenerateScript({
                      scriptType: 'Transition',
                      speakerId: nextActivity.speaker_id,
                      currentActivityId: currentActivity?.id,
                      nextActivityId: nextActivity.id
                    })}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Transition Script</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                This is the final activity of the event.
              </p>
            )}
          </div>

          {/* STAGE SCHEDULE TIMELINE FLOW */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-indigo-600" />
                Stage Schedule Flow
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                {agenda.length} items
              </span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {agenda.map((item) => {
                const isCurrent = item.id === currentActivity?.id;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      isCurrent
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                        : item.status === 'COMPLETED'
                        ? 'bg-slate-50/50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-slate-900 line-clamp-1">
                        {item.order_index}. {item.title}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{item.start_time} - {item.end_time}</span>
                      <span>{item.duration_minutes}m</span>
                    </div>

                    {item.speaker_name && (
                      <div className="mt-1 text-[11px] text-indigo-700 font-medium truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{item.speaker_name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
