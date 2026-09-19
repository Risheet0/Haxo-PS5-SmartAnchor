import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Radio,
  Copy,
  Check,
  Volume2,
  Tv,
  Send,
  Eye,
  ShieldAlert,
  Mic,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './ui/ToastContext';

const PRESET_ANNOUNCEMENTS = [
  'Please remain seated while we resolve a technical issue.',
  'Short 5-minute technical pause in progress. Please stay in your seats.',
  'Auditorium soundcheck recalibration underway. We will resume shortly.',
  'VIP dignitary arrival protocol in effect. Next session will commence at the top of the hour.',
  'Medical assistance requested in aisle 4. All other attendees please remain seated.'
];

export default function EmergencyModal({
  isOpen,
  onClose,
  onBroadcastSuccess,
  onOpenTeleprompter,
  onOpenStageDisplay
}) {
  const toast = useToast();
  const [selectedPreset, setSelectedPreset] = useState(PRESET_ANNOUNCEMENTS[0]);
  const [customText, setCustomText] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const effectiveAnnouncement = isCustom ? customText.trim() : selectedPreset;

  const handlePublish = async () => {
    if (!effectiveAnnouncement) return;
    setPublishing(true);
    try {
      const res = await api.createAnnouncement({
        original_prompt: effectiveAnnouncement,
        ai_script: effectiveAnnouncement,
        priority: 'urgent'
      });
      if (onBroadcastSuccess) onBroadcastSuccess(res);
      toast.error('Emergency announcement published to stage.');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to broadcast emergency announcement.');
    } finally {
      setPublishing(false);
    }
  };

  const handleReadAsAnchor = () => {
    if (!effectiveAnnouncement) return;
    if (onOpenTeleprompter) {
      const anchorCopy = `[Stage Cue: Step forward calmly, maintain reassuring voice tone and posture]

"Ladies and gentlemen, your attention please:

${effectiveAnnouncement}

[Stage Cue: Pause for 3 seconds, nod respectfully]

We appreciate your patience and cooperation as we resume our scheduled program shortly."`;
      onOpenTeleprompter(anchorCopy);
      toast.info('Emergency script loaded into anchor teleprompter.');
    }
    onClose();
  };

  const handleShowOnStage = async () => {
    if (!effectiveAnnouncement) return;
    // Publish so it appears on Stage Display HUD and live monitors
    try {
      const res = await api.createAnnouncement({
        original_prompt: 'STAGE HUD BROADCAST',
        ai_script: effectiveAnnouncement,
        priority: 'urgent'
      });
      if (onBroadcastSuccess) onBroadcastSuccess(res);
      if (onOpenStageDisplay) onOpenStageDisplay();
      toast.warning('Emergency broadcasted on Stage Display HUD.');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to display emergency on stage.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveAnnouncement);
    setCopied(true);
    toast.success('Emergency announcement copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none"
    >
      <div className="bg-white border border-red-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ─────────────────────────────────────────────────────────────
            1. DISTINCT EMERGENCY HEADER
            ───────────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between bg-red-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="emergency-modal-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Emergency Stage Announcement
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white font-mono">
                  LIVE OVERRIDE
                </span>
              </div>
              <p className="text-xs text-red-700/80 mt-0.5">
                Rapid broadcast protocol for technical pauses, crowd guidance, or immediate stage notices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. ANNOUNCEMENT SELECTION & COMPOSER
            ───────────────────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* A. PRESET SELECTION */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">
              1. Select Preset Announcement
            </label>
            <div className="space-y-2">
              {PRESET_ANNOUNCEMENTS.map((preset, idx) => {
                const isSelected = !isCustom && selectedPreset === preset;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset);
                      setIsCustom(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-red-50/60 border-red-300 text-red-950 shadow-sm font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>"{preset}"</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. CUSTOM ANNOUNCEMENT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">
                2. Or Enter Custom Announcement
              </label>
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`text-[11px] font-semibold ${
                  isCustom ? 'text-red-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isCustom ? 'Custom Active' : 'Switch to Custom'}
              </button>
            </div>

            <textarea
              rows={3}
              value={customText}
              onFocus={() => setIsCustom(true)}
              onChange={(e) => {
                setCustomText(e.target.value);
                setIsCustom(true);
              }}
              placeholder="Type urgent announcement copy here (e.g. Please remain seated while we resolve an audio feed sync)..."
              className={`w-full p-3 rounded-xl text-xs sm:text-sm font-sans resize-none transition bg-white border ${
                isCustom
                  ? 'border-red-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-200'
                  : 'border-slate-200 text-slate-700'
              }`}
            />
          </div>

          {/* C. ACTIVE BROADCAST PREVIEW */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              <span>Active Announcement Content</span>
              <button
                onClick={handleCopy}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-sans"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs font-semibold text-red-900 leading-relaxed">
              "{effectiveAnnouncement}"
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. FOUR ACTION BUTTONS
            ───────────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Cancel
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Action 1: Show on Stage */}
            <button
              type="button"
              onClick={handleShowOnStage}
              disabled={!effectiveAnnouncement}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition disabled:opacity-50 shadow-sm"
              title="Broadcast to auditorium Stage Displays and HUDs"
            >
              <Tv className="w-3.5 h-3.5 text-indigo-600" />
              <span>Show on Stage</span>
            </button>

            {/* Action 2: Read as Anchor */}
            <button
              type="button"
              onClick={handleReadAsAnchor}
              disabled={!effectiveAnnouncement}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-semibold transition disabled:opacity-50 shadow-sm"
              title="Load directly into Anchor Teleprompter with stage cues"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-600" />
              <span>Read as Anchor</span>
            </button>

            {/* Action 3: Publish */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || !effectiveAnnouncement}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
