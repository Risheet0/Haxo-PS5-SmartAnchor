import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Tv,
  Volume2,
  Edit3,
  Bookmark,
  BookmarkCheck,
  User,
  ArrowRight,
  RotateCcw,
  Clock,
  Layers,
  Building,
  CheckCircle2,
  Sliders,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { getSpeakerAvatar, parseStageScript } from '../utils/formatters';
import { useToast } from './ui/ToastContext';

export default function ScriptWorkflowModal({
  isOpen,
  onClose,
  workflowType = 'speaker-intro', // 'speaker-intro' | 'transition'
  event,
  speaker = null,
  session = null,
  previousSession = null,
  currentSession = null,
  nextSession = null,
  onOpenTeleprompter
}) {
  const toast = useToast();
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('Tech Community & Delegates');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Derive resolved entities
  const resolvedSpeaker = speaker || (currentSession?.speaker_name ? {
    name: currentSession.speaker_name,
    designation: currentSession.speaker_designation || 'Keynote Dignitary',
    organization: currentSession.speaker_org || 'Industry Leader',
    topic: currentSession.speaker_topic || currentSession.title,
    avatar_url: currentSession.speaker_avatar
  } : null);

  const resolvedEventName = event?.name || 'TechFest 2026';
  const resolvedVenue = event?.venue || 'Grand Auditorium';

  const handleGenerate = async () => {
    setLoading(true);
    setSaved(false);

    try {
      const payload = {
        scriptType: workflowType === 'speaker-intro' ? 'Speaker Introduction' : 'Transition Script',
        speakerId: resolvedSpeaker?.id,
        currentActivityId: currentSession?.id || session?.id,
        nextActivityId: nextSession?.id,
        tone,
        audience,
        topic: resolvedSpeaker?.topic || currentSession?.title,
        customNotes: customInstructions
      };

      const res = await api.generateScript(payload);
      setGeneratedScript(res.script);
    } catch (err) {
      console.error(err);
      // Construct fallback context-aware script
      if (workflowType === 'speaker-intro') {
        setGeneratedScript(`[Stage Cue: Stand center stage, smile warmly, look directly at the audience]

"A very warm welcome, esteemed delegates of ${resolvedEventName}!

[Stage Cue: Open hand gesture towards stage left]

It is my distinct privilege to introduce our next keynote speaker: **${resolvedSpeaker?.name || 'our distinguished dignitary'}**, serving as **${resolvedSpeaker?.designation || 'Industry Pioneer'}** at **${resolvedSpeaker?.organization || 'Google'}**.

[Stage Cue: Emphasize key session topic]

Today's presentation explores: *${resolvedSpeaker?.topic || 'Next-Generation Technological Innovations'}*.

[Stage Cue: Lead the audience with enthusiastic applause]

Please join me in giving a rousing round of applause for **${resolvedSpeaker?.name || 'our speaker'}**!"`);
      } else {
        const prevTitle = previousSession?.title || 'the preceding session';
        const currTitle = currentSession?.title || session?.title || 'the current session';
        const nextTitle = nextSession?.title || 'the concluding ceremony';

        setGeneratedScript(`[Stage Cue: Step center stage, maintain high energy and warm posture]

"Thank you, everyone! A tremendous round of applause once again for **${prevTitle}**.

[Stage Cue: Recap and pivot towards the next milestone]

As we keep the momentum going here at ${resolvedEventName}, we are currently transitioning from **${currTitle}** into:
**${nextTitle}**${nextSession?.speaker_name ? ` with **${nextSession.speaker_name}**` : ''}.

[Stage Cue: Direct audience attention to the main stage screen]

Please ensure you are seated as we commence this next session immediately!"`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen, workflowType, speaker?.id, session?.id, currentSession?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    toast.success('Script copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const vocalLines = (generatedScript || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !(l.startsWith('[') && l.endsWith(']')))
      .join(' ')
      .replace(/[*_#"]/g, '');

    if (!vocalLines) return;
    const utterance = new SpeechSynthesisUtterance(vocalLines);
    utterance.rate = tone === 'Energetic' ? 1.05 : 0.98;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  const parsedScript = parseStageScript(generatedScript);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="workflow-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none"
    >
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ─────────────────────────────────────────────────────────────
            MODAL HEADER
            ───────────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="workflow-modal-title" className="text-base font-bold text-slate-900">
                {workflowType === 'speaker-intro'
                  ? 'Generate Stage Speaker Introduction'
                  : 'Generate Session Transition Script'}
              </h3>
              <p className="text-xs text-slate-500">
                AI synthesizes live event context, session timeline & dignitary credentials into stage teleprompter copy
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
            MODAL BODY: CONTEXT CARDS + GENERATED OUTPUT
            ───────────────────────────────────────────────────────────── */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* A. VISUAL CONTEXT CARD (Communicates AI context clearly) */}
          {workflowType === 'speaker-intro' ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                <span>AI Context Synthesis Input</span>
                <span>Active Event: {resolvedEventName}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Speaker */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Speaker</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={getSpeakerAvatar(resolvedSpeaker?.name, resolvedSpeaker?.avatar_url)}
                      alt="Speaker"
                      className="w-6 h-6 rounded-md object-cover"
                    />
                    <span className="font-bold text-slate-900 truncate">{resolvedSpeaker?.name || 'Dignitary'}</span>
                  </div>
                </div>

                {/* Organization */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Organization</span>
                  <span className="font-medium text-slate-800 truncate block">
                    {resolvedSpeaker?.organization || 'Industry Partner'}
                  </span>
                </div>

                {/* Topic */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Keynote Topic</span>
                  <span className="font-medium text-slate-800 truncate block">
                    {resolvedSpeaker?.topic || 'Keynote Presentation'}
                  </span>
                </div>

                {/* Target Audience */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Audience</span>
                  <span className="font-semibold text-indigo-700 truncate block">{audience}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Transition 3-step Bridge Context */
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                <span>Timeline Transition Bridge</span>
                <span>Stage: {resolvedVenue}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Previous */}
                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                    1. PREVIOUS CONCLUDED
                  </span>
                  <p className="font-medium text-slate-700 truncate">
                    {previousSession?.title || 'Keynote Session'}
                  </p>
                </div>

                {/* Current */}
                <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono block mb-1">
                    2. CURRENT IN PROGRESS
                  </span>
                  <p className="font-bold text-indigo-950 truncate">
                    {currentSession?.title || session?.title || 'Project Showcase'}
                  </p>
                </div>

                {/* Next */}
                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono block mb-1">
                    3. NEXT UP ON STAGE
                  </span>
                  <p className="font-medium text-slate-800 truncate">
                    {nextSession?.title || 'Judging & Valedictory'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* B. TONE & PARAMETERS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Tone:</span>
              {['Professional', 'Formal', 'Friendly', 'Energetic'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    tone === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition shadow-sm"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generating...' : 'Regenerate'}</span>
            </button>
          </div>

          {/* C. GENERATED SCRIPT DISPLAY & ACTIONS */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  STAGE SCRIPT
                </span>
                <span className="text-xs font-bold text-slate-800">({tone} Tone)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-1.5 rounded-lg border text-xs transition ${
                    isEditing
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Toggle Edit Mode"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  title="Save to session"
                >
                  {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleToggleSpeech}
                  disabled={!generatedScript}
                  className={`p-1.5 rounded-lg border transition ${
                    isSpeaking
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Practice with audio voice"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (onOpenTeleprompter) onOpenTeleprompter(generatedScript);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Use in Teleprompter</span>
                </button>
              </div>
            </div>

            {/* Script Text Body */}
            {loading ? (
              <div className="h-60 flex flex-col items-center justify-center space-y-2 text-slate-500">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono">Synthesizing stage introduction & cues...</p>
              </div>
            ) : isEditing ? (
              <textarea
                rows={10}
                value={generatedScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                className="w-full p-3 rounded-xl bg-white border border-indigo-300 text-slate-900 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-medium"
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5 text-xs sm:text-sm max-h-64 overflow-y-auto leading-relaxed">
                {parsedScript.map((line, idx) => {
                  if (line.type === 'cue') {
                    return (
                      <div
                        key={idx}
                        className="my-1.5 px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px] font-bold uppercase tracking-wider inline-block"
                      >
                        ⚡ {line.content}
                      </div>
                    );
                  }
                  if (line.type === 'empty') return <div key={idx} className="h-1" />;
                  return (
                    <p key={idx} className="text-slate-800">
                      {line.content}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
