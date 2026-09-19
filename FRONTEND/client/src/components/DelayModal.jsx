import React, { useState } from 'react';
import {
  Hourglass,
  X,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { shiftTimeString } from '../utils/formatters';
import { useToast } from './ui/ToastContext';

const REASON_PRESETS = [
  'Speaker delayed',
  'Technical issue',
  'Audience issue',
  'Previous session overran',
  'Other'
];

export default function DelayModal({
  isOpen,
  onClose,
  agenda = [],
  onAddDelay,
  initialTargetActivityId = null
}) {
  const toast = useToast();
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [targetId, setTargetId] = useState(initialTargetActivityId || '');
  const [selectedReason, setSelectedReason] = useState('Speaker delayed');
  const [customReasonText, setCustomReasonText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justAppliedNotice, setJustAppliedNotice] = useState(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine current live or selected session
  const currentLive = agenda.find((a) => a.status === 'LIVE');
  const defaultTargetId = targetId || initialTargetActivityId || (currentLive ? currentLive.id : (agenda[0]?.id || ''));

  const effectiveMinutes = isCustom ? parseInt(customMinutes, 10) || 0 : selectedMinutes;

  // Find pivot index and affected downstream sessions
  const pivotIndex = agenda.findIndex((a) => String(a.id) === String(defaultTargetId));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveMinutes || effectiveMinutes <= 0) return;

    setSubmitting(true);
    try {
      await onAddDelay({
        minutes: effectiveMinutes,
        targetActivityId: defaultTargetId,
        reason: finalReason
      });

      setJustAppliedNotice(`Schedule delayed by ${effectiveMinutes} minutes`);
      toast.warning(`${effectiveMinutes}-minute delay applied.`);
      setTimeout(() => {
        setJustAppliedNotice(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply schedule delay.');
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delay-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none"
    >
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ─────────────────────────────────────────────────────────────
            1. MODAL HEADER
            ───────────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
            <div>
              <h2 id="delay-modal-title" className="text-base font-bold text-slate-900 tracking-tight">
                Add Schedule Delay
              </h2>
              <p className="text-xs text-slate-500">
                Recalibrates stage timeline and shifts downstream sessions automatically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. SUCCESS NOTIFICATION OVERLAY (AFTER APPLYING)
            ───────────────────────────────────────────────────────────── */}
        {justAppliedNotice ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">{justAppliedNotice}</h3>
              <p className="text-xs text-slate-500">
                Live dashboard, teleprompter, and stage display clocks have been shifted.
              </p>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              3. DELAY CONFIGURATION FORM & IMPACT PREVIEW
              ───────────────────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
            
            {/* A. DURATION PRESETS (+5, +10, +15, Custom) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center justify-between">
                <span>1. Select Delay Duration</span>
                {effectiveMinutes > 0 && (
                  <span className="text-amber-700 font-bold">+{effectiveMinutes} Minutes Shift</span>
                )}
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15].map((mins) => {
                  const isActive = !isCustom && selectedMinutes === mins;
                  return (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => {
                        setSelectedMinutes(mins);
                        setIsCustom(false);
                      }}
                      className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
                        isActive
                          ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      +{mins} min
                    </button>
                  );
                })}

                {/* Custom Button */}
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
                    isCustom
                      ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Minutes Input Field */}
              {isCustom && (
                <div className="flex items-center gap-2 pt-1 animate-fade-in">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      placeholder="Enter custom minutes (e.g. 20, 30, 45)"
                      className="stage-input font-mono"
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">
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
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              {/* Additional Context Input */}
              <input
                type="text"
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                placeholder="Optional details (e.g. VIP dignitary in transit, AV projector sync)"
                className="stage-input text-xs"
              />
            </div>

            {/* C. TARGET PIVOT SELECTION */}
            {agenda.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">
                  3. Apply Starting From Session
                </label>
                <select
                  value={defaultTargetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="stage-input text-xs font-sans"
                >
                  {agenda.map((item) => (
                    <option key={item.id} value={item.id}>
                      #{item.order_index}. {item.title} ({item.start_time} - {item.end_time}) [{item.status}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* D. SCHEDULE IMPACT PREVIEW (BEFORE → AFTER) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Estimated Timeline Impact
                </span>
                <span className="text-slate-500">
                  {affectedSessions.length} sessions shifting
                </span>
              </div>

              {/* 3-Session Sequential Impact Cards */}
              <div className="space-y-2 text-xs">
                
                {/* Current Session */}
                {currentSession && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                    <div className="truncate max-w-[55%]">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono block">
                        Current Session
                      </span>
                      <p className="font-bold text-slate-900 truncate">{currentSession.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-right">
                      <span className="text-slate-500">{currentSession.start_time}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="font-bold text-amber-700">
                        {shiftTimeString(currentSession.start_time, effectiveMinutes)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Next Session */}
                {nextSession && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                    <div className="truncate max-w-[55%]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
                        Next Session
                      </span>
                      <p className="font-semibold text-slate-800 truncate">{nextSession.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-right">
                      <span className="text-slate-500">{nextSession.start_time}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="font-bold text-amber-700">
                        {shiftTimeString(nextSession.start_time, effectiveMinutes)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Following Session */}
                {followingSession && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                    <div className="truncate max-w-[55%]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                        Following Session
                      </span>
                      <p className="font-medium text-slate-700 truncate">{followingSession.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-right">
                      <span className="text-slate-500">{followingSession.start_time}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="font-bold text-amber-700">
                        {shiftTimeString(followingSession.start_time, effectiveMinutes)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                4. ACTION BUTTONS
                ───────────────────────────────────────────────────────────── */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !effectiveMinutes || effectiveMinutes <= 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 active:scale-95"
              >
                <Hourglass className="w-3.5 h-3.5" />
                <span>
                  {submitting
                    ? 'Applying Delay...'
                    : `Apply Delay (+${effectiveMinutes}m)`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
