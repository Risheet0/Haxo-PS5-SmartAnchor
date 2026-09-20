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
import LiveStatusBar from '../components/live/LiveStatusBar';
import ControlCenter from '../components/live/ControlCenter';
import AttentionPanel from '../components/live/AttentionPanel';
import SessionHealth from '../components/live/SessionHealth';
import NextSpeakerPrep from '../components/live/NextSpeakerPrep';
import EventTimeline from '../components/live/EventTimeline';
import { formatTimer, getSpeakerAvatar, parseStageScript } from '../utils/formatters';
import { api } from '../services/api';
import { useToast } from '../components/ui/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function LiveControlView({
  event,
  agenda = [],
  speakers = [],
  logs = [],
  announcements = [],
  connected = true,
  isTeleprompterOpen = false,
  isStageDisplayOpen = false,
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
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isConfirmEndOpen, setIsConfirmEndOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  // Current active session index
  const [activeSessionIndex, setActiveSessionIndex] = useState(() => {
    const liveIdx = agenda.findIndex(a => a.status === 'LIVE');
    if (liveIdx !== -1) return liveIdx;
    const upcomingIdx = agenda.findIndex(a => a.status === 'UPCOMING');
    return upcomingIdx !== -1 ? upcomingIdx : 0;
  });

  const currentActivity = agenda[activeSessionIndex] || agenda[0];
  const nextActivity = activeSessionIndex + 1 < agenda.length ? agenda[activeSessionIndex + 1] : null;

  // Real-time Timer Engine with Start/Pause/Resume & Local Storage Persistence
  const durationMins = currentActivity?.duration_minutes || 30;
  const totalDurationSecs = durationMins * 60;
  const [elapsedSecs, setElapsedSecs] = useState(() => {
    if (currentActivity?.id) {
      const saved = localStorage.getItem(`smartstage_elapsed_${currentActivity.id}`);
      if (saved !== null) return parseInt(saved, 10);
    }
    return 18 * 60 + 42;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Sync / persist elapsed time across page refreshes
  useEffect(() => {
    if (currentActivity?.id) {
      const saved = localStorage.getItem(`smartstage_elapsed_${currentActivity.id}`);
      if (saved !== null) setElapsedSecs(parseInt(saved, 10));
    }
  }, [currentActivity?.id]);

  useEffect(() => {
    if (currentActivity?.id) {
      localStorage.setItem(`smartstage_elapsed_${currentActivity.id}`, elapsedSecs.toString());
    }
  }, [currentActivity?.id, elapsedSecs]);

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

  const handleUpdateStatusWithFeedback = async (id, status) => {
    if (isUpdatingStatus || !id) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(id, status);
      if (status === 'LIVE') {
        setIsTimerRunning(true);
        toast.success('Session is now LIVE.');
      } else if (status === 'PAUSED') {
        setIsTimerRunning(false);
        toast.info('Session timer paused.');
      } else if (status === 'COMPLETED') {
        setIsTimerRunning(false);
        toast.success('Session marked COMPLETED.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update session status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleTimer = async () => {
    if (!currentActivity || isUpdatingStatus) return;
    if (isTimerRunning && currentActivity.status === 'LIVE') {
      await handleUpdateStatusWithFeedback(currentActivity.id, 'PAUSED');
    } else {
      await handleUpdateStatusWithFeedback(currentActivity.id, 'LIVE');
    }
  };

  const handleSkipActivity = async () => {
    if (!currentActivity || isUpdatingStatus) return;
    setIsConfirmSkipOpen(false);
    await handleUpdateStatusWithFeedback(currentActivity.id, 'COMPLETED');
    if (nextActivity) {
      await handleUpdateStatusWithFeedback(nextActivity.id, 'LIVE');
      setActiveSessionIndex(activeSessionIndex + 1);
      toast.info(`Moved to next session: "${nextActivity.title}".`);
    }
  };

  const handleConfirmEndSession = async () => {
    if (!currentActivity || isUpdatingStatus) return;
    setIsConfirmEndOpen(false);
    await handleUpdateStatusWithFeedback(currentActivity.id, 'COMPLETED');
  };

  const handleConfirmReset = () => {
    setIsConfirmResetOpen(false);
    setElapsedSecs(0);
    setIsTimerRunning(false);
    toast.info('Session timer reset to 00:00.');
  };

  const handleAdjustDuration = async (deltaMinutes) => {
    if (!currentActivity || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    const currentMins = currentActivity.duration_minutes || 30;
    const newDuration = Math.max(1, currentMins + deltaMinutes);
    try {
      await api.updateAgendaItem(currentActivity.id, { duration_minutes: newDuration });
      toast.info(`Adjusted session duration by ${deltaMinutes > 0 ? '+' : ''}${deltaMinutes}m (${newDuration}m total).`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error adjusting duration:', err);
      toast.error('Failed to adjust session duration.');
    } finally {
      setIsUpdatingStatus(false);
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
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-[1600px] mx-auto select-none animate-fade-in">

      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL BAR: LIVE EVENT STATUS BAR
          ───────────────────────────────────────────────────────────── */}
      <LiveStatusBar
        event={event}
        currentActivity={currentActivity}
        activeSessionIndex={activeSessionIndex}
        totalSessionsCount={agenda.length}
        elapsedSecs={elapsedSecs}
        totalDurationSecs={totalDurationSecs}
        isTimerRunning={isTimerRunning}
        connected={connected}
        onOpenStageDisplay={onOpenStageDisplay}
        onOpenDelay={onOpenDelay}
      />

      {/* DISCONNECTION ALERT BANNER */}
      {!connected && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between text-xs font-medium animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 animate-pulse" />
            <span>
              <strong>CONNECTION LOST:</strong> Reconnecting to real-time stage operations server... Remote telemetry paused.
            </span>
          </div>
          <span className="font-mono text-[10px] text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded font-bold">
            OFFLINE MODE
          </span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          OPERATIONAL CONTROL CENTER (FULL WIDTH)
          ───────────────────────────────────────────────────────────── */}
      <ControlCenter
        isTimerRunning={isTimerRunning}
        currentActivity={currentActivity}
        hasNextSession={Boolean(nextActivity)}
        connected={connected}
        isUpdatingStatus={isUpdatingStatus}
        onToggleTimer={handleToggleTimer}
        onResetTimer={() => setIsConfirmResetOpen(true)}
        onAdjustDuration={handleAdjustDuration}
        onNextSession={() => setIsConfirmSkipOpen(true)}
        onOpenDelay={onOpenDelay}
        onOpenEmergency={onOpenEmergency}
        onOpenTeleprompter={() => onOpenTeleprompter && onOpenTeleprompter(scriptText)}
        onOpenStageDisplay={onOpenStageDisplay}
      />

      {/* ─────────────────────────────────────────────────────────────
          STEP 4 & STEP 5: OPERATIONAL ATTENTION & SESSION HEALTH PANELS
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AttentionPanel
          event={event}
          currentActivity={currentActivity}
          nextActivity={nextActivity}
          elapsedSecs={elapsedSecs}
          totalDurationSecs={totalDurationSecs}
          connected={connected}
          activeAnnouncement={announcements?.find(a => a.is_active === 1)}
          onOpenEmergency={onOpenEmergency}
          onOpenDelay={onOpenDelay}
          onOpenStageDisplay={onOpenStageDisplay}
        />

        <SessionHealth
          connected={connected}
          isTimerRunning={isTimerRunning}
          elapsedSecs={elapsedSecs}
          totalDurationSecs={totalDurationSecs}
          currentActivity={currentActivity}
          scriptText={scriptText}
          isTeleprompterOpen={isTeleprompterOpen}
          isStageDisplayOpen={isStageDisplayOpen}
          onOpenTeleprompter={onOpenTeleprompter}
          onOpenStageDisplay={onOpenStageDisplay}
          onToggleTimer={handleToggleTimer}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STEP 6: NEXT SPEAKER PREPARATION & BACKSTAGE CHECKLIST
          ───────────────────────────────────────────────────────────── */}
      <NextSpeakerPrep
        nextActivity={nextActivity}
        speakers={speakers}
        onSelectNextScript={() => {
          if (nextActivity && activeSessionIndex < agenda.length - 1) {
            setActiveSessionIndex(activeSessionIndex + 1);
            toast.info(`Switched anchor script view to next session: "${nextActivity.title}".`);
          }
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          MASTER 3-COLUMN CONTROL ROOM LAYOUT
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ═════════════════════════════════════════════════════════════
            LEFT COLUMN (4 Cols): CURRENT SESSION & TIMING ENGINE
            ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

            {/* Current Session Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE SESSION
              </span>

              <StatusBadge status={currentActivity?.status || 'LIVE'} size="sm" />
            </div>

            {/* Session Title */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Activity #{currentActivity?.order_index} • {currentActivity?.activity_type}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight mt-1">
                {currentActivity?.title}
              </h2>
              {currentActivity?.notes && (
                <p className="text-xs text-slate-600 mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 leading-relaxed">
                  {currentActivity.notes}
                </p>
              )}
            </div>

            {/* Speaker Card */}
            {currentActivity?.speaker_name ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={getSpeakerAvatar(currentActivity.speaker_name, currentActivity.speaker_avatar)}
                  alt={currentActivity.speaker_name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {currentActivity.speaker_name}
                    </h3>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
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
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Emcee / Anchor Presentation</span>
              </div>
            )}

            {/* Embedded Live Timer System Engine */}
            <LiveTimerEngine
              durationMinutes={currentActivity?.duration_minutes || 30}
              initialElapsedSeconds={18 * 60 + 42}
              isRunning={isTimerRunning}
              onStateChange={({ elapsedSecs: el, remainingSecs: rem, running }) => {
                setElapsedSecs(el);
                setIsTimerRunning(running);
              }}
              onComplete={() => {
                console.log('Session duration reached planned conclusion');
              }}
            />

            {/* Session Action Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Status: <span className="font-bold text-slate-900">{currentActivity?.status || 'LIVE'}</span>
              </span>
              {currentActivity?.status !== 'LIVE' ? (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatusWithFeedback(currentActivity.id, 'LIVE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition active:scale-95 shadow-sm flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START SESSION</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setIsConfirmEndOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs transition active:scale-95 shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>END SESSION</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            CENTER COLUMN (5 Cols): ANCHOR SCRIPT / TELEPROMPTER
            ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col h-full min-h-[560px]">
            
            {/* Script Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  ANCHOR SCRIPT & STAGE CUES
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (activeSessionIndex > 0) setActiveSessionIndex(activeSessionIndex - 1);
                  }}
                  disabled={activeSessionIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 border border-slate-200"
                  title="Previous Session Script"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (activeSessionIndex < agenda.length - 1) setActiveSessionIndex(activeSessionIndex + 1);
                  }}
                  disabled={activeSessionIndex === agenda.length - 1}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 border border-slate-200"
                  title="Next Session Script"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsEditingScript(!isEditingScript)}
                  className={`p-1.5 rounded-lg border text-xs transition ${
                    isEditingScript
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Toggle Edit Mode"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRegenerateScript}
                  disabled={generatingScript}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 shadow-sm"
                  title="Regenerate with AI"
                >
                  <RotateCcw className={`w-4 h-4 ${generatingScript ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleCopyScript}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                  title="Copy Script"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleToggleVoice}
                  className={`p-1.5 rounded-lg border transition ${
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                  title="Launch Big Fullscreen Teleprompter"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Use Live</span>
                </button>
              </div>
            </div>

            {/* Script Display / Editor Surface */}
            <div className="flex-1 py-4 overflow-y-auto">
              {isEditingScript ? (
                <textarea
                  rows={14}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="w-full h-full min-h-[380px] p-4 rounded-xl bg-white border border-indigo-300 text-slate-900 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-medium"
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full min-h-[380px] space-y-3 font-sans">
                  {parsedScript.map((item, idx) => {
                    if (item.type === 'cue') {
                      return (
                        <div
                          key={idx}
                          className="my-2.5 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold uppercase tracking-wider inline-block"
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
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-amber-700 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Amber chips = Stage movements & cues (Do not read aloud)
              </span>
              <span className="font-mono text-slate-400">
                {scriptText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            RIGHT COLUMN (3 Cols): UP NEXT & QUICK OPERATIONS PANEL
            ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* UP NEXT PREVIEW */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5" />
                UP NEXT
              </span>
              {nextActivity && (
                <span className="text-xs font-mono font-bold text-slate-700">
                  {nextActivity.start_time}
                </span>
              )}
            </div>

            {nextActivity ? (
              <div className="space-y-2.5">
                <div>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {nextActivity.activity_type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {nextActivity.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {nextActivity.duration_minutes} min session
                  </p>
                </div>

                {nextActivity.speaker_name && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <img
                      src={getSpeakerAvatar(nextActivity.speaker_name, nextActivity.speaker_avatar)}
                      alt={nextActivity.speaker_name}
                      className="w-7 h-7 rounded-md object-cover"
                    />
                    <div className="text-xs min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{nextActivity.speaker_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{nextActivity.speaker_org}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-2">
                Concludes full event flow.
              </p>
            )}
          </div>

          {/* STAGE ACTIVITY LOG FEED */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Radio className="w-3.5 h-3.5 text-indigo-600" />
                Stage Activity Feed
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{logs.length} events</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="font-bold text-indigo-700 uppercase">{log.action_type || 'SYSTEM'}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-tight font-medium">
                      {log.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-2 font-mono">No stage logs recorded yet.</p>
              )}
            </div>
          </div>

          {/* STAGE NOTE QUICK CUE BUTTON */}
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-indigo-600" />
              <span>+ Add Stage Note / Cue</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Attach Note</span>
          </button>

          {/* MINI STAGE SCHEDULE QUEUE */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                Schedule Queue
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{agenda.length} items</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {agenda.map((item, idx) => {
                const isCurrent = idx === activeSessionIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSessionIndex(idx)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold'
                        : item.status === 'COMPLETED'
                        ? 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate font-mono text-[11px]">
                      #{item.order_index} {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                      {item.start_time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          REAL-TIME EVENT TIMELINE (STEP 3)
          ───────────────────────────────────────────────────────────── */}
      <EventTimeline
        agenda={agenda}
        activeSessionIndex={activeSessionIndex}
        elapsedSecs={elapsedSecs}
        totalDurationSecs={totalDurationSecs}
        currentDelayMinutes={event?.current_delay_minutes || 0}
        onSelectSession={(idx) => setActiveSessionIndex(idx)}
      />

      {/* ─────────────────────────────────────────────────────────────
          STAGE NOTE MODAL
          ───────────────────────────────────────────────────────────── */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Add Stage / Anchor Cue Note</h3>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Cue Note for "{currentActivity?.title}"
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Ensure second handheld microphone is active for live Q&A; play walk-off music immediately after speech."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={savingNote || !noteText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition"
                >
                  {savingNote ? 'Saving...' : 'Attach Stage Note'}
                </button>
              </div>
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
        message={`Are you sure you want to conclude "${currentActivity?.title}" and transition to the next agenda session? This will mark the current session as COMPLETED.`}
        confirmLabel="Advance Session"
      />
      {/* Confirmation dialog for resetting timer */}
      <ConfirmDialog
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Session Timer"
        message={`Are you sure you want to reset the live timer for "${currentActivity?.title}" back to 00:00? This action will reset the elapsed counter.`}
        confirmLabel="Reset Timer"
      />
      {/* Confirmation dialog for concluding session */}
      <ConfirmDialog
        isOpen={isConfirmEndOpen}
        onClose={() => setIsConfirmEndOpen(false)}
        onConfirm={handleConfirmEndSession}
        title="Conclude Active Session"
        message={`Are you sure you want to mark "${currentActivity?.title}" as COMPLETED? Live controls for this session will end and the event schedule will advance.`}
        confirmLabel="Conclude Session"
      />
    </div>
  );
}
