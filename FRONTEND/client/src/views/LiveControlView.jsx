import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  RotateCcw,
  CheckCircle2,
  Hourglass,
  Sparkles,
  AlertTriangle,
  User,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Edit3,
  Tv,
  Volume2,
  SkipForward,
  MessageSquarePlus,
  StickyNote,
  ListOrdered,
  Layers,
  X
} from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import LiveTimerEngine from '../components/ui/LiveTimerEngine';
import { getSpeakerAvatar, parseStageScript } from '../utils/formatters';
import { api } from '../services/api';
import { useToast } from '../components/ui/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function LiveControlView({
  event,
  agenda = [],
  speakers = [],
  logs = [],
  onUpdateStatus,
  onOpenDelay,
  onOpenEmergency,
  onGenerateScript,
  onOpenTeleprompter,
  onOpenStageDisplay,
  onRefresh
}) {
  const toast = useToast();
  const [isConfirmSkipOpen, setIsConfirmSkipOpen] = useState(false);
  const [activeSessionIndex, setActiveSessionIndex] = useState(() => {
    const liveIdx = agenda.findIndex(a => a.status === 'LIVE');
    if (liveIdx !== -1) return liveIdx;
    const upcomingIdx = agenda.findIndex(a => a.status === 'UPCOMING');
    return upcomingIdx !== -1 ? upcomingIdx : 0;
  });

  const currentActivity = agenda[activeSessionIndex] || agenda[0];
  const nextActivity = activeSessionIndex + 1 < agenda.length ? agenda[activeSessionIndex + 1] : null;

  const durationMins = currentActivity?.duration_minutes || 30;
  const totalDurationSecs = durationMins * 60;
  const [elapsedSecs, setElapsedSecs] = useState(18 * 60 + 42);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSecs(prev => (prev < totalDurationSecs ? prev + 1 : prev));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, totalDurationSecs]);

  // Anchor Script State & Controls
  const [scriptText, setScriptText] = useState('');
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);

  // Quick Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (currentActivity) {
      const speakerName = currentActivity.speaker_name || 'Esteemed Guest';
      const speakerOrg = currentActivity.speaker_org || 'Tech Industry';
      const speakerTopic = currentActivity.speaker_topic || currentActivity.title;

      const defaultScript = `[Stage Cue: Stand center stage, smile warmly, look directly at audience]

"A very warm welcome, ladies and gentlemen! We are thrilled to introduce our next session: **${currentActivity.title}**.

[Stage Cue: Turn towards stage left to acknowledge the speaker]

Joining us on stage today is **${speakerName}**, representing **${speakerOrg}**. With profound experience in this domain, today's session will dive deep into:
*${speakerTopic}*.

[Stage Cue: Lead the audience with applause]

Please join me in giving a tremendous round of applause for **${speakerName}**!"`;

      setScriptText(defaultScript);
    }
  }, [currentActivity?.id]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateScript = async () => {
    if (!currentActivity) return;
    setGeneratingScript(true);
    try {
      const res = await api.generateScript({
        scriptType: currentActivity.speaker_name ? 'Speaker Introduction' : 'Transition',
        speakerId: currentActivity.speaker_id,
        currentActivityId: currentActivity.id,
        nextActivityId: nextActivity?.id,
        tone: 'Professional',
        customNotes: currentActivity.notes || ''
      });
      setScriptText(res.script);
      toast.ai('Stage script generated for live session.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate live stage script.');
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const vocalLines = (scriptText || '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !(line.startsWith('[') && line.endsWith(']')))
      .join(' ')
      .replace(/[*_#"]/g, '');

    if (!vocalLines) return;
    const utterance = new SpeechSynthesisUtterance(vocalLines);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSkipActivity = async () => {
    if (!currentActivity) return;
    setIsConfirmSkipOpen(false);
    await onUpdateStatus(currentActivity.id, 'COMPLETED');
    toast.success(`"${currentActivity.title}" marked completed.`);
    if (nextActivity) {
      await onUpdateStatus(nextActivity.id, 'LIVE');
      setActiveSessionIndex(activeSessionIndex + 1);
      toast.info(`Moved to next session: "${nextActivity.title}".`);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !currentActivity) return;
    setSavingNote(true);
    try {
      await api.updateAgendaItem(currentActivity.id, {
        notes: currentActivity.notes ? `${currentActivity.notes} | ${noteText}` : noteText
      });
      setIsNoteModalOpen(false);
      setNoteText('');
      toast.success('Stage note attached to session.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to attach stage note.');
    } finally {
      setSavingNote(false);
    }
  };

  const parsedScript = parseStageScript(scriptText);

  if (agenda.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState
          icon={Radio}
          title="NO LIVE SESSIONS IN RUN-OF-SHOW"
          description="Create your event agenda items in the Agenda Manager or Setup Wizard to begin live stage control and prompt routing."
          actionLabel="Open Agenda Manager"
          onAction={() => onRefresh && onRefresh()}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] mx-auto select-none animate-fade-in">

      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL BAR: SESSION NAVIGATION & GLOBAL HUD
          ───────────────────────────────────────────────────────────── */}
      <div className="p-5 soft-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Stage Master Console
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                SESSION #{currentActivity?.order_index || 1} OF {agenda.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live event operations, real-time anchor prompting, and delay cascading
            </p>
          </div>
        </div>

        {/* Global Shortcut Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenStageDisplay}
            className="btn-pill-secondary text-xs flex items-center gap-1.5"
            title="Open Fullscreen Projector Confidence Monitor"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-600" />
            <span>Confidence HUD</span>
          </button>

          <button
            onClick={() => onOpenDelay({ targetActivityId: currentActivity?.id })}
            className="btn-pill-secondary text-xs flex items-center gap-1.5 text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200"
          >
            <Hourglass className="w-3.5 h-3.5 text-amber-600" />
            <span>+10m Delay</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MASTER 3-COLUMN CONTROL ROOM LAYOUT
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ═════════════════════════════════════════════════════════════
            LEFT COLUMN (4 Cols): CURRENT SESSION & TIMING ENGINE
            ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 soft-card space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />

            {/* Current Session Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Session
              </span>

              <StatusBadge status={currentActivity?.status || 'LIVE'} size="sm" />
            </div>

            {/* Session Title */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400">
                Activity #{currentActivity?.order_index} • {currentActivity?.activity_type}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug mt-1">
                {currentActivity?.title}
              </h3>
              {currentActivity?.notes && (
                <p className="text-xs text-slate-600 mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 leading-relaxed font-normal">
                  {currentActivity.notes}
                </p>
              )}
            </div>

            {/* Speaker Card */}
            {currentActivity?.speaker_name ? (
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-150 flex items-center gap-3.5">
                <img
                  src={getSpeakerAvatar(currentActivity.speaker_name, currentActivity.speaker_avatar)}
                  alt={currentActivity.speaker_name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white flex-shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {currentActivity.speaker_name}
                    </h4>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ON STAGE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {currentActivity.speaker_designation} • {currentActivity.speaker_org}
                  </p>
                  {currentActivity.speaker_topic && (
                    <p className="text-xs text-indigo-700 font-medium truncate mt-0.5">
                      Topic: "{currentActivity.speaker_topic}"
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Emcee / Anchor Presentation</span>
              </div>
            )}

            {/* Embedded Live Timer System Engine */}
            <LiveTimerEngine
              durationMinutes={currentActivity?.duration_minutes || 30}
              initialElapsedSeconds={18 * 60 + 42}
              isRunning={isTimerRunning}
              onStateChange={({ elapsedSecs: el, running }) => {
                setElapsedSecs(el);
                setIsTimerRunning(running);
              }}
            />

            {/* Critical Operations Action Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {currentActivity?.status !== 'LIVE' ? (
                  <button
                    onClick={() => onUpdateStatus(currentActivity.id, 'LIVE')}
                    className="btn-pill-accent text-xs flex items-center justify-center gap-1.5 py-2.5"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>START</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(currentActivity.id, 'COMPLETED')}
                    className="btn-pill-danger text-xs flex items-center justify-center gap-1.5 py-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>END SESSION</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenDelay({ targetActivityId: currentActivity.id })}
                  className="btn-pill-secondary text-xs flex items-center justify-center gap-1.5 text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200 py-2.5"
                >
                  <Hourglass className="w-4 h-4 text-amber-600" />
                  <span>ADD DELAY</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            CENTER COLUMN (5 Cols): ANCHOR SCRIPT / TELEPROMPTER
            ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          <div className="p-6 soft-card flex flex-col h-full min-h-[580px] space-y-4">
            
            {/* Script Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Anchor Script & Stage Cues
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (activeSessionIndex > 0) setActiveSessionIndex(activeSessionIndex - 1);
                  }}
                  disabled={activeSessionIndex === 0}
                  className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 border border-slate-200"
                  title="Previous Session Script"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (activeSessionIndex < agenda.length - 1) setActiveSessionIndex(activeSessionIndex + 1);
                  }}
                  disabled={activeSessionIndex === agenda.length - 1}
                  className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 border border-slate-200"
                  title="Next Session Script"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsEditingScript(!isEditingScript)}
                  className={`p-2 rounded-full border text-xs transition ${
                    isEditingScript
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Toggle Edit Mode"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRegenerateScript}
                  disabled={generatingScript}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 shadow-sm"
                  title="Regenerate with AI"
                >
                  <RotateCcw className={`w-4 h-4 ${generatingScript ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleCopyScript}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                  title="Copy Script"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-full border transition ${
                    isSpeaking
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Voice Rehearsal"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenTeleprompter(scriptText)}
                  className="btn-pill-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                  title="Launch Big Fullscreen Teleprompter"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Use Live</span>
                </button>
              </div>
            </div>

            {/* Script Display / Editor Surface */}
            <div className="flex-1 overflow-y-auto">
              {isEditingScript ? (
                <textarea
                  rows={14}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="w-full h-full min-h-[380px] p-4 rounded-2xl bg-white border border-indigo-300 text-slate-900 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-medium"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 h-full min-h-[380px] space-y-3 font-sans">
                  {parsedScript.map((item, idx) => {
                    if (item.type === 'cue') {
                      return (
                        <div
                          key={idx}
                          className="my-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider inline-block"
                        >
                          ⚡ {item.content}
                        </div>
                      );
                    }
                    if (item.type === 'empty') {
                      return <div key={idx} className="h-2" />;
                    }
                    return (
                      <p key={idx} className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed">
                        {item.content}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend info */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Amber chips = Stage movements & cues (Do not read aloud)
              </span>
              <span className="font-mono">
                {scriptText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            RIGHT COLUMN (3 Cols): UP NEXT & QUICK OPERATIONS PANEL
            ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* UP NEXT PREVIEW */}
          <div className="p-6 soft-card space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5" />
                Up Next
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
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {nextActivity.activity_type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                    {nextActivity.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {nextActivity.duration_minutes} min session
                  </p>
                </div>

                {nextActivity.speaker_name && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <img
                      src={getSpeakerAvatar(nextActivity.speaker_name, nextActivity.speaker_avatar)}
                      alt={nextActivity.speaker_name}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                    <div className="text-xs min-w-0">
                      <p className="font-bold text-slate-900 truncate">{nextActivity.speaker_name}</p>
                      <p className="text-slate-500 truncate">{nextActivity.speaker_org}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">
                Concludes full event flow.
              </p>
            )}
          </div>

          {/* CRITICAL QUICK ACTIONS PANEL */}
          <div className="p-6 soft-card space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Quick Actions
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onOpenDelay({ targetActivityId: currentActivity?.id })}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition"
              >
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-amber-600" />
                  <span>+ Delay Schedule</span>
                </div>
                <span className="text-[10px] font-mono">+5m/+10m</span>
              </button>

              <button
                onClick={onOpenEmergency}
                className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition"
              >
                <div className="flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-blue-600" />
                  <span>+ Announcement</span>
                </div>
                <span className="text-[10px] font-mono">AI Memo</span>
              </button>

              <button
                onClick={onOpenEmergency}
                className="flex items-center justify-between p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>+ Emergency Alert</span>
                </div>
                <span className="text-[10px] font-mono">Broadcast</span>
              </button>

              <button
                onClick={() => setIsConfirmSkipOpen(true)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <SkipForward className="w-4 h-4 text-slate-400" />
                  <span>Next Session</span>
                </div>
                <span className="text-[10px] font-mono">Next &rarr;</span>
              </button>

              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-indigo-600" />
                  <span>+ Stage Note</span>
                </div>
                <span className="text-[10px] font-mono">Cue</span>
              </button>
            </div>
          </div>

          {/* MINI STAGE SCHEDULE QUEUE */}
          <div className="p-6 soft-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                Schedule Queue
              </span>
              <span className="text-xs text-slate-400 font-mono">{agenda.length} items</span>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {agenda.map((item, idx) => {
                const isCurrent = idx === activeSessionIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSessionIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-slate-900 text-white font-bold shadow-sm'
                        : item.status === 'COMPLETED'
                        ? 'bg-slate-50 border border-slate-100 text-slate-400 opacity-60'
                        : 'bg-white border border-slate-100 text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">
                      #{item.order_index} {item.title}
                    </span>
                    <span className={`text-[10px] font-mono flex-shrink-0 ${isCurrent ? 'text-slate-300' : 'text-slate-400'}`}>
                      {item.start_time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STAGE NOTE MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Add Stage / Anchor Cue Note</h3>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="soft-label">
                Cue Note for "{currentActivity?.title}"
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Ensure second handheld microphone is active for live Q&A; play walk-off music immediately after speech."
                className="soft-input resize-none"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="btn-pill-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={savingNote || !noteText.trim()}
                className="btn-pill-primary text-xs"
              >
                {savingNote ? 'Saving...' : 'Attach Stage Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation dialog for advancing / skipping to next session */}
      <ConfirmDialog
        isOpen={isConfirmSkipOpen}
        onClose={() => setIsConfirmSkipOpen(false)}
        onConfirm={handleSkipActivity}
        title="Advance to Next Session"
        message={`Are you sure you want to conclude "${currentActivity?.title}" and immediately transition to the next agenda session?`}
        confirmLabel="Advance Session"
      />
    </div>
  );
}
