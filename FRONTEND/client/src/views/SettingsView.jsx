import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Volume2,
  Radio,
  RotateCcw,
  Check,
  Sliders,
  Shield,
  Monitor,
  Bell,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsView({ event, onRefresh }) {
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(2);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Operations & AV Console Settings
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure stage monitor parameters, speech synthesis rehearsal engine, and demo data state
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 disabled:opacity-50"
          title="Restore original demo state"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset Demo State'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in font-medium">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Synthesizer & Teleprompter Settings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Speech Synthesis Rehearsal
            </h3>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-700 font-medium mb-1.5">
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
            <div className="flex justify-between text-xs text-slate-700 font-medium mb-1.5">
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition"
            >
              <Volume2 className="w-4 h-4 text-indigo-600" />
              <span>Test Audio Playback</span>
            </button>
          </div>
        </div>

        {/* Confidence Monitor & Hardware HUD */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Monitor className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Display & Projection
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold block text-slate-900">Confidence Monitor HUD</span>
                <span className="text-slate-500 text-[11px]">Large-format projector timer & current speaker</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ready
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold block text-slate-900">Audio Chime On Emergency</span>
                <span className="text-slate-500 text-[11px]">Play subtle stage cue tone on broadcast alert</span>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  soundAlerts ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    soundAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
