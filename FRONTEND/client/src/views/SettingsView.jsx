import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Volume2,
  RotateCcw,
  Check,
  Monitor,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  ClipboardList
} from 'lucide-react';
import { api } from '../services/api';
import RegistrationFormBuilder from '../components/RegistrationFormBuilder';

export default function SettingsView({ event, onRefresh }) {
  const [activeTab, setActiveTab] = useState('registration'); // default to registration tab or system
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [geminiKey, setGeminiKey] = useState(
    () => (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) || import.meta.env.VITE_GEMINI_API_KEY || ''
  );
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const handleTestVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Audio calibration check. Stage teleprompter and anchor voice synthesizer online.');
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    window.speechSynthesis.speak(utterance);
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset the entire stage database back to the default "TechFest 2026" demo setup? (This will restore default speakers, agenda, and clear test delays)')) {
      return;
    }
    setResetting(true);
    setSuccessMessage('');
    try {
      await api.resetDemoData();
      setSuccessMessage('TechFest 2026 demo data restored successfully!');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 soft-card">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Operations & AV Console Settings
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure stage monitor parameters, speech synthesis rehearsal engine, and demo data state
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="btn-pill-secondary text-xs flex items-center gap-2"
          title="Restore original demo state"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset Demo State'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in font-semibold shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/70">
        <button
          type="button"
          onClick={() => setActiveTab('registration')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'registration'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-indigo-600" />
          <span>Registration Form & Intake</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'system'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-indigo-600" />
          <span>AV & Rehearsal Systems</span>
        </button>
      </div>

      {activeTab === 'registration' && (
        <div className="animate-fade-in">
          <RegistrationFormBuilder eventId={event?.id || 1} />
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {/* Voice Synthesizer & Teleprompter Settings */}
        <div className="p-6 soft-card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Speech Synthesis Rehearsal
            </h3>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-700 font-semibold mb-2">
              <span>Voice Pacing / Rate</span>
              <span className="font-mono text-indigo-700 font-bold">{speechRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-700 font-semibold mb-2">
              <span>Voice Pitch</span>
              <span className="font-mono text-indigo-700 font-bold">{speechPitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleTestVoice}
              className="w-full btn-pill-secondary text-xs flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-indigo-600" />
              <span>Test Audio Playback</span>
            </button>
          </div>
        </div>

        {/* Confidence Monitor & Hardware HUD */}
        <div className="p-6 soft-card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Monitor className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Display & Projection
            </h3>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold block text-slate-900">Confidence Monitor HUD</span>
                <span className="text-slate-500 text-[11px]">Large-format projector timer & current speaker</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ready
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold block text-slate-900">Audio Chime On Emergency</span>
                <span className="text-slate-500 text-[11px]">Play subtle stage cue tone on broadcast alert</span>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  soundAlerts ? 'bg-slate-900' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    soundAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Google Gemini AI Cloud Integration */}
        <div className="p-6 soft-card space-y-5 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Google Gemini AI Cloud Engine
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Active
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Smart Anchor connects directly to Google Gemini AI to generate live stage cues and professional anchor dialogue with real-time context. When offline or without a key, it automatically uses the built-in local engine.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <span>Gemini API Key</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... or AQ.Ab8..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('gemini_api_key', geminiKey.trim());
                  }
                  setKeySaved(true);
                  setTimeout(() => setKeySaved(false), 2500);
                }}
                className="btn-pill-primary text-xs px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 font-bold shadow-sm"
              >
                {keySaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Check className="w-3.5 h-3.5 text-white" />}
                <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Loaded securely from <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">FRONTEND/client/.env</code>.
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
