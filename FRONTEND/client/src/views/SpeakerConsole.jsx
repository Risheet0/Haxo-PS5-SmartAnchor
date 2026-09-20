import React, { useState } from 'react';
import SasmLogo from '../components/SasmLogo';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Tv,
  Volume2,
  Copy,
  Check,
  Building,
  Bell,
  CheckCircle2,
  LogOut,
  Radio,
  FileText
} from 'lucide-react';
import { getSpeakerAvatar, parseStageScript } from '../utils/formatters';

export default function SpeakerConsole({
  event,
  agenda = [],
  speakers = [],
  announcements = [],
  currentUser,
  onLogout,
  onOpenTeleprompter
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Find this speaker's profile from the speakers list by email or name
  const currentSpeaker =
    speakers.find(
      (s) =>
        s.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
        s.name?.toLowerCase() === currentUser?.name?.toLowerCase()
    ) || {
      id: currentUser?.id,
      name: currentUser?.name || 'Risheet',
      email: currentUser?.email || 'risheet@example.com',
      designation: 'Featured Keynote Speaker',
      organization: currentUser?.organization || 'TechFest 2026',
      topic: 'AI & Next-Gen Universal Event Architectures',
      bio: 'Pioneering software engineer and technology leader presenting keynote at TechFest 2026.'
    };

  // Find assigned agenda session
  const assignedSession = agenda.find(
    (a) =>
      a.speaker_id === currentSpeaker.id ||
      a.speaker_name?.toLowerCase() === currentSpeaker.name?.toLowerCase()
  ) || agenda[0] || {
    id: 1,
    title: 'Keynote Address: AI & Next-Gen Event Operations',
    start_time: '10:00 AM',
    end_time: '11:00 AM',
    room: 'Main Auditorium',
    status: 'UPCOMING'
  };

  const introScript = `[Stage Cue: Stand center stage, smile warmly, look directly at audience]

"A very warm welcome, delegates and guests! It is our distinct honor to welcome **${currentSpeaker.name}** to the stage.

[Stage Cue: Acknowledge the speaker with an open hand gesture]

Serving as **${currentSpeaker.designation || 'Keynote Speaker'}** at **${currentSpeaker.organization || 'TechFest 2026'}**, today's session will explore:
*${currentSpeaker.topic || assignedSession.title}*.

[Stage Cue: Lead the audience with applause]

Please give an enthusiastic round of applause for **${currentSpeaker.name}**!"`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(introScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    const vocalLines = (introScript || '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !(line.startsWith('[') && line.endsWith(']')))
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans select-none flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SasmLogo size="sm" />
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">
            SPEAKER CONSOLE
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            • {event?.name || 'TechFest 2026'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-200">{currentSpeaker.name}</p>
            <p className="text-[10px] font-mono text-slate-400">{currentSpeaker.email}</p>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Banner Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <img
                src={getSpeakerAvatar(currentSpeaker.name, currentSpeaker.avatar_url)}
                alt={currentSpeaker.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-lg bg-slate-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                    Authenticated Speaker Account
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Welcome, {currentSpeaker.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
                  {currentSpeaker.designation || 'Speaker'} • {currentSpeaker.organization || 'TechFest 2026'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Assigned Event Console
                </span>
                <span className="text-sm font-bold text-indigo-300">
                  {event?.name || 'TechFest 2026'}
                </span>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  {event?.venue || 'Grand Convention Center, Ahmedabad'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Assigned Session & Intro Script (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Session Card */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Assigned Stage Session</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    assignedSession.status === 'LIVE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                      : assignedSession.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {assignedSession.status || 'UPCOMING'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white leading-snug">
                  {assignedSession.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {assignedSession.start_time} - {assignedSession.end_time}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    {assignedSession.room || 'Main Auditorium'}
                  </span>
                </div>
              </div>

              {currentSpeaker.topic && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Keynote Topic
                  </span>
                  <p className="text-slate-200 font-medium">"{currentSpeaker.topic}"</p>
                </div>
              )}
            </div>

            {/* AI Intro Script & Teleprompter Card */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Stage Introduction & Teleprompter Script</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Copy Script"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleToggleVoice}
                    className={`p-2 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                      isSpeaking
                        ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                    title="Voice Rehearsal"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenTeleprompter && onOpenTeleprompter(introScript)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Launch Teleprompter</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs leading-relaxed space-y-2 font-mono text-slate-300 max-h-60 overflow-y-auto">
                {parseStageScript(introScript).map((line, idx) => {
                  if (line.type === 'cue') {
                    return (
                      <div
                        key={idx}
                        className="my-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider inline-block"
                      >
                        ⚡ {line.content}
                      </div>
                    );
                  }
                  if (line.type === 'empty') return <div key={idx} className="h-1" />;
                  return (
                    <p key={idx} className="text-slate-200">
                      {line.content}
                    </p>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Full Event Schedule (1 col) */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>TechFest 2026 Schedule</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 font-mono text-xs">
                {agenda.map((item) => {
                  const isMySession =
                    item.speaker_id === currentSpeaker.id ||
                    item.speaker_name?.toLowerCase() === currentSpeaker.name?.toLowerCase();

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isMySession
                          ? 'bg-indigo-950/60 border-indigo-600/50 shadow-md'
                          : 'bg-slate-900/60 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-indigo-400">#{item.order_index} {item.start_time}</span>
                        {isMySession && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                            YOUR SESSION
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs leading-snug">{item.title}</h4>
                      {item.speaker_name && (
                        <p className="text-[11px] text-slate-400 mt-1">Speaker: {item.speaker_name}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
