import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Mic,
  Presentation,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  FileText,
  UserX,
  AlertCircle
} from 'lucide-react';
import { getSpeakerAvatar } from '../../utils/formatters';
import { useToast } from '../ui/ToastContext';

export default function NextSpeakerPrep({
  nextActivity = null,
  speakers = [],
  onSelectNextScript
}) {
  const toast = useToast();

  // Find speaker details from speakers list if available
  const speakerDetail = speakers.find(s => s.id === nextActivity?.speaker_id) || {
    name: nextActivity?.speaker_name,
    organization: nextActivity?.speaker_org,
    designation: nextActivity?.speaker_designation,
    topic: nextActivity?.speaker_topic || nextActivity?.title,
    bio: nextActivity?.speaker_bio || 'Featured dignitary for the upcoming stage presentation.'
  };

  // Readiness checklist state per next session ID
  const sessionId = nextActivity?.id;
  const [readiness, setReadiness] = useState(() => {
    if (!sessionId) return { arrived: false, micChecked: false, slidesLoaded: false, promptSynced: false };
    const saved = localStorage.getItem(`smartstage_prep_${sessionId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { arrived: false, micChecked: false, slidesLoaded: false, promptSynced: false };
  });

  useEffect(() => {
    if (!sessionId) return;
    const saved = localStorage.getItem(`smartstage_prep_${sessionId}`);
    if (saved) {
      try { setReadiness(JSON.parse(saved)); } catch (e) {}
    } else {
      setReadiness({ arrived: false, micChecked: false, slidesLoaded: false, promptSynced: false });
    }
  }, [sessionId]);

  const toggleCheck = (key) => {
    if (!sessionId) return;
    const updated = { ...readiness, [key]: !readiness[key] };
    setReadiness(updated);
    localStorage.setItem(`smartstage_prep_${sessionId}`, JSON.stringify(updated));
  };

  const handleMarkAllReady = () => {
    if (!sessionId) return;
    const allReady = { arrived: true, micChecked: true, slidesLoaded: true, promptSynced: true };
    setReadiness(allReady);
    localStorage.setItem(`smartstage_prep_${sessionId}`, JSON.stringify(allReady));
    toast.success(`All backstage readiness checks completed for ${nextActivity?.speaker_name || 'upcoming session'}.`);
  };

  const handlePingSpeaker = () => {
    const name = nextActivity?.speaker_name || 'Stage Handler';
    toast.info(`Backstage cue ping sent to stage manager for ${name}.`);
  };

  if (!nextActivity) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-2 select-none">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 inline-block text-slate-400">
          <UserCheck className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          NO UPCOMING SESSION
        </h3>
        <p className="text-xs text-slate-500">
          Current activity concludes the full run-of-show flow.
        </p>
      </div>
    );
  }

  const completedChecksCount = Object.values(readiness).filter(Boolean).length;
  const isFullyPrepared = completedChecksCount === 4;

  return (
    <div
      role="region"
      aria-label="Next Speaker Backstage Preparation Panel"
      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          HEADER ROW
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border flex-shrink-0 ${isFullyPrepared ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 font-mono">
              NEXT SPEAKER PREPARATION
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Backstage readiness &amp; technical check
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isFullyPrepared
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {completedChecksCount} / 4 CHECKS READY
          </span>
          <button
            type="button"
            onClick={handleMarkAllReady}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold font-mono transition active:scale-95 shadow-sm"
          >
            MARK ALL READY
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          UPCOMING SPEAKER DETAILS CARD
          ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap sm:flex-nowrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <img
            src={getSpeakerAvatar(nextActivity.speaker_name, nextActivity.speaker_avatar)}
            alt={nextActivity.speaker_name || 'Speaker'}
            className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
                UP NEXT • {nextActivity.start_time || 'SCHEDULED'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 truncate mt-1">
              {nextActivity.speaker_name || 'Emcee / Open Session'}
            </h4>
            <p className="text-xs text-slate-600 truncate mt-0.5">
              {nextActivity.speaker_designation ? `${nextActivity.speaker_designation} • ` : ''}
              {nextActivity.speaker_org || 'Main Auditorium'}
            </p>
            {speakerDetail.bio && (
              <p className="text-xs text-slate-500 leading-normal mt-1.5 line-clamp-2 italic">
                "{speakerDetail.bio}"
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePingSpeaker}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold font-mono transition active:scale-95 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span>PING BACKSTAGE</span>
          </button>
          {onSelectNextScript && (
            <button
              type="button"
              onClick={onSelectNextScript}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold font-mono transition active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>PREVIEW SCRIPT</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4-POINT BACKSTAGE CHECKLIST TOGGLES
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        
        {/* 1. Backstage Arrival */}
        <button
          type="button"
          onClick={() => toggleCheck('arrived')}
          className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
            readiness.arrived
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck className={`w-4 h-4 ${readiness.arrived ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-xs font-mono truncate">1. Backstage Arrival</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            readiness.arrived ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {readiness.arrived ? 'ARRIVED' : 'PENDING'}
          </span>
        </button>

        {/* 2. Microphone Check */}
        <button
          type="button"
          onClick={() => toggleCheck('micChecked')}
          className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
            readiness.micChecked
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Mic className={`w-4 h-4 ${readiness.micChecked ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-xs font-mono truncate">2. Microphone Assigned</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            readiness.micChecked ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {readiness.micChecked ? 'CHECKED' : 'PENDING'}
          </span>
        </button>

        {/* 3. Slide Deck Loaded */}
        <button
          type="button"
          onClick={() => toggleCheck('slidesLoaded')}
          className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
            readiness.slidesLoaded
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Presentation className={`w-4 h-4 ${readiness.slidesLoaded ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-xs font-mono truncate">3. Slide Deck Loaded</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            readiness.slidesLoaded ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {readiness.slidesLoaded ? 'LOADED' : 'PENDING'}
          </span>
        </button>

        {/* 4. Teleprompter Sync */}
        <button
          type="button"
          onClick={() => toggleCheck('promptSynced')}
          className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
            readiness.promptSynced
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className={`w-4 h-4 ${readiness.promptSynced ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-xs font-mono truncate">4. Stage Script Cue</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            readiness.promptSynced ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {readiness.promptSynced ? 'SYNCED' : 'PENDING'}
          </span>
        </button>
      </div>
    </div>
  );
}
