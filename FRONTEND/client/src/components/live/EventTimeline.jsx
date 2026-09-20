import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Radio,
  ChevronRight,
  User,
  MapPin,
  Hourglass,
  Layers
} from 'lucide-react';
import { formatTimer, getSpeakerAvatar } from '../../utils/formatters';

export default function EventTimeline({
  agenda = [],
  activeSessionIndex = 0,
  elapsedSecs = 0,
  totalDurationSecs = 0,
  currentDelayMinutes = 0,
  onSelectSession
}) {
  if (!agenda || agenda.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center py-8">
        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-xs font-bold font-mono uppercase text-slate-700">No Run-of-Show Items</h4>
        <p className="text-xs text-slate-400 mt-1">Create agenda items in Agenda Manager to generate the live event timeline.</p>
      </div>
    );
  }

  const isOvertime = elapsedSecs > totalDurationSecs && totalDurationSecs > 0;
  const remainingSecs = Math.max(0, totalDurationSecs - elapsedSecs);
  const overtimeSecs = isOvertime ? elapsedSecs - totalDurationSecs : 0;

  return (
    <div
      role="region"
      aria-label="Real-Time Event Timeline"
      className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TIMELINE HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 font-mono">
              EVENT TIMELINE
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Run-of-show schedule &amp; real-time session progress
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {currentDelayMinutes > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
              <Hourglass className="w-3 h-3 text-amber-600" />
              <span>+{currentDelayMinutes}m Schedule Shift</span>
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
            {agenda.length} Sessions Total
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VERTICAL TIMELINE CONTAINER
          ───────────────────────────────────────────────────────────── */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {agenda.map((item, idx) => {
          const isLive = idx === activeSessionIndex && item.status !== 'COMPLETED';
          const isCompleted = item.status === 'COMPLETED' || idx < activeSessionIndex;
          const isNext = idx === activeSessionIndex + 1 && !isLive;
          const isDelayed = currentDelayMinutes > 0 && !isCompleted;

          // Determine visual node style & badge
          let nodeDot = (
            <span className="absolute -left-6 sm:-left-8 top-3 w-4 h-4 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            </span>
          );
          let statusBadge = (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
              QUEUED
            </span>
          );

          if (isLive) {
            nodeDot = (
              <span className="absolute -left-6 sm:-left-8 top-3 w-4 h-4 rounded-full bg-red-50 border-2 border-red-500 flex items-center justify-center z-10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </span>
            );
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                <span>● LIVE</span>
              </span>
            );
          } else if (isNext) {
            nodeDot = (
              <span className="absolute -left-6 sm:-left-8 top-3 w-4 h-4 rounded-full bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              </span>
            );
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                <span>→ NEXT</span>
              </span>
            );
          } else if (isCompleted) {
            nodeDot = (
              <span className="absolute -left-6 sm:-left-8 top-3 w-4 h-4 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center z-10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </span>
            );
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>COMPLETED</span>
              </span>
            );
          } else if (isDelayed) {
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-amber-600" />
                <span>DELAYED (+{currentDelayMinutes}m)</span>
              </span>
            );
          }

          return (
            <div key={item.id || idx} className="relative group">
              {nodeDot}

              {/* Session Timeline Card */}
              <div
                onClick={() => onSelectSession && onSelectSession(idx)}
                className={`p-3.5 sm:p-4 rounded-xl border transition cursor-pointer ${
                  isLive
                    ? 'bg-white border-red-300 ring-1 ring-red-200 shadow-sm'
                    : isNext
                    ? 'bg-indigo-50/40 border-indigo-200 hover:bg-indigo-50/70'
                    : isCompleted
                    ? 'bg-slate-50/60 border-slate-200 opacity-75 hover:opacity-100'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Start & End Times */}
                    <span className="text-xs font-mono font-extrabold text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.start_time}</span>
                      {item.end_time && <span className="text-slate-400 font-normal">— {item.end_time}</span>}
                    </span>

                    {/* Room / Stage */}
                    {item.room && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        <span>{item.room}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {statusBadge}
                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Inspect session"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Session Title & Speaker Info */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      #{item.order_index || idx + 1} • {item.activity_type || 'Session'}
                    </span>
                  </div>

                  <h4 className={`text-sm sm:text-base font-bold tracking-tight ${isLive ? 'text-slate-900' : 'text-slate-800'}`}>
                    {item.title}
                  </h4>

                  {item.speaker_name && (
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                      <img
                        src={getSpeakerAvatar(item.speaker_name, item.speaker_avatar)}
                        alt={item.speaker_name}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-900">{item.speaker_name}</span>
                      {item.speaker_org && (
                        <span className="text-slate-400 text-[11px] truncate">• {item.speaker_org}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* LIVE TELEMETRY INSET FOR ACTIVE SESSION */}
                {isLive && (
                  <div className="mt-3 pt-2.5 border-t border-red-100 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600">
                        Elapsed: <strong className="text-slate-900">{formatTimer(elapsedSecs)}</strong>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={isOvertime ? 'text-red-600 font-bold' : 'text-indigo-600 font-bold'}>
                        {isOvertime ? `Overtime -${formatTimer(overtimeSecs)}` : `Remaining ${formatTimer(remainingSecs)}`}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      ACTIVE ON STAGE
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
