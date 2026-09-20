import React, { useState } from 'react';
import {
  Hourglass,
  ArrowRight,
  Clock,
  CheckCircle2,
  History,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { shiftTimeString } from '../utils/formatters';
import DelayModal from '../components/DelayModal';

const REASON_PRESETS = [
  'Speaker delayed',
  'Technical issue',
  'Audience issue',
  'Previous session overran',
  'Other'
];

export default function DelayManager({
  event,
  agenda = [],
  logs = [],
  onRefresh
}) {
  const [minutes, setMinutes] = useState(10);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [selectedReason, setSelectedReason] = useState('Speaker delayed');
  const [customReasonText, setCustomReasonText] = useState('');
  const [applying, setApplying] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const effectiveMinutes = isCustom ? parseInt(customMinutes, 10) || 0 : minutes;

  const currentLive = agenda.find((a) => a.status === 'LIVE');
  const pivotItem = selectedActivityId
    ? agenda.find((a) => String(a.id) === String(selectedActivityId))
    : (currentLive || agenda[0]);

  const pivotIndex = agenda.findIndex((a) => a.id === pivotItem?.id);
  const activePivotIndex = pivotIndex >= 0 ? pivotIndex : 0;
  const currentSession = agenda[activePivotIndex] || null;
  const nextSession = agenda[activePivotIndex + 1] || null;
  const followingSession = agenda[activePivotIndex + 2] || null;
  const affectedSessions = activePivotIndex >= 0 ? agenda.slice(activePivotIndex) : [];

  const finalReason =
    selectedReason === 'Other'
      ? customReasonText.trim() || 'Unspecified operational adjustment'
      : customReasonText.trim()
      ? `${selectedReason}: ${customReasonText.trim()}`
      : selectedReason;

  const handleApplyDelay = async (delayMinsToApply) => {
    const mins = delayMinsToApply || effectiveMinutes;
    if (!mins || mins <= 0) return;

    setApplying(true);
    setSuccessNotice('');
    try {
      await api.addDelay({
        minutes: mins,
        targetActivityId: pivotItem?.id,
        reason: finalReason
      });
      setSuccessNotice(`Schedule delayed by ${mins} minutes`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  const delayLogs = logs.filter((l) => l.action_type === 'DELAY_ADDED');

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & METRICS BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 soft-card">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-sm">
              <Hourglass className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Stage Delay & Cascade Engine
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Recalibrate stage schedule instantly; downstream sessions and timer telemetry shift in real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">Accumulated Delay:</span>
            <span className="text-sm font-bold font-mono text-amber-700">
              +{event?.current_delay_minutes || 0}m
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-pill-primary text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>ADD DELAY</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. NOTIFICATION BANNER
          ───────────────────────────────────────────────────────────── */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{successNotice}</span>
            <span className="text-slate-600 hidden md:inline">— All {affectedSessions.length} downstream sessions updated.</span>
          </div>
          <button
            onClick={() => setSuccessNotice('')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. TWO-COLUMN WORKSPACE: TRIGGER CONTROLS & IMPACT PREVIEW
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (6 Cols): Delay Trigger Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 soft-card space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                <span>Live Delay Configuration</span>
              </h3>
              {effectiveMinutes > 0 && (
                <span className="text-xs font-bold font-mono text-amber-700">
                  +{effectiveMinutes}m selected
                </span>
              )}
            </div>

            {/* A. DURATION PRESETS */}
            <div className="space-y-2">
              <label className="soft-label">
                1. Select Delay Duration
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15].map((mins) => {
                  const isActive = !isCustom && minutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setMinutes(mins);
                        setIsCustom(false);
                      }}
                      className={`py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      +{mins}m
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition ${
                    isCustom
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustom && (
                <div className="flex items-center gap-2 pt-1 animate-fade-in">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      placeholder="Enter custom minutes (e.g. 20, 30)"
                      className="soft-input font-mono"
                      autoFocus
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">
                      min
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* B. REASON SELECTOR */}
            <div className="space-y-2">
              <label className="soft-label">
                2. Reason for Delay
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REASON_PRESETS.map((r) => {
                  const isSelected = selectedReason === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setSelectedReason(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-900 border-indigo-200 font-bold shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                placeholder="Optional explanation notes..."
                className="soft-input text-xs"
              />
            </div>

            {/* C. TARGET PIVOT SELECTION */}
            <div className="space-y-1.5">
              <label className="soft-label">
                3. Apply Starting From Session
              </label>
              <select
                value={pivotItem?.id || ''}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="soft-select text-xs"
              >
                {agenda.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.order_index}. {a.title} ({a.start_time} - {a.end_time}) [{a.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* D. ACTION BUTTONS */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMinutes(10);
                  setIsCustom(false);
                  setCustomMinutes('');
                }}
                className="btn-pill-secondary text-xs"
              >
                Reset
              </button>

              <button
                onClick={() => handleApplyDelay()}
                disabled={applying || !effectiveMinutes || effectiveMinutes <= 0}
                className="btn-pill-primary text-xs flex items-center gap-2"
              >
                <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                <span>{applying ? 'Applying Delay...' : `Apply Delay (+${effectiveMinutes}m)`}</span>
              </button>
            </div>
          </div>

          {/* Audit Log Card */}
          <div className="p-6 soft-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-600" />
                <span>Recorded Delay Audit Log</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">{delayLogs.length} events</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {delayLogs.length > 0 ? (
                delayLogs.map((dl) => (
                  <div
                    key={dl.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <p className="font-semibold text-slate-800">{dl.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{new Date(dl.timestamp).toLocaleTimeString()}</span>
                      <span className="text-amber-700 font-bold">CONFIRMED</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center italic">
                  No schedule delays logged for this session.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): Live Impact Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 soft-card space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Schedule Impact Preview</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {effectiveMinutes > 0 ? `+${effectiveMinutes}m shift` : 'Real-time'}
              </span>
            </div>

            {/* Top 3 Sequential Sessions Callout */}
            <div className="space-y-2.5">
              {currentSession && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-150 flex items-center justify-between gap-3 shadow-sm">
                  <div className="truncate max-w-[55%]">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono block">
                      Current Session
                    </span>
                    <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">{currentSession.title}</p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-right flex-shrink-0">
                    <span className="text-slate-400 line-through text-[11px]">{currentSession.start_time}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold text-amber-700">
                      {shiftTimeString(currentSession.start_time, effectiveMinutes)}
                    </span>
                  </div>
                </div>
              )}

              {nextSession && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                  <div className="truncate max-w-[55%]">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Next Session
                    </span>
                    <p className="font-semibold text-slate-800 truncate text-xs">{nextSession.title}</p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-right flex-shrink-0">
                    <span className="text-slate-400 line-through text-[11px]">{nextSession.start_time}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold text-amber-700">
                      {shiftTimeString(nextSession.start_time, effectiveMinutes)}
                    </span>
                  </div>
                </div>
              )}

              {followingSession && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                  <div className="truncate max-w-[55%]">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Following Session
                    </span>
                    <p className="font-semibold text-slate-800 truncate text-xs">{followingSession.title}</p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-right flex-shrink-0">
                    <span className="text-slate-400 line-through text-[11px]">{followingSession.start_time}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold text-amber-700">
                      {shiftTimeString(followingSession.start_time, effectiveMinutes)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Complete Downstream Timeline Table */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                All Affected Downstream Sessions
              </span>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {agenda.map((item, idx) => {
                  const isPivot = item.id === pivotItem?.id;
                  const isDownstream = idx >= activePivotIndex;
                  const newStart = isDownstream ? shiftTimeString(item.start_time, effectiveMinutes) : item.start_time;
                  const newEnd = isDownstream ? shiftTimeString(item.end_time, effectiveMinutes) : item.end_time;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                        isPivot
                          ? 'bg-amber-50/70 border-amber-200'
                          : isDownstream
                          ? 'bg-white border-slate-100 text-slate-800'
                          : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="truncate max-w-[60%]">
                        <span className="font-bold text-slate-800">
                          #{item.order_index}. {item.title}
                        </span>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.speaker_name ? `Speaker: ${item.speaker_name}` : item.room || 'Main Stage'}
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs flex-shrink-0">
                        {isDownstream && effectiveMinutes > 0 ? (
                          <div className="space-y-0.5">
                            <span className="text-amber-700 font-bold block">
                              {newStart} - {newEnd}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through block">
                              {item.start_time}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">{item.start_time} - {item.end_time}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. POPUP DELAY MODAL
          ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <DelayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          agenda={agenda}
          onAddDelay={async (payload) => {
            await api.addDelay(payload);
            setSuccessNotice(`Schedule delayed by ${payload.minutes} minutes`);
            if (onRefresh) onRefresh();
          }}
          initialTargetActivityId={pivotItem?.id}
        />
      )}
    </div>
  );
}
