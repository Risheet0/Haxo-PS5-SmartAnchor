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
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  Map
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

// Safe parser for multi-day schedule arrays or JSON strings from SQLite / APIs
const parseDaySchedules = (raw, fallbackDate = '2026-09-20', fallbackVenue = 'Grand Convention Center', fallbackRoom = 'Main Auditorium') => {
  let list = raw;
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list);
    } catch {
      list = null;
    }
  }
  if (Array.isArray(list) && list.length > 0) {
    return list.map((item, idx) => ({
      day: item.day || idx + 1,
      date: item.date || fallbackDate,
      label: item.label || `Day ${idx + 1}: Sessions & Tracks`,
      venue: item.venue || fallbackVenue,
      room: item.room || fallbackRoom,
      time: item.time || '09:00 AM - 06:00 PM',
      highlight: item.highlight || ''
    }));
  }
  return [
    {
      day: 1,
      date: fallbackDate,
      label: 'Day 1: Inauguration & Keynotes',
      venue: fallbackVenue,
      room: fallbackRoom,
      time: '09:00 AM - 06:00 PM',
      highlight: 'Keynote Speeches & Core Program'
    }
  ];
};

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

  const [eventData, setEventData] = useState(() => ({
    name: 'TechFest 2026',
    description: 'Premier Technology & Innovation Leadership Summit',
    organizer_name: 'TechFest Core Committee',
    is_multi_day: true,
    total_days: 3,
    date: '2026-09-20',
    end_date: '2026-09-22',
    start_time: '09:00 AM',
    end_time: '06:00 PM',
    venue: 'Grand Convention Center',
    room: 'Main Auditorium',
    day_schedules: [
      {
        day: 1,
        date: '2026-09-20',
        label: 'Day 1: Inauguration & AI Keynotes',
        venue: 'Grand Convention Center',
        room: 'Main Auditorium & Expo Hall A',
        time: '09:00 AM - 06:00 PM',
        highlight: 'Ceremonial Opening, DeepMind Keynote & AI Workshops'
      },
      {
        day: 2,
        date: '2026-09-21',
        label: 'Day 2: Developer Sprints & Technical Tracks',
        venue: 'Tech Innovation Hub Arena',
        room: 'Lab 3 & Workshop Studio',
        time: '09:30 AM - 07:00 PM',
        highlight: 'Hands-on Agentic Robotics & Hackathon Tracks'
      },
      {
        day: 3,
        date: '2026-09-22',
        label: 'Day 3: Final Pitches & Grand Valedictory',
        venue: 'Grand Convention Center',
        room: 'Main Stage Amphitheatre',
        time: '10:00 AM - 05:30 PM',
        highlight: 'Top 10 Jury Pitching, Cash Prize Awards & Closing Ceremony'
      }
    ]
  }));

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
      const parsedSchedules = parseDaySchedules(
        event.day_schedules || event.daySchedules,
        event.date || '2026-09-20',
        event.venue || 'Grand Convention Center',
        event.room || 'Main Auditorium'
      );
      setEventData({
        name: event.name || 'TechFest 2026',
        description: event.description || '',
        organizer_name: event.organizer_name || '',
        is_multi_day: Boolean(event.is_multi_day || event.isMultiDay || (parsedSchedules && parsedSchedules.length > 1)),
        total_days: event.total_days || event.totalDays || parsedSchedules.length || 1,
        date: event.date || '2026-09-20',
        end_date: event.end_date || event.endDate || event.date || '2026-09-22',
        start_time: event.start_time || '09:00 AM',
        end_time: event.end_time || '06:00 PM',
        venue: event.venue || 'Grand Convention Center',
        room: event.room || 'Main Auditorium',
        day_schedules: parsedSchedules
      });
    }
  }, [event]);

  const handleAddDay = () => {
    const list = Array.isArray(eventData?.day_schedules) ? eventData.day_schedules : [];
    const nextDayNum = list.length + 1;
    const newDay = {
      day: nextDayNum,
      date: eventData?.end_date || eventData?.date || '2026-09-23',
      label: `Day ${nextDayNum}: Track & Sessions`,
      venue: eventData?.venue || 'Grand Convention Center',
      room: 'Secondary Stage / Lab',
      time: '09:30 AM - 06:00 PM',
      highlight: 'Workshops, competitions and technical sessions'
    };
    const updatedSchedules = [...list, newDay];
    setEventData(prev => ({
      ...prev,
      is_multi_day: true,
      total_days: updatedSchedules.length,
      day_schedules: updatedSchedules
    }));
  };

  const handleUpdateDay = (index, field, value) => {
    const list = Array.isArray(eventData?.day_schedules) ? [...eventData.day_schedules] : [];
    if (list[index]) {
      list[index] = { ...list[index], [field]: value };
      setEventData(prev => ({ ...prev, day_schedules: list }));
    }
  };

  const handleDeleteDay = (index) => {
    const list = Array.isArray(eventData?.day_schedules) ? eventData.day_schedules : [];
    const updated = list.filter((_, i) => i !== index).map((d, i) => ({
      ...d,
      day: i + 1
    }));
    setEventData(prev => ({
      ...prev,
      total_days: updated.length,
      is_multi_day: updated.length > 1,
      day_schedules: updated
    }));
  };

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
      if (event && event.id) {
        await api.updateEvent({
          ...eventData,
          status: 'LIVE'
        });
      } else {
        await api.createEvent({
          ...eventData,
          status: 'LIVE'
        });
      }
      if (onRefresh) await onRefresh();
      setSuccessMsg('Event successfully launched live! It is now visible to all attendees across the SASM platform.');
      
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('dashboard');
        }
      }, 1200);
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

        {/* STEP 2: DATE & VENUE CONFIGURATION */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Step 2: Date &amp; Venue Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure event Start Date, End Date, daily timings, and venue / stage allocations
                </p>
              </div>

              {/* Multi-Day vs Single Day Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl font-mono text-xs border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setEventData({
                      ...eventData,
                      is_multi_day: false,
                      total_days: 1,
                      end_date: eventData.date
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    !eventData.is_multi_day
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Single Day
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEventData({
                      ...eventData,
                      is_multi_day: true,
                      total_days: Math.max(2, eventData.total_days || 2)
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                    eventData.is_multi_day
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Multi-Day Event</span>
                </button>
              </div>
            </div>

            {/* Date Range & Timings */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Event Dates &amp; Timings</span>
                </h4>
                {eventData.date && eventData.end_date && (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {eventData.is_multi_day
                      ? `Duration: ${eventData.total_days || 2} Days (${eventData.date} → ${eventData.end_date})`
                      : `Single Day (${eventData.date})`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="soft-label flex items-center justify-between">
                    <span>Start Date *</span>
                    <span className="text-[10px] text-indigo-600 font-mono">Day 1</span>
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const isMulti = eventData.is_multi_day;
                      setEventData({
                        ...eventData,
                        date: newStart,
                        end_date: (!isMulti || !eventData.end_date || eventData.end_date < newStart) ? newStart : eventData.end_date
                      });
                    }}
                    className="soft-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="soft-label flex items-center justify-between">
                    <span>End Date *</span>
                    <span className="text-[10px] text-indigo-600 font-mono">{eventData.is_multi_day ? `Day ${eventData.total_days || 2}` : 'Same Day'}</span>
                  </label>
                  <input
                    type="date"
                    value={eventData.end_date || eventData.date}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      const isMulti = newEnd && eventData.date && newEnd !== eventData.date;
                      setEventData({
                        ...eventData,
                        end_date: newEnd,
                        is_multi_day: isMulti ? true : eventData.is_multi_day
                      });
                    }}
                    className="soft-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="soft-label">Daily Start Time *</label>
                  <input
                    type="text"
                    value={eventData.start_time}
                    onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                    placeholder="09:00 AM"
                    className="soft-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="soft-label">Daily End Time *</label>
                  <input
                    type="text"
                    value={eventData.end_time}
                    onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                    placeholder="06:00 PM"
                    className="soft-input font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Primary Venue Overview */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Primary Venue &amp; Main Stage Location</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="soft-label">Primary Venue / Campus *</label>
                  <input
                    type="text"
                    value={eventData.venue}
                    onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                    placeholder="e.g. Grand Convention Center"
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Main Stage / Room Hall *</label>
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

            {/* MULTI-DAY SCHEDULE & VENUE BREAKDOWN BUILDER */}
            {eventData.is_multi_day && (() => {
              const dayList = Array.isArray(eventData?.day_schedules) ? eventData.day_schedules : [];
              return (
                <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-150 space-y-4 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                        Day-by-Day Venue &amp; Stage Allocation ({dayList.length} Days)
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>+ Add Day</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dayList.map((dayItem, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                              Day 0{dayItem.day || index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              Schedule &amp; Stage Allocation
                            </span>
                          </div>

                          {dayList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDay(index)}
                              className="text-slate-400 hover:text-red-600 transition p-1 text-xs cursor-pointer flex items-center gap-1"
                              title="Remove Day"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date</label>
                            <input
                              type="date"
                              value={dayItem.date || ''}
                              onChange={(e) => handleUpdateDay(index, 'date', e.target.value)}
                              className="soft-input font-mono text-xs py-1.5"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Day Theme / Title</label>
                            <input
                              type="text"
                              value={dayItem.label || ''}
                              onChange={(e) => handleUpdateDay(index, 'label', e.target.value)}
                              placeholder="e.g. Day 1: Keynote Tracks"
                              className="soft-input text-xs py-1.5"
                            />
                          </div>

                          <div className="sm:col-span-5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Venue / Facility</label>
                            <input
                              type="text"
                              value={dayItem.venue || ''}
                              onChange={(e) => handleUpdateDay(index, 'venue', e.target.value)}
                              placeholder="e.g. Grand Convention Center"
                              className="soft-input text-xs py-1.5"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Stage / Room Hall</label>
                            <input
                              type="text"
                              value={dayItem.room || ''}
                              onChange={(e) => handleUpdateDay(index, 'room', e.target.value)}
                              placeholder="e.g. Main Auditorium / Lab 3"
                              className="soft-input text-xs py-1.5"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Day Timings</label>
                            <input
                              type="text"
                              value={dayItem.time || ''}
                              onChange={(e) => handleUpdateDay(index, 'time', e.target.value)}
                              placeholder="09:00 AM - 06:00 PM"
                              className="soft-input font-mono text-xs py-1.5"
                            />
                          </div>

                          <div className="sm:col-span-5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Key Focus / Highlight</label>
                            <input
                              type="text"
                              value={dayItem.highlight || ''}
                              onChange={(e) => handleUpdateDay(index, 'highlight', e.target.value)}
                              placeholder="e.g. Keynote speeches & AI workshops"
                              className="soft-input text-xs py-1.5"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Event &amp; Venues</span>
                <p className="text-base font-bold text-slate-900 truncate">{eventData.name}</p>
                <p className="text-xs text-indigo-700 truncate">
                  {eventData.venue} • {eventData.room}
                  {eventData.is_multi_day && eventData.day_schedules?.length > 1 ? ` (+${eventData.day_schedules.length - 1} more stages)` : ''}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  {eventData.is_multi_day ? `Duration (${eventData.day_schedules?.length || 2} Days)` : 'Date & Timeline'}
                </span>
                <p className="text-base font-bold text-slate-900 font-mono truncate">
                  {eventData.is_multi_day ? `${eventData.date} → ${eventData.end_date}` : eventData.date}
                </p>
                <p className="text-xs text-slate-600 font-mono">{eventData.start_time} - {eventData.end_time}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Scale</span>
                <p className="text-base font-bold text-emerald-700 font-mono">
                  {agenda.length} Sessions • {speakers.length} Speakers
                </p>
                <p className="text-xs text-slate-500">
                  {eventData.is_multi_day ? `${eventData.day_schedules?.length || 2} Live Stage Days Synced` : 'All systems calibrated'}
                </p>
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
