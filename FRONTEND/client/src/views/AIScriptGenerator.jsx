import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Tv,
  Volume2,
  Sliders,
  Bookmark,
  BookmarkCheck,
  Edit3
} from 'lucide-react';
import { api } from '../services/api';
import { parseStageScript } from '../utils/formatters';
import { useToast } from '../components/ui/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';

export default function AIScriptGenerator({
  speakers = [],
  agenda = [],
  initialConfig = null,
  onOpenTeleprompter
}) {
  const toast = useToast();
  const [scriptType, setScriptType] = useState(initialConfig?.scriptType || 'Speaker Introduction');
  const [speakerId, setSpeakerId] = useState(initialConfig?.speakerId || (speakers[0]?.id || ''));
  const [customSpeakerName, setCustomSpeakerName] = useState('');
  const [topic, setTopic] = useState('');
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

  const toneOptions = [
    { id: 'Professional', label: 'Professional' },
    { id: 'Formal', label: 'Formal' },
    { id: 'Friendly', label: 'Friendly' },
    { id: 'Energetic', label: 'Energetic' },
    { id: 'Technical', label: 'Technical' },
    { id: 'Short', label: 'Short' }
  ];

  const scriptTypes = [
    { id: 'Opening Script', label: 'Opening Script' },
    { id: 'Speaker Introduction', label: 'Speaker Intro' },
    { id: 'Transition Script', label: 'Transition' },
    { id: 'Closing Script', label: 'Closing Script' },
    { id: 'Delay Announcement', label: 'Delay Notice' },
    { id: 'Emergency Announcement', label: 'Emergency Notice' }
  ];

  const lengthOptions = [
    { id: 'Short', label: 'Short (~1m)' },
    { id: 'Standard', label: 'Standard (~2-3m)' },
    { id: 'Detailed', label: 'Detailed (~4-5m)' }
  ];

  const audienceOptions = [
    'Tech Community & Developers',
    'University Students & Researchers',
    'Corporate Executives & Sponsors',
    'General Public & Attendees'
  ];

  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.scriptType) setScriptType(initialConfig.scriptType);
      if (initialConfig.speakerId) setSpeakerId(initialConfig.speakerId);
      if (initialConfig.currentActivityId) setCurrentActivityId(initialConfig.currentActivityId);
      if (initialConfig.nextActivityId) setNextActivityId(initialConfig.nextActivityId);
    }
  }, [initialConfig]);

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

    try {
      const res = await api.generateScript({
        scriptType,
        speakerId: speakerId ? Number(speakerId) : null,
        speakerName: customSpeakerName || selectedSpeaker?.name,
        speakerOrg: selectedSpeaker?.organization,
        speakerDesig: selectedSpeaker?.designation,
        speakerBio: selectedSpeaker?.bio,
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
    setSaved(true);
    toast.success('Script saved to event session archive.');
    setTimeout(() => setSaved(false), 2000);
  };

  const selectedSpeaker = speakers.find((s) => s.id === Number(speakerId));
  const parsedScript = parseStageScript(generatedScript);

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & STATUS BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 soft-card">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              AI Stage Script Studio
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Produce structured, pacing-calibrated anchor scripts with physical cue guidance for teleprompter deployment
          </p>
        </div>

        {metadata && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{metadata.provider}</span>
            <span className="text-slate-300">•</span>
            <span>{metadata.wordCount} words (~{metadata.estimatedMinutes}m)</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. STUDIO WORKSPACE: GENERATION FORM + OUTPUT SURFACE
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (5 Cols): CLEAN GENERATION FORM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 soft-card space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Script Configuration
              </h3>
            </div>

            {/* 1. Script Type Selector */}
            <div>
              <label className="soft-label">1. Script Type</label>
              <div className="grid grid-cols-2 gap-2">
                {scriptTypes.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setScriptType(st.id)}
                    className={`p-3 rounded-2xl border text-left text-xs transition ${
                      scriptType === st.id
                        ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate">{st.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Speaker Assignment */}
            {(scriptType === 'Speaker Introduction' || scriptType === 'Transition Script') && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="soft-label">2. Assigned Speaker</label>
                  <select
                    value={speakerId}
                    onChange={(e) => setSpeakerId(e.target.value)}
                    className="soft-select text-xs"
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
                    <label className="soft-label">Custom Speaker Name</label>
                    <input
                      type="text"
                      value={customSpeakerName}
                      onChange={(e) => setCustomSpeakerName(e.target.value)}
                      placeholder="e.g. Dr. A. Sharma"
                      className="soft-input text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3. Session Timeline Routing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="soft-label">Current Session</label>
                <select
                  value={currentActivityId}
                  onChange={(e) => setCurrentActivityId(e.target.value)}
                  className="soft-select text-xs"
                >
                  {agenda.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.order_index} {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="soft-label">Next Session</label>
                <select
                  value={nextActivityId}
                  onChange={(e) => setNextActivityId(e.target.value)}
                  className="soft-select text-xs"
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
            <div className="pt-3 border-t border-slate-100">
              <label className="soft-label">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="soft-select text-xs"
              >
                {audienceOptions.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Delivery Tone Selection */}
            <div className="pt-3 border-t border-slate-100">
              <label className="soft-label">Delivery Tone</label>
              <div className="grid grid-cols-3 gap-1.5">
                {toneOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`py-2 px-2.5 rounded-xl text-center text-xs font-semibold border transition ${
                      tone === t.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Script Length */}
            <div className="pt-3 border-t border-slate-100">
              <label className="soft-label">Script Length</label>
              <div className="grid grid-cols-3 gap-1.5">
                {lengthOptions.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLength(l.id)}
                    className={`py-2 px-1.5 rounded-xl text-center text-xs font-semibold border transition ${
                      length === l.id
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Special Anchor Instructions */}
            <div className="pt-3 border-t border-slate-100">
              <label className="soft-label">Special Talking Points & Cues</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Acknowledge sponsors, remind audience about QR code"
                className="soft-input text-xs"
              />
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full btn-pill-accent text-sm flex items-center justify-center gap-2 py-3"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Composing Script...' : 'GENERATE SCRIPT'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Cols): GENERATED SCRIPT DISPLAY & ACTIONS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 soft-card flex flex-col h-full min-h-[580px] space-y-4">
            
            {/* Header / Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {metadata?.provider || 'Google Gemini AI'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {scriptType} ({tone} Tone)
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-full border transition text-xs ${
                    isEditing
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Edit script directly"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  title="Regenerate"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleCopy}
                  className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleSaveToArchive}
                  className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  title="Save script"
                >
                  {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleToggleSpeech}
                  disabled={!generatedScript}
                  className={`p-2 rounded-full border transition ${
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
                  className="btn-pill-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                  title="Send to stage teleprompter"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Teleprompter</span>
                </button>
              </div>
            </div>

            {/* Generated Script Content Area */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 rounded-2xl bg-purple-50/40 border border-purple-100/80 h-full min-h-[380px] flex flex-col items-center justify-center space-y-4 text-center animate-fade-in">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-3xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 animate-pulse">
                      <Sparkles className="w-7 h-7 animate-spin" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <div className="text-sm font-bold text-slate-900">
                      Generating with Google Gemini AI...
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Synthesizing authentic stage pacing, audience hooks, and live physical cues
                    </p>
                  </div>
                </div>
              ) : !generatedScript ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[380px] p-8 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 space-y-4">
                  <div className="w-14 h-14 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      Ready to Synthesize Stage Script
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Configure your tone, speaker, and length settings on the left, then click <strong className="text-purple-700">"GENERATE SCRIPT"</strong> to compose with live AI.
                    </p>
                  </div>
                </div>
              ) : isEditing ? (
                <textarea
                  rows={14}
                  value={generatedScript}
                  onChange={(e) => setGeneratedScript(e.target.value)}
                  className="w-full h-full min-h-[380px] p-5 rounded-2xl bg-slate-50 border border-indigo-300 text-slate-900 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-normal"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 h-full min-h-[380px] space-y-3 font-sans">
                  {parsedScript.map((line, idx) => {
                    if (line.type === 'cue') {
                      return (
                        <div
                          key={idx}
                          className="my-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold uppercase tracking-wider inline-block"
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
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="text-amber-800 font-medium">
                ⚡ Amber badges denote physical anchor cues (DO NOT READ ALOUD)
              </span>
              <span className="font-mono">
                Pacing: ~130 words/min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
