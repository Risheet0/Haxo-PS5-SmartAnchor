import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Hourglass, 
  Sparkles, 
  Clock, 
  User, 
  Radio, 
  ChevronRight, 
  Activity, 
  Tv,
  ListOrdered,
  ArrowUpRight,
  Check,
  Zap,
  Layers
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
  const currentActivity = agenda.find(a => a.status === 'LIVE') || agenda.find(a => a.status === 'UPCOMING') || agenda[0];
  const currentIndex = agenda.findIndex(a => a.id === currentActivity?.id);
  const nextActivity = currentIndex >= 0 && currentIndex + 1 < agenda.length ? agenda[currentIndex + 1] : null;

  const totalDurationSecs = (currentActivity?.duration_minutes || 40) * 60;
  const [elapsedSecs, setElapsedSecs] = useState(1140);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSecs(prev => (prev < totalDurationSecs ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [totalDurationSecs]);

  const isDelayed = (event?.current_delay_minutes || 0) > 0;
  const isLive = currentActivity?.status === 'LIVE';

  const completedCount = agenda.filter(a => a.status === 'COMPLETED').length;
  const liveCount = agenda.filter(a => a.status === 'LIVE').length;
  const upcomingCount = agenda.filter(a => a.status === 'UPCOMING').length;
  const progressPercent = agenda.length > 0 ? Math.round((completedCount / agenda.length) * 100) : 0;

  if (agenda.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
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
    <div className="p-4 sm:p-8 space-y-7 animate-fade-in max-w-7xl mx-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HEADER: GREETING, MULTI-SEGMENT PROGRESS PILL & BIG STATS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-3.5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to {event?.name || 'TechFest 2026'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {event?.venue || 'Grand Auditorium'} • Main Stage Operations & Live Rundown
            </p>
          </div>

          {/* Segmented Progress Pill Bar (Inspired by Image 1) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-slate-100/90 border border-slate-200/80 w-fit text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold text-[11px] shadow-sm">
              Done {progressPercent}%
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] shadow-sm">
              Live {Math.round((liveCount / (agenda.length || 1)) * 100)}%
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-700 text-white font-bold text-[11px]">
              Queued {Math.round((upcomingCount / (agenda.length || 1)) * 100)}%
            </span>
            <span className="px-3 py-1 rounded-full text-slate-600 font-semibold text-[11px]">
              Stage Flow 100%
            </span>
          </div>
        </div>

        {/* Big Numbers on Right (Inspired by Image 1) */}
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {agenda.length}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sessions
            </span>
          </div>

          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {completedCount}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Completed
            </span>
          </div>

          <div className="text-right">
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${isDelayed ? 'text-amber-600' : 'text-emerald-600'}`}>
              {isDelayed ? `+${event.current_delay_minutes}m` : '0m'}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {isDelayed ? 'Shift' : 'On Track'}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN 4-CARD SAAS COMPOSITION (Directly Inspired by Image 1)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">

        {/* CARD 1 (3 Cols): SPEAKER / LIVE SESSION HERO */}
        <div className="lg:col-span-3 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between p-5 relative group">
          <div className="space-y-3">
            {/* Speaker Avatar Header */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square w-full">
              <img
                src={getSpeakerAvatar(currentActivity?.speaker_name, currentActivity?.speaker_avatar)}
                alt={currentActivity?.speaker_name || 'Speaker'}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600/90 w-fit mb-1 shadow-sm">
                  LIVE ON STAGE
                </span>
                <h4 className="text-base font-bold text-white leading-tight">
                  {currentActivity?.speaker_name || 'Emcee Host'}
                </h4>
                <p className="text-[11px] text-slate-300 truncate">
                  {currentActivity?.speaker_designation || 'Presenter'}
                </p>
              </div>
            </div>

            {/* Session Info */}
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                Session #{currentActivity?.order_index} • {currentActivity?.activity_type}
              </span>
              <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                {currentActivity?.title}
              </h5>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
            <button
              onClick={() => onGenerateScript && onGenerateScript({
                scriptType: 'Speaker Introduction',
                speakerId: currentActivity?.speaker_id,
                currentActivityId: currentActivity?.id,
                nextActivityId: nextActivity?.id
              })}
              className="w-full btn-pill-secondary text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Anchor Script</span>
            </button>
          </div>
        </div>

        {/* CARD 2 (3 Cols): STAGE PROGRESS & DURATION BARS */}
        <div className="lg:col-span-3 rounded-3xl bg-white border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                Stage Progress
              </span>
              <span className="text-[11px] font-bold text-indigo-600 font-mono">
                {formatTimer(elapsedSecs)}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {Math.round(elapsedSecs / 60)}m
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {currentActivity?.duration_minutes || 40}m allocated
              </span>
            </div>

            {/* Vertical column progress bars inspired by Image 1 */}
            <div className="pt-6 pb-2 flex items-end justify-between gap-2 h-36">
              {agenda.slice(0, 6).map((item, idx) => {
                const isItemLive = item.status === 'LIVE';
                const isItemDone = item.status === 'COMPLETED';
                const heightPercent = Math.min(100, Math.max(25, (item.duration_minutes / 60) * 100));

                return (
                  <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    {isItemLive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-mono shadow-sm">
                        Live
                      </span>
                    )}
                    <div className="w-full bg-slate-100 rounded-full h-full flex flex-col justify-end p-0.5">
                      <div
                        className={`w-full rounded-full transition-all duration-500 ${
                          isItemLive
                            ? 'bg-blue-600 shadow-md shadow-blue-500/20'
                            : isItemDone
                            ? 'bg-slate-900'
                            : 'bg-slate-300'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{item.order_index}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Room: {currentActivity?.room || 'Main Auditorium'}</span>
            <span className="font-bold text-slate-700">{agenda.length} Total</span>
          </div>
        </div>

        {/* CARD 3 (3 Cols): TIME TRACKER CIRCULAR GAUGE (Image 1 Style) */}
        <div className="lg:col-span-3">
          <LiveTimerEngine
            durationMinutes={currentActivity?.duration_minutes || 40}
            initialElapsedSeconds={1140}
            isRunning={true}
          />
        </div>

        {/* CARD 4 (3 Cols): MIDNIGHT NAVY NEXT UP & STAGE CUES (Image 1 Style) */}
        <div className="lg:col-span-3 rounded-3xl bg-[#0B1E34] text-white p-5 shadow-lg shadow-slate-950/15 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Next Up On Stage
              </span>
              <span className="text-xs font-mono font-bold text-white/90">
                {nextActivity?.start_time || '11:50 AM'}
              </span>
            </div>

            {/* Next Session */}
            {nextActivity ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-2">
                    {nextActivity.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {nextActivity.speaker_name ? `with ${nextActivity.speaker_name}` : nextActivity.activity_type}
                  </p>
                </div>

                {/* Stage Cues Checklist */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-blue-400" />
                    </div>
                    <span className="truncate">Slide deck ready</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-blue-400" />
                    </div>
                    <span className="truncate">Handheld mic active</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-blue-400" />
                    </div>
                    <span className="truncate">Confidence monitor synced</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">
                This is the final activity on the schedule.
              </p>
            )}
          </div>

          <div className="pt-4 mt-2">
            <button
              onClick={() => onGenerateScript && onGenerateScript({
                scriptType: 'Transition',
                speakerId: nextActivity?.speaker_id,
                currentActivityId: currentActivity?.id,
                nextActivityId: nextActivity?.id
              })}
              className="w-full py-2.5 px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition active:scale-95 shadow-md shadow-blue-900/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Transition Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM STAGE SCHEDULE RUNDOWN FLOW & ACTIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Stage Schedule Flow
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenTeleprompter && onOpenTeleprompter()}
              className="btn-pill-primary text-xs py-1.5 px-3.5"
            >
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span>Teleprompter</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agenda.map((item) => {
            const isCurrent = item.id === currentActivity?.id;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border text-xs transition ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-200 shadow-sm'
                    : item.status === 'COMPLETED'
                    ? 'bg-slate-50/50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-900 line-clamp-1">
                    {item.order_index}. {item.title}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{item.start_time} - {item.end_time}</span>
                  <span>{item.duration_minutes}m</span>
                </div>

                {item.speaker_name && (
                  <div className="mt-2 text-[11px] text-slate-700 font-medium truncate flex items-center gap-1.5">
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
  );
}
