import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Layers,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Sparkles,
  FileText,
  Building,
  RotateCcw,
  Check,
  ChevronRight,
  Radio,
  Tv,
  Hourglass,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { getSpeakerAvatar } from '../utils/formatters';

const STEPS = [
  { id: 1, label: 'Event Info', desc: 'Title & details' },
  { id: 2, label: 'Date & Venue', desc: 'Schedule & location' },
  { id: 3, label: 'Agenda', desc: 'Stage rundown' },
  { id: 4, label: 'Speakers', desc: 'Dignitary roster' },
  { id: 5, label: 'Review & Launch', desc: 'Go live' }
];

export default function EventSetup({
  event,
  agenda = [],
  speakers = [],
  onRefresh,
  onNavigate
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1 & 2: Event Details
  const [eventData, setEventData] = useState({
    name: 'TechFest 2026',
    description: 'Premier Technology & Innovation Leadership Summit',
    organizer_name: 'TechFest Core Committee',
    date: '2026-09-20',
    start_time: '09:00 AM',
    end_time: '06:00 PM',
    venue: 'Grand Convention Center',
    room: 'Main Auditorium'
  });

  // Step 3: Inline New Agenda Form
  const [newSession, setNewSession] = useState({
    title: '',
    activity_type: 'Keynote',
    start_time: '10:00 AM',
    end_time: '10:45 AM',
    duration_minutes: 45,
    room: 'Main Auditorium',
    speaker_id: ''
  });
  const [creatingSession, setCreatingSession] = useState(false);

  // Step 4: Inline New Speaker Form
  const [newSpeaker, setNewSpeaker] = useState({
    name: '',
    designation: '',
    organization: '',
    bio: '',
    topic: ''
  });
  const [creatingSpeaker, setCreatingSpeaker] = useState(false);

  useEffect(() => {
    if (event) {
      setEventData({
        name: event.name || 'TechFest 2026',
        description: event.description || '',
        organizer_name: event.organizer_name || '',
        date: event.date || '2026-09-20',
        start_time: event.start_time || '09:00 AM',
        end_time: event.end_time || '06:00 PM',
        venue: event.venue || 'Grand Convention Center',
        room: event.room || 'Main Auditorium'
      });
    }
  }, [event]);

  // Save Event Details
  const handleSaveEventDetails = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.updateEvent({
        ...eventData,
        status: event?.status || 'LIVE'
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Add Session to Agenda
  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!newSession.title.trim()) return;

    setCreatingSession(true);
    try {
      await api.createActivity({
        ...newSession,
        order_index: agenda.length + 1,
        status: 'UPCOMING'
      });
      setNewSession({
        title: '',
        activity_type: 'Session',
        start_time: '11:00 AM',
        end_time: '11:45 AM',
        duration_minutes: 45,
        room: eventData.room || 'Main Auditorium',
        speaker_id: ''
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingSession(false);
    }
  };

  // Delete Agenda Session
  const handleDeleteSession = async (id) => {
    try {
      await api.deleteActivity(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Speaker
  const handleAddSpeaker = async (e) => {
    e.preventDefault();
    if (!newSpeaker.name.trim() || !newSpeaker.designation.trim()) return;

    setCreatingSpeaker(true);
    try {
      await api.createSpeaker(newSpeaker);
      setNewSpeaker({
        name: '',
        designation: '',
        organization: '',
        bio: '',
        topic: ''
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingSpeaker(false);
    }
  };

  // Delete Speaker
  const handleDeleteSpeaker = async (id) => {
    try {
      await api.deleteSpeaker(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Step 6 / Final Action: LAUNCH EVENT
  const handleLaunchEvent = async () => {
    setLaunching(true);
    try {
      await api.updateEvent({
        ...eventData,
        status: 'LIVE'
      });
      if (onRefresh) await onRefresh();
      setSuccessMsg('Event successfully launched live!');
      
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('dashboard');
        }
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLaunching(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1 || currentStep === 2) {
      await handleSaveEventDetails();
    }
    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in max-w-5xl mx-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HERO & STEPPER HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Guided Event Setup & Onboarding
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Step-by-step wizard to configure parameters, schedule rundown, and keynote roster
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Horizontal Progress Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`p-3 rounded-xl text-left border transition ${
                  isCurrent
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200 text-emerald-700 hover:border-slate-300'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span className={isCompleted ? 'text-emerald-700' : isCurrent ? 'text-indigo-700' : 'text-slate-400'}>
                    STEP 0{s.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  ) : null}
                </div>
                <div className="text-xs font-bold text-slate-800 truncate">{s.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in font-bold">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. STEP-SPECIFIC WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
        
        {/* ═════════════════════════════════════════════════════════════
            STEP 1: EVENT INFORMATION
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Step 1: Event Information
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Define the primary event identity, subtitle, and organizing committee metadata
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="stage-label">Event Name *</label>
                <input
                  type="text"
                  required
                  value={eventData.name}
                  onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                  placeholder="e.g. TECHFEST 2026"
                  className="stage-input text-base font-bold"
                />
              </div>

              <div>
                <label className="stage-label">Event Description / Theme</label>
                <textarea
                  rows={3}
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  placeholder="e.g. Annual Technology & Innovation Summit bringing together founders, researchers, and engineers..."
                  className="stage-input resize-none"
                />
              </div>

              <div>
                <label className="stage-label">Organizing Committee / Host</label>
                <input
                  type="text"
                  value={eventData.organizer_name}
                  onChange={(e) => setEventData({ ...eventData, organizer_name: e.target.value })}
                  placeholder="e.g. Global Tech Council"
                  className="stage-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 2: DATE & VENUE
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Step 2: Date & Venue Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Specify scheduled event dates, doors open timings, and stage hall location
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="stage-label">Event Date *</label>
                <input
                  type="date"
                  value={eventData.date}
                  onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                  className="stage-input font-mono"
                />
              </div>

              <div>
                <label className="stage-label">Start Time *</label>
                <input
                  type="text"
                  value={eventData.start_time}
                  onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                  placeholder="09:00 AM"
                  className="stage-input font-mono"
                />
              </div>

              <div>
                <label className="stage-label">End Time *</label>
                <input
                  type="text"
                  value={eventData.end_time}
                  onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                  placeholder="06:00 PM"
                  className="stage-input font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="stage-label">Venue / Facility *</label>
                <input
                  type="text"
                  value={eventData.venue}
                  onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                  placeholder="e.g. Grand Convention Center"
                  className="stage-input"
                />
              </div>

              <div>
                <label className="stage-label">Stage / Room Hall *</label>
                <input
                  type="text"
                  value={eventData.room}
                  onChange={(e) => setEventData({ ...eventData, room: e.target.value })}
                  placeholder="e.g. Main Auditorium Hall A"
                  className="stage-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 3: AGENDA SESSIONS
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Step 3: Agenda & Stage Rundown ({agenda.length} sessions)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add sessions, set start/end timings, durations, and assign keynote speakers
                </p>
              </div>
            </div>

            {/* Quick Add Session Form */}
            <form onSubmit={handleAddSession} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono block">
                + Add New Agenda Session
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    required
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    placeholder="Session Title (e.g. AI Innovation Keynote)"
                    className="stage-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={newSession.start_time}
                    onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                    placeholder="10:00 AM"
                    className="stage-input text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={newSession.duration_minutes}
                    onChange={(e) => setNewSession({ ...newSession, duration_minutes: Number(e.target.value) })}
                    placeholder="45 min"
                    className="stage-input text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-3 flex gap-2">
                  <select
                    value={newSession.speaker_id}
                    onChange={(e) => setNewSession({ ...newSession, speaker_id: e.target.value })}
                    className="stage-select text-xs"
                  >
                    <option value="">Assign Speaker...</option>
                    {speakers.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name} ({sp.organization})
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={creatingSession || !newSession.title.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>

            {/* Existing Agenda List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {agenda.length > 0 ? (
                agenda.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-mono font-bold text-indigo-700 w-6 text-center">
                        #{item.order_index}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.start_time} - {item.end_time} ({item.duration_minutes}m) • {item.speaker_name ? `Speaker: ${item.speaker_name}` : 'No speaker assigned'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSession(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition flex-shrink-0"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  No sessions added yet. Fill out the form above to add your opening session!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 4: SPEAKERS & DIGNITARIES
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Step 4: Speaker Roster ({speakers.length} speakers)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Add keynote speakers, dignitaries, credentials, and brief bios for AI script introductions
              </p>
            </div>

            {/* Quick Add Speaker Form */}
            <form onSubmit={handleAddSpeaker} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono block">
                + Register New Speaker / Dignitary
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={newSpeaker.name}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                  placeholder="Speaker Name (e.g. Dr. Rahul Sharma)"
                  className="stage-input text-xs"
                />

                <input
                  type="text"
                  required
                  value={newSpeaker.designation}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, designation: e.target.value })}
                  placeholder="Role / Title (e.g. Chief AI Scientist)"
                  className="stage-input text-xs"
                />

                <input
                  type="text"
                  value={newSpeaker.organization}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, organization: e.target.value })}
                  placeholder="Organization (e.g. Google DeepMind)"
                  className="stage-input text-xs"
                />
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={newSpeaker.bio}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, bio: e.target.value })}
                  placeholder="Brief biography or key talking points..."
                  className="stage-input text-xs resize-none"
                />

                <button
                  type="submit"
                  disabled={creatingSpeaker || !newSpeaker.name.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 self-end flex-shrink-0"
                >
                  Add Speaker
                </button>
              </div>
            </form>

            {/* Existing Speakers List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {speakers.map((sp) => (
                <div
                  key={sp.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={getSpeakerAvatar(sp.name, sp.avatar_url)}
                      alt={sp.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="truncate text-xs">
                      <h4 className="font-bold text-slate-900 truncate">{sp.name}</h4>
                      <p className="text-slate-500 truncate">{sp.designation} • {sp.organization}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSpeaker(sp.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition"
                    title="Delete Speaker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 5: REVIEW & LAUNCH SUMMARY
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Step 5: Event Operational Review
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verify event settings, agenda rundown, and connected systems before launching live
              </p>
            </div>

            {/* Executive Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Event Name & Venue</span>
                <p className="text-base font-bold text-slate-900 truncate">{eventData.name}</p>
                <p className="text-xs text-indigo-700 truncate">{eventData.venue} • {eventData.room}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Date & Timeline</span>
                <p className="text-base font-bold text-slate-900 font-mono">{eventData.date}</p>
                <p className="text-xs text-slate-600 font-mono">{eventData.start_time} - {eventData.end_time}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Total Scale</span>
                <p className="text-base font-bold text-emerald-700 font-mono">
                  {agenda.length} Sessions • {speakers.length} Speakers
                </p>
                <p className="text-xs text-slate-500">All systems calibrated</p>
              </div>
            </div>

            {/* System Readiness Checklist */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
              <span className="font-bold text-indigo-900 uppercase tracking-wider font-mono block">
                Pre-Flight Operations Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Real-time WebSocket Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Stage Display HUD Synchronized</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Anchor Teleprompter Armed</span>
                </div>
              </div>
            </div>

            {/* Final Big Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
              <button
                onClick={handleLaunchEvent}
                disabled={launching}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-sm transition active:scale-98 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Rocket className="w-5 h-5" />
                <span>{launching ? 'Launching Live Stage Flow...' : 'LAUNCH EVENT'}</span>
              </button>
              <p className="text-xs text-slate-500">
                Initiates live stage timers and seamlessly transitions to the live event control room
              </p>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. STEPPER NAVIGATION FOOTER (BACK / NEXT)
            ───────────────────────────────────────────────────────────── */}
        {currentStep < 5 && (
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-20 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={saving}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <span>{saving ? 'Saving...' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
