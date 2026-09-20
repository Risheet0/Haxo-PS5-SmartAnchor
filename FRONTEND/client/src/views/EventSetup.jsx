import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Rocket,
  FileText,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { getSpeakerAvatar } from '../utils/formatters';
import RegistrationFormBuilder from '../components/RegistrationFormBuilder';

const STEPS = [
  { id: 1, label: 'Event Info', desc: 'Title & details' },
  { id: 2, label: 'Date & Venue', desc: 'Schedule & hall' },
  { id: 3, label: 'Agenda', desc: 'Stage rundown' },
  { id: 4, label: 'Speakers', desc: 'Dignitary roster' },
  { id: 5, label: 'Registration', desc: 'Custom / Google Form' },
  { id: 6, label: 'Review & Launch', desc: 'Go live' }
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

  const handleDeleteSession = async (id) => {
    try {
      await api.deleteActivity(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleDeleteSpeaker = async (id) => {
    try {
      await api.deleteSpeaker(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

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
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HERO & STEPPER HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="p-6 soft-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Guided Event Setup & Onboarding
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Step-by-step wizard to configure parameters, schedule rundown, and keynote roster
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Horizontal Progress Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3 border-t border-slate-100">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`p-3.5 rounded-2xl text-left border transition ${
                  isCurrent
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-100 text-emerald-700'
                    : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span className={isCurrent ? 'text-slate-200' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}>
                    STEP 0{s.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  ) : null}
                </div>
                <div className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-800'}`}>{s.label}</div>
                <div className={`text-[10px] truncate ${isCurrent ? 'text-slate-300' : 'text-slate-400'}`}>{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. STEP-SPECIFIC WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 soft-card">
        
        {/* STEP 1: EVENT INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Step 1: Event Information
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Define the primary event identity, subtitle, and organizing committee metadata
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="soft-label">Event Name *</label>
                <input
                  type="text"
                  required
                  value={eventData.name}
                  onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                  placeholder="e.g. TECHFEST 2026"
                  className="soft-input font-bold"
                />
              </div>

              <div>
                <label className="soft-label">Event Description / Theme</label>
                <textarea
                  rows={3}
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  placeholder="e.g. Annual Technology & Innovation Summit bringing together founders, researchers, and engineers..."
                  className="soft-input resize-none"
                />
              </div>

              <div>
                <label className="soft-label">Organizing Committee / Host</label>
                <input
                  type="text"
                  value={eventData.organizer_name}
                  onChange={(e) => setEventData({ ...eventData, organizer_name: e.target.value })}
                  placeholder="e.g. Global Tech Council"
                  className="soft-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DATE & VENUE */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Step 2: Date & Venue Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Specify scheduled event dates, doors open timings, and stage hall location
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="soft-label">Event Date *</label>
                <input
                  type="date"
                  value={eventData.date}
                  onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                  className="soft-input font-mono"
                />
              </div>

              <div>
                <label className="soft-label">Start Time *</label>
                <input
                  type="text"
                  value={eventData.start_time}
                  onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                  placeholder="09:00 AM"
                  className="soft-input font-mono"
                />
              </div>

              <div>
                <label className="soft-label">End Time *</label>
                <input
                  type="text"
                  value={eventData.end_time}
                  onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                  placeholder="06:00 PM"
                  className="soft-input font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="soft-label">Venue / Facility *</label>
                <input
                  type="text"
                  value={eventData.venue}
                  onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                  placeholder="e.g. Grand Convention Center"
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Stage / Room Hall *</label>
                <input
                  type="text"
                  value={eventData.room}
                  onChange={(e) => setEventData({ ...eventData, room: e.target.value })}
                  placeholder="e.g. Main Auditorium Hall A"
                  className="soft-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: AGENDA SESSIONS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Step 3: Agenda & Stage Rundown ({agenda.length} sessions)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Add sessions, set start/end timings, durations, and assign keynote speakers
              </p>
            </div>

            {/* Quick Add Session Form */}
            <form onSubmit={handleAddSession} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-indigo-700 block">
                + Add New Agenda Session
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    required
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    placeholder="Session Title (e.g. AI Keynote)"
                    className="soft-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={newSession.start_time}
                    onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                    placeholder="10:00 AM"
                    className="soft-input text-xs font-mono"
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
                    className="soft-input text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-3 flex gap-2">
                  <select
                    value={newSession.speaker_id}
                    onChange={(e) => setNewSession({ ...newSession, speaker_id: e.target.value })}
                    className="soft-select text-xs"
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
                    className="btn-pill-primary text-xs flex-shrink-0"
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
                    className="p-3.5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between gap-3 text-xs shadow-sm"
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
                      className="p-2 rounded-full text-slate-400 hover:text-red-600 transition flex-shrink-0"
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

        {/* STEP 4: SPEAKERS & DIGNITARIES */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Step 4: Speaker Roster ({speakers.length} speakers)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Add keynote speakers, dignitaries, credentials, and brief bios for AI script introductions
              </p>
            </div>

            {/* Quick Add Speaker Form */}
            <form onSubmit={handleAddSpeaker} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-indigo-700 block">
                + Register New Speaker / Dignitary
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={newSpeaker.name}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                  placeholder="Speaker Name"
                  className="soft-input text-xs"
                />

                <input
                  type="text"
                  required
                  value={newSpeaker.designation}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, designation: e.target.value })}
                  placeholder="Role / Title"
                  className="soft-input text-xs"
                />

                <input
                  type="text"
                  value={newSpeaker.organization}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, organization: e.target.value })}
                  placeholder="Organization"
                  className="soft-input text-xs"
                />
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={newSpeaker.bio}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, bio: e.target.value })}
                  placeholder="Brief biography or key talking points..."
                  className="soft-input text-xs resize-none"
                />

                <button
                  type="submit"
                  disabled={creatingSpeaker || !newSpeaker.name.trim()}
                  className="btn-pill-primary text-xs self-end flex-shrink-0"
                >
                  Add Speaker
                </button>
              </div>
            </form>

            {/* Existing Speakers List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-72 overflow-y-auto pr-1">
              {speakers.map((sp) => (
                <div
                  key={sp.id}
                  className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={getSpeakerAvatar(sp.name, sp.avatar_url)}
                      alt={sp.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                    />
                    <div className="truncate text-xs">
                      <h4 className="font-bold text-slate-900 truncate">{sp.name}</h4>
                      <p className="text-slate-500 truncate">{sp.designation} • {sp.organization}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSpeaker(sp.id)}
                    className="p-2 rounded-full text-slate-400 hover:text-red-600 transition"
                    title="Delete Speaker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: REGISTRATION FORM BUILDER */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <RegistrationFormBuilder eventId={event?.id || 1} />
          </div>
        )}

        {/* STEP 6: REVIEW & LAUNCH */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Step 6: Event Operational Review
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Verify event settings, agenda rundown, registration form, and connected systems before launching live
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Event & Venue</span>
                <p className="text-base font-bold text-slate-900 truncate">{eventData.name}</p>
                <p className="text-xs text-indigo-700 truncate">{eventData.venue} • {eventData.room}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Date & Timeline</span>
                <p className="text-base font-bold text-slate-900 font-mono">{eventData.date}</p>
                <p className="text-xs text-slate-600 font-mono">{eventData.start_time} - {eventData.end_time}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Scale</span>
                <p className="text-base font-bold text-emerald-700 font-mono">
                  {agenda.length} Sessions • {speakers.length} Speakers
                </p>
                <p className="text-xs text-slate-500">All systems calibrated</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-150 space-y-2 text-xs">
              <span className="font-bold text-indigo-900 uppercase block">
                Pre-Flight Operations Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>WebSocket Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Stage Display HUD Synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Teleprompter Armed</span>
                </div>
              </div>
            </div>

            {/* Final Launch Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
              <button
                onClick={handleLaunchEvent}
                disabled={launching}
                className="w-full sm:w-auto btn-pill-accent text-base px-10 py-3.5 flex items-center justify-center gap-3"
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

        {/* STEPPER NAVIGATION FOOTER */}
        {currentStep < 6 && (
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="btn-pill-secondary text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={saving}
              className="btn-pill-primary text-xs flex items-center gap-1.5"
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
