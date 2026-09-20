import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  SASM_MOCK_EVENTS,
  EVENT_CATEGORIES,
  ORGANIZER_TYPES,
  SUPPORTED_CITIES,
  sortEventsByLocation
} from '../services/sasmEventsData';
import EventCard from '../components/EventCard';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

export default function EventsPage({ selectedCity = 'Ahmedabad', onSelectCity, onNavigate }) {
  // Read category query parameter if passed via URL (e.g., /events?category=Technology)
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'ALL';
  });

  const [selectedOrgType, setSelectedOrgType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventsList, setEventsList] = useState(SASM_MOCK_EVENTS);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && EVENT_CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    }

    const loadEvents = async () => {
      try {
        const data = await api.getAllEvents();
        if (Array.isArray(data) && data.length > 0) {
          setEventsList(data);
        }
      } catch (err) {
        console.warn('Failed to load events in EventsPage:', err);
      }
    };
    loadEvents();

    const socket = getSocket();
    const handleNewEvent = (newEvent) => {
      setEventsList((prev) => {
        const exists = prev.some((e) => String(e.id) === String(newEvent.id));
        if (exists) return prev.map((e) => (String(e.id) === String(newEvent.id) ? newEvent : e));
        return [newEvent, ...prev];
      });
    };

    socket.on('new_event_launched', handleNewEvent);
    socket.on('event_created', handleNewEvent);
    socket.on('event_updated', handleNewEvent);

    return () => {
      socket.off('new_event_launched', handleNewEvent);
      socket.off('event_created', handleNewEvent);
      socket.off('event_updated', handleNewEvent);
    };
  }, []);

  // Apply location priority sorting
  const sortedByLocation = sortEventsByLocation(eventsList, selectedCity);

  // Apply search, category, and organizer filters
  const filteredEvents = sortedByLocation.filter((ev) => {
    const matchesCategory = selectedCategory === 'ALL' || ev.category === selectedCategory;
    const matchesOrgType = selectedOrgType === 'ALL' || (ev.organizerType || ev.organizer_type) === selectedOrgType;
    const title = ev.title || ev.name || '';
    const inst = ev.institution || ev.venue || '';
    const city = ev.city || '';
    const org = ev.organizer || ev.organizer_name || '';

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesOrgType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 font-sans">
      
      {/* Directory Header */}
      <div className="space-y-3 border-b border-slate-200 pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
            UNIVERSAL EVENT DIRECTORY
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight">
            Discover Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Events near <strong>{selectedCity}</strong> are prioritized top. All regional events remain visible and discoverable below.
          </p>
        </div>

        {/* Priority Location Switcher */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-slate-600" />
          <span>Priority Location:</span>
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity && onSelectCity(e.target.value)}
            className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            {SUPPORTED_CITIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search & Multi-Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 font-mono">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, city, college, or company..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-sans focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Organizer Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Organizer:</span>
            <select
              value={selectedOrgType}
              onChange={(e) => setSelectedOrgType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {ORGANIZER_TYPES.map((org) => (
                <option key={org} value={org}>
                  {org === 'ALL' ? 'All Organizers' : org}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedCategory !== 'ALL' || selectedOrgType !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedOrgType('ALL');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-900 underline font-bold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Events Grid using Reusable EventCard */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 font-mono space-y-2">
          <p className="text-sm font-bold text-slate-700">No events matched your criteria.</p>
          <p className="text-xs text-slate-500">Try resetting filters or searching for another location.</p>
        </div>
      )}
    </div>
  );
}
