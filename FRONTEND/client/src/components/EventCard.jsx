import React from 'react';
import { MapPin, Calendar, Building2, ArrowRight, Layers } from 'lucide-react';

/**
 * Reusable SASM Event Card Component
 * Follows clean modern visual design system with Multi-Day Date & Venue support.
 */
export default function EventCard({ event, onNavigate, isFeatured = false }) {
  if (!event) return null;

  const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
  const isMultiDay = event.isMultiDay || (event.daySchedules && event.daySchedules.length > 1) || (event.endDate && event.endDate !== event.date);
  const totalDays = event.totalDays || event.daySchedules?.length || 1;

  const dateDisplay = isMultiDay
    ? `Start: ${event.date} • End: ${event.endDate || event.date} (${totalDays}D)`
    : `${event.date} ${event.startTime ? `• ${event.startTime}` : ''}`;

  return (
    <div
      onClick={() => onNavigate && onNavigate(`/events/${event.id}`)}
      className={`group bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none font-sans ${
        isFeatured ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200'
      }`}
    >
      <div>
        {/* Event Image */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={event.image || defaultImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
          {/* Overlay Status, Category & Multi-Day Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/85 text-white backdrop-blur-xs border border-white/20">
                {event.category || 'Event'}
              </span>
              {isMultiDay && (
                <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-indigo-600/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                  <Layers className="w-3 h-3" />
                  <span>{totalDays}D</span>
                </span>
              )}
            </div>

            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-white/95 text-slate-900 shadow-xs backdrop-blur-xs border border-slate-200">
              {event.registrationStatus || 'OPEN'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Event Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-950 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
            {event.title}
          </h3>

          {/* Organizer & Institution */}
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800 truncate">
              {event.organizer}
            </p>
            {event.institution && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate">{event.institution}</span>
              </div>
            )}
          </div>

          {/* Short Description */}
          {event.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
              {event.description}
            </p>
          )}

          {/* Date, Time & Location Meta */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-mono">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="truncate font-semibold text-slate-900">{event.city}</span>
              {event.venue && <span className="text-slate-400 truncate">• {event.venue}</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className={`truncate ${isMultiDay ? 'font-bold text-indigo-950' : ''}`}>
                {dateDisplay}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">
          {isMultiDay ? `${totalDays}-Day ${event.eventType || 'Event'}` : (event.eventType || event.organizerType || 'General Event')}
        </span>
        <button className="font-bold text-slate-950 group-hover:text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>View Event</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
