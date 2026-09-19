import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Tv,
  Volume2,
  Clock,
  Mic2,
  Sliders,
  Send,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Edit3,
  Layers,
  FileText,
  User,
  Radio,
  Share2,
  ListOrdered
} from 'lucide-react';
import { api } from '../services/api';
import { parseStageScript } from '../utils/formatters';
import { useToast } from '../components/ui/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';

export default function AIScriptGenerator({
  event,
  speakers = [],
  agenda = [],
  initialConfig = null,
  onOpenTeleprompter
}) {
  const toast = useToast();
  // Script Config State
  const [scriptType, setScriptType] = useState(initialConfig?.scriptType || 'Speaker Introduction');
  const [speakerId, setSpeakerId] = useState(initialConfig?.speakerId || (speakers[0]?.id || ''));
  const [customSpeakerName, setCustomSpeakerName] = useState('');
  const [topic, setTopic] = useState('');
  const [prevActivityId, setPrevActivityId] = useState('');
  const [currentActivityId, setCurrentActivityId] = useState(initialConfig?.currentActivityId || (agenda[1]?.id || ''));
  const [nextActivityId, setNextActivityId] = useState(initialConfig?.nextActivityId || (agenda[2]?.id || ''));
  const [audience, setAudience] = useState('Tech Community & Developers');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Standard');
  const [customNotes, setCustomNotes] = useState('');

  // Generation Output State
  const [generatedScript, setGeneratedScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Saved Script Archive
  const [savedScripts, setSavedScripts] = useState([]);

  // Tone Options
  const toneOptions = [
    { id: 'Professional', label: 'Professional', desc: 'Balanced, authoritative conference cadence' },
    { id: 'Formal', label: 'Formal', desc: 'Dignified protocol, ceremonial stage tone' },
    { id: 'Friendly', label: 'Friendly', desc: 'Warm, conversational community connection' },
    { id: 'Energetic', label: 'Energetic', desc: 'High enthusiasm, hackathon/keynote kickoff' },
    { id: 'Technical', label: 'Technical', desc: 'Precise terminology, domain-focused' },
    { id: 'Short', label: 'Short', desc: 'Concise, rapid transition with minimal filler' }
  ];

  // Script Types
  const scriptTypes = [
    { id: 'Opening Script', label: 'Opening Script', desc: 'Event inauguration, welcome remarks & stage introduction' },
    { id: 'Speaker Introduction', label: 'Speaker Introduction', desc: 'Dignitary bio, session topic, and stage handover' },
    { id: 'Transition Script', label: 'Transition Script', desc: 'Bridge between sessions with recap and stage cue' },
    { id: 'Closing Script', label: 'Closing Script', desc: 'Valedictory remarks, thank yous & event wrap-up' },
    { id: 'Delay Announcement', label: 'Delay Announcement', desc: 'Diplomatic public notice regarding schedule adjustment' },
    { id: 'Emergency Announcement', label: 'Emergency Announcement', desc: 'Urgent stage notice transformed from organizer memo' }
  ];

  // Length Options
  const lengthOptions = [
    { id: 'Short', label: 'Short', desc: '~1 min (100-130 words)' },
    { id: 'Standard', label: 'Standard', desc: '~2-3 min (220-280 words)' },
    { id: 'Detailed', label: 'Detailed', desc: '~4-5 min (380-450 words)' }
  ];

  // Audiences
  const audienceOptions = [
    'Tech Community & Developers',
    'University Students & Researchers',
    'Corporate Executives & Sponsors',
    'General Public & Attendees'
  ];

  // Sync initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.scriptType) setScriptType(initialConfig.scriptType);
      if (initialConfig.speakerId) setSpeakerId(initialConfig.speakerId);
      if (initialConfig.currentActivityId) setCurrentActivityId(initialConfig.currentActivityId);
      if (initialConfig.nextActivityId) setNextActivityId(initialConfig.nextActivityId);
    }
  }, [initialConfig]);

  // Audio Speech Rehearsal handler
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
      .map((line) => line.trim())
      .filter((line) => line && !(line.startsWith('[') && line.endsWith(']')))
      .join(' ')
      .replace(/[*_#"]/g, '');

    if (!vocalLines) return;
    const utterance = new SpeechSynthesisUtterance(vocalLines);
    utterance.rate = tone === 'Energetic' ? 1.05 : tone === 'Formal' ? 0.92 : 0.98;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setSaved(false);

    const selectedSpeaker = speakers.find((s) => s.id === Number(speakerId));
    const activeCurrent = agenda.find((a) => a.id === Number(currentActivityId));
    const activeNext = agenda.find((a) => a.id === Number(nextActivityId));

    try {
      const res = await api.generateScript({
        scriptType,
        speakerId: speakerId ? Number(speakerId) : null,
        currentActivityId: currentActivityId ? Number(currentActivityId) : null,
        nextActivityId: nextActivityId ? Number(nextActivityId) : null,
        tone,
        audience,
        length,
        topic: topic || selectedSpeaker?.topic || activeCurrent?.title,
        customNotes
      });

      setGeneratedScript(res.script);
      const words = res.script.split(/\s+/).filter(Boolean).length;
      setMetadata({
        provider: res.provider || 'Stage Prompt Generator',
        wordCount: words,
        estimatedMinutes: Math.max(1, Math.ceil(words / 130)),
        generatedAt: new Date().toLocaleTimeString()
      });
      toast.ai('Stage script generated successfully.');
    } catch (err) {
      console.error('AI script generation error:', err);
      // Construct fallback prompt
      const fallbackSpeaker = selectedSpeaker?.name || customSpeakerName || 'Special Guest';
      const fallbackTopic = topic || activeCurrent?.title || 'Keynote Session';

      const localOutput = `[Stage Cue: Stand center stage, smile warmly, make direct eye contact with audience]

"A very warm welcome, esteemed guests and delegates!

[Stage Cue: Open hand gesture towards stage screen]

We are delighted to transition to our next session: **${fallbackTopic}**.

[Stage Cue: Turn to stage left to introduce the speaker]

Please join me in welcoming **${fallbackSpeaker}**${selectedSpeaker?.organization ? ` from **${selectedSpeaker.organization}**` : ''} to the stage!

[Stage Cue: Lead the audience with enthusiastic applause]"`;

      setGeneratedScript(localOutput);
      const words = localOutput.split(/\s+/).filter(Boolean).length;
      setMetadata({
        provider: 'Stage Prompt Engine (Offline Fallback)',
        wordCount: words,
        estimatedMinutes: 1,
        generatedAt: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate default script on first mount
  useEffect(() => {
    if (!generatedScript) {
      handleGenerate();
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    toast.success('Script copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToArchive = () => {
    if (!generatedScript) return;
    const newEntry = {
      id: Date.now(),
      scriptType,
      tone,
      script: generatedScript,
      timestamp: new Date().toLocaleTimeString()
    };
    setSavedScripts((prev) => [newEntry, ...prev.slice(0, 9)]);
    setSaved(true);
    toast.success('Script saved to event session archive.');
    setTimeout(() => setSaved(false), 2000);
  };

  const selectedSpeaker = speakers.find((s) => s.id === Number(speakerId));
  const parsedScript = parseStageScript(generatedScript);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & STATUS BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AI Stage Script Studio
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Produce structured, pacing-calibrated anchor scripts with physical cue guidance for teleprompter deployment
          </p>
        </div>

        {metadata && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">{metadata.provider}</span>
            <span className="text-slate-300">•</span>
            <span>{metadata.wordCount} words (~{metadata.estimatedMinutes}m)</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. STUDIO WORKSPACE: GENERATION FORM + OUTPUT SURFACE
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ═════════════════════════════════════════════════════════════
            LEFT COLUMN (5 Cols): CLEAN GENERATION FORM
            ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Script Configuration
              </h3>
            </div>

            {/* 1. Script Type Selector */}
            <div>
              <label className="stage-label">1. Script Type</label>
              <div className="grid grid-cols-2 gap-2">
                {scriptTypes.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setScriptType(st.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      scriptType === st.id
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="truncate">{st.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Speaker & Topic Assignment */}
            {(scriptType === 'Speaker Introduction' || scriptType === 'Transition Script') && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="stage-label">2. Speaker / Dignitary</label>
                  <select
                    value={speakerId}
                    onChange={(e) => setSpeakerId(e.target.value)}
                    className="stage-select"
                  >
                    <option value="">-- Custom / No Specific Speaker --</option>
                    {speakers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.organization})
                      </option>
                    ))}
                  </select>
                </div>

                {!speakerId && (
                  <div>
                    <label className="stage-label">Custom Speaker Name</label>
                    <input
                      type="text"
                      value={customSpeakerName}
                      onChange={(e) => setCustomSpeakerName(e.target.value)}
                      placeholder="e.g. Dr. A. Sharma"
                      className="stage-input"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3. Session Timeline Routing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="stage-label">Current Session</label>
                <select
                  value={currentActivityId}
                  onChange={(e) => setCurrentActivityId(e.target.value)}
                  className="stage-select"
                >
                  {agenda.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.order_index} {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="stage-label">Next Session</label>
                <select
                  value={nextActivityId}
                  onChange={(e) => setNextActivityId(e.target.value)}
                  className="stage-select"
                >
                  <option value="">-- Final Session --</option>
                  {agenda.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.order_index} {a.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Audience Target */}
            <div className="pt-2 border-t border-slate-100">
              <label className="stage-label">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="stage-select"
              >
                {audienceOptions.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Delivery Tone Selection */}
            <div className="pt-2 border-t border-slate-100">
              <label className="stage-label">Delivery Tone</label>
              <div className="grid grid-cols-3 gap-1.5">
                {toneOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-2 rounded-xl text-center text-xs font-semibold border transition ${
                      tone === t.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Script Length */}
            <div className="pt-2 border-t border-slate-100">
              <label className="stage-label">Script Length</label>
              <div className="grid grid-cols-3 gap-1.5">
                {lengthOptions.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLength(l.id)}
                    className={`p-2 rounded-xl text-center text-xs font-semibold border transition ${
                      length === l.id
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Special Anchor Instructions */}
            <div className="pt-2 border-t border-slate-100">
              <label className="stage-label">Special Talking Points & Sponsor Mentions</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Acknowledge hackathon sponsors, remind audience about feedback QR"
                className="stage-input"
              />
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold tracking-wide shadow-sm transition active:scale-98 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Composing Script...' : 'GENERATE SCRIPT'}</span>
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            RIGHT COLUMN (7 Cols): GENERATED SCRIPT DISPLAY & ACTIONS
            ═════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col h-full min-h-[580px]">
            
            {/* Header / Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI GENERATED
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {scriptType} ({tone} Tone)
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-1.5 rounded-lg border transition text-xs font-semibold ${
                    isEditing
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Edit script directly"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  title="Regenerate"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleSaveToArchive}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  title="Save script"
                >
                  {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleToggleSpeech}
                  disabled={!generatedScript}
                  className={`p-1.5 rounded-lg border transition ${
                    isSpeaking
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Voice Rehearsal"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (onOpenTeleprompter && generatedScript) {
                      onOpenTeleprompter(generatedScript);
                      toast.info('Script loaded into stage teleprompter.');
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                  title="Send to stage teleprompter"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Send to Teleprompter</span>
                </button>
              </div>
            </div>

            {/* Generated Script Content Area */}
            <div className="flex-1 py-4 overflow-y-auto">
              {loading ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full min-h-[380px] space-y-4 font-sans">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-32 h-6" />
                    <Skeleton className="w-20 h-6" />
                  </div>
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-5/6 h-4" />
                  <Skeleton className="w-4/5 h-4" />
                  <Skeleton className="w-28 h-6 my-2" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-11/12 h-4" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              ) : isEditing ? (
                <textarea
                  rows={14}
                  value={generatedScript}
                  onChange={(e) => setGeneratedScript(e.target.value)}
                  className="w-full h-full min-h-[380px] p-4 rounded-xl bg-slate-50 border border-indigo-300 text-slate-900 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-normal"
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full min-h-[380px] space-y-3 font-sans">
                  {parsedScript.map((line, idx) => {
                    if (line.type === 'cue') {
                      return (
                        <div
                          key={idx}
                          className="my-2.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold uppercase tracking-wider inline-block"
                        >
                          ⚡ {line.content}
                        </div>
                      );
                    }
                    if (line.type === 'empty') return <div key={idx} className="h-2" />;
                    return (
                      <p key={idx} className="text-slate-800 text-sm sm:text-base font-normal leading-relaxed">
                        {line.content}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Telemetry Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-amber-800 font-medium">
                ⚡ Amber badges denote physical anchor cues (DO NOT READ ALOUD)
              </span>
              <span className="font-mono text-slate-500">
                Pacing: ~130 words/min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
