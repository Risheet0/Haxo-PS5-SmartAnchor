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
  Ticket
} from 'lucide-react';
import { SASM_MOCK_EVENTS } from '../services/sasmEventsData';
import EventRegistrationModal from '../components/EventRegistrationModal';

export default function EventDetailPage({ eventId = 'sasm-ev-1', onNavigate, currentUser = null }) {
  const [showRegModal, setShowRegModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      const saved = localStorage.getItem('sasm_registered_events');
      const list = saved ? JSON.parse(saved) : [];
      return list.includes(eventId);
    } catch {
      return false;
    }
  });

  const event = SASM_MOCK_EVENTS.find(e => e.id === eventId) || SASM_MOCK_EVENTS[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Back Link */}
      <button
        onClick={() => onNavigate('/events')}
        className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 hover:text-slate-950 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Directory</span>
      </button>

      {/* Main Header Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
            {event.organizerType} • {event.category}
          </span>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">INSTITUTION</span>
              <span className="font-bold">{event.institution}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">LOCATION</span>
              <span className="font-bold">{event.venue}, {event.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">DATE &amp; TIME</span>
              <span className="font-bold">{event.date} ({event.startTime} - {event.endTime})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Overview & Requirements */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-950 font-sans uppercase tracking-tight">
              About This TechFest Event
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
            <div className="space-y-1 text-xs">
              <span className="text-slate-400 block">Deadline:</span>
              <span className="font-bold text-emerald-400 text-sm">{event.registrationDeadline}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowRegModal(true)}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
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
