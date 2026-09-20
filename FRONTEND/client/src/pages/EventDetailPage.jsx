import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Phone,
  Tag,
  Share2,
  Ticket,
  Layers,
  Sparkles
} from 'lucide-react';
import { SASM_MOCK_EVENTS } from '../services/sasmEventsData';
import EventRegistrationModal from '../components/EventRegistrationModal';
import { api } from '../services/api';

export default function EventDetailPage({ eventId = 'sasm-ev-1', onNavigate, currentUser = null }) {
  const [showRegModal, setShowRegModal] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState(1);
  const [eventData, setEventData] = useState(() => {
    return SASM_MOCK_EVENTS.find((e) => String(e.id) === String(eventId)) || SASM_MOCK_EVENTS[0];
  });
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      const saved = localStorage.getItem('sasm_registered_events');
      const list = saved ? JSON.parse(saved) : [];
      return list.includes(eventId);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await api.getEventById(eventId);
        if (data) setEventData(data);
      } catch (err) {
        console.warn('Failed to load event detail:', err);
      }
    };
    fetchEvent();
  }, [eventId]);

  const event = eventData;
  const isMultiDay = event.isMultiDay || (event.daySchedules && event.daySchedules.length > 1) || (event.endDate && event.endDate !== event.date);
  const totalDays = event.totalDays || event.daySchedules?.length || 1;

  // Formatted date string for display
  const dateDisplay = isMultiDay
    ? `Start: ${event.date} • End: ${event.endDate || event.date} (${totalDays} Days)`
    : `${event.date}${event.startTime ? ` • ${event.startTime}` : ''}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Back Link */}
      <button
        onClick={() => onNavigate('/events')}
        className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 hover:text-slate-950 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Directory</span>
      </button>

      {/* Main Header Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
              {event.organizerType} • {event.category}
            </span>
            {isMultiDay && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{totalDays}-Day Event</span>
              </span>
            )}
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
            {event.registrationStatus}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight leading-tight">
            {event.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Organized by <strong className="text-slate-900">{event.organizer}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-slate-700">
            <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">INSTITUTION</span>
              <span className="font-bold">{event.institution || 'Main Campus'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">
                {isMultiDay ? 'VENUE & MAIN STAGE' : 'LOCATION & VENUE'}
              </span>
              <span className="font-bold">{event.venue}{event.room ? ` (${event.room})` : ''}, {event.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">START DATE &amp; TIME</span>
              <span className="font-bold text-slate-900">{event.date} {event.startTime ? `• ${event.startTime}` : ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">
                {isMultiDay ? `END DATE (${totalDays} DAYS)` : 'END DATE & TIME'}
              </span>
              <span className="font-bold text-indigo-950">
                {isMultiDay ? (event.endDate || event.date) : event.date} {event.endTime ? `• ${event.endTime}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Overview, Multi-Day Schedule & Requirements */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* About Section */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-950 font-sans uppercase tracking-tight">
              About This Event
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed font-sans">
              {event.description}
            </p>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <strong className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
                Eligibility &amp; Criteria
              </strong>
              <p className="text-xs text-slate-800 font-mono font-bold bg-slate-50 p-3 rounded-xl border border-slate-200">
                {event.eligibility}
              </p>
            </div>
          </div>

          {/* Multi-Day Schedule & Venue Breakdown */}
          {isMultiDay && event.daySchedules && event.daySchedules.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 font-sans">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      Day-by-Day Schedule &amp; Venues
                    </h2>
                    <p className="text-xs text-slate-500">
                      Complete {totalDays}-day timetable with dedicated stages and activity tracks
                    </p>
                  </div>
                </div>

                {/* Day selector tabs */}
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {event.daySchedules.map((ds) => (
                    <button
                      key={ds.day}
                      onClick={() => setActiveDayTab(ds.day)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        activeDayTab === ds.day
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Day {ds.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Day Detail Card */}
              {(() => {
                const currentDay = event.daySchedules.find((d) => d.day === activeDayTab) || event.daySchedules[0];
                return (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-xs font-bold">
                          Day 0{currentDay.day}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {currentDay.label}
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        📅 {currentDay.date}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">VENUE &amp; HALL</span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span>{currentDay.venue}</span>
                        </div>
                        {currentDay.room && (
                          <div className="text-[11px] text-slate-600 pl-5">
                            Stage: {currentDay.room}
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">SESSION TIMINGS</span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{currentDay.time}</span>
                        </div>
                      </div>
                    </div>

                    {currentDay.highlight && (
                      <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950 font-sans">
                        <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block mb-0.5">Day {currentDay.day} Program Focus:</strong>
                          <span>{currentDay.highlight}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* All Days Overview Timeline */}
              <div className="pt-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Full {totalDays}-Day Flow Summary
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
                  {event.daySchedules.map((ds) => (
                    <button
                      key={ds.day}
                      onClick={() => setActiveDayTab(ds.day)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        activeDayTab === ds.day
                          ? 'bg-white border-indigo-500 ring-2 ring-indigo-200 font-bold'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-900">Day {ds.day}</span>
                        <span className="text-slate-500">{ds.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 truncate font-sans font-medium">{ds.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">📍 {ds.room || ds.venue}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Skills, Tags & Categories */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 font-mono">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Event Highlights &amp; Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {(event.skills || event.tags || ['General Event']).map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Registration CTA & Contact */}
        <div className="lg:col-span-4 space-y-6 font-mono">
          <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-4 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Join This Event
            </h3>

            {isMultiDay && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-400 block text-[10px]">EVENT PASS VALIDITY</span>
                <span className="font-bold text-indigo-300">All {totalDays} Days Included</span>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 block">Registration Deadline:</span>
              <span className="font-bold text-emerald-400 text-sm">{event.registrationDeadline}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowRegModal(true)}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
                isRegistered
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{isRegistered ? 'View My Event Pass' : 'Register / Sign In to Join'}</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Organizer Contact
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{event.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{event.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <EventRegistrationModal
        event={event}
        isOpen={showRegModal}
        currentUser={currentUser}
        onClose={() => setShowRegModal(false)}
        onRegistrationSuccess={(evId) => {
          setIsRegistered(true);
          try {
            const saved = localStorage.getItem('sasm_registered_events');
            const list = saved ? JSON.parse(saved) : [];
            if (!list.includes(evId)) {
              localStorage.setItem('sasm_registered_events', JSON.stringify([...list, evId]));
            }
          } catch {}
        }}
      />
    </div>
  );
}
