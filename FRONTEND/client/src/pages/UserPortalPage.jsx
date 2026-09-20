import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Search,
  Filter,
  Bookmark,
  LogOut,
  Building2,
  Compass,
  Check,
  Globe,
  SlidersHorizontal,
  Clock,
  Shield,
  Layers
} from 'lucide-react';
import {
  SASM_MOCK_EVENTS,
  SUPPORTED_CITIES,
  EVENT_CATEGORIES,
  sortEventsByLocation
} from '../services/sasmEventsData';
import EventCard from '../components/EventCard';

export default function UserPortalPage({
  selectedCity = 'Ahmedabad',
  onSelectCity,
  onNavigate,
  currentUser,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'explore' | 'my-events' | 'saved' | 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Local storage state for registered & saved events
  const [registeredEventIds, setRegisteredEventIds] = useState(() => {
    try {
      const saved = localStorage.getItem('sasm_registered_events');
      return saved ? JSON.parse(saved) : ['sasm-ev-1', 'sasm-ev-4'];
    } catch {
      return ['sasm-ev-1', 'sasm-ev-4'];
    }
  });

  const [savedEventIds, setSavedEventIds] = useState(() => {
    try {
      const saved = localStorage.getItem('sasm_saved_events');
      return saved ? JSON.parse(saved) : ['sasm-ev-2'];
    } catch {
      return ['sasm-ev-2'];
    }
  });

  const userName = currentUser?.name || 'Alex Johnson';
  const userEmail = currentUser?.email || 'alex.johnson@student.edu';

  // Toggle registration handler
  const handleToggleRegistration = (eventId) => {
    setRegisteredEventIds((prev) => {
      const updated = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      localStorage.setItem('sasm_registered_events', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle saved event handler
  const handleToggleSave = (eventId) => {
    setSavedEventIds((prev) => {
      const updated = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      localStorage.setItem('sasm_saved_events', JSON.stringify(updated));
      return updated;
    });
  };

  // Location priority sorted events
  const sortedEvents = sortEventsByLocation(SASM_MOCK_EVENTS, selectedCity);

  // Filtered dataset based on search & category
  const filteredEvents = sortedEvents.filter((ev) => {
    const matchesCategory = selectedCategory === 'ALL' || ev.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.tags && ev.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  // Split into priority city match vs other cities
  const priorityCityEvents = filteredEvents.filter(
    (e) => e.city.toLowerCase().trim() === selectedCity.toLowerCase().trim()
  );
  const otherCityEvents = filteredEvents.filter(
    (e) => e.city.toLowerCase().trim() !== selectedCity.toLowerCase().trim()
  );

  // Registered events dataset
  const registeredEvents = SASM_MOCK_EVENTS.filter((e) => registeredEventIds.includes(e.id));
  // Saved events dataset
  const savedEvents = SASM_MOCK_EVENTS.filter((e) => savedEventIds.includes(e.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. DASHBOARD HEADER & USER NAVIGATION
          ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 select-none">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white font-mono font-bold text-xl flex items-center justify-center shadow-xs flex-shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                  Welcome, {userName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-900 border border-slate-200">
                  VERIFIED ATTENDEE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {userEmail} • Selected Location: <strong>{selectedCity}</strong>
              </p>
            </div>
          </div>

          {/* Header Action Shortcuts */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Compass },
              { id: 'explore', label: `Explore Events (${filteredEvents.length})`, icon: Globe },
              { id: 'my-events', label: `My Events (${registeredEvents.length})`, icon: CheckCircle2 },
              { id: 'saved', label: `Saved (${savedEvents.length})`, icon: Bookmark },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. LOCATION SELECTOR & SEARCH BAR (NEAR TOP)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          
          {/* Location Selector */}
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <MapPin className="w-4 h-4 text-slate-700" />
            <span className="text-slate-400 uppercase">Your Selected Location:</span>
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity && onSelectCity(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300 font-bold text-slate-950 text-xs focus:outline-none cursor-pointer"
            >
              {SUPPORTED_CITIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 text-[11px]">
            📍 Events near {selectedCity} appear first. Regional events remain discoverable below.
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name, organizer, category, location, or keyword..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 hover:text-slate-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
          <span className="text-slate-400 font-bold text-[11px] mr-1">CATEGORIES:</span>
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg border text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TAB CONTENT RENDERER
          ───────────────────────────────────────────────────────────── */}

      {/* ── TAB 1: MAIN DASHBOARD OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-10">
          
          {/* Section A: Recommended Events near Selected Location */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-slate-900" />
                  <span>RECOMMENDED NEAR {selectedCity.toUpperCase()}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight mt-0.5">
                  Priority Events ({priorityCityEvents.length})
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('explore')}
                className="text-xs font-mono font-bold text-slate-900 hover:text-slate-600 flex items-center gap-1"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {priorityCityEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {priorityCityEvents.map((event) => (
                  <UserDashboardEventCard
                    key={event.id}
                    event={event}
                    onNavigate={onNavigate}
                    isRegistered={registeredEventIds.includes(event.id)}
                    isSaved={savedEventIds.includes(event.id)}
                    onToggleRegister={() => handleToggleRegistration(event.id)}
                    onToggleSave={() => handleToggleSave(event.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 font-mono text-center text-xs text-slate-500">
                No events found matching "{selectedCity}". Events from other regions are displayed below.
              </div>
            )}
          </div>

          {/* Section B: More Events (Other Regional Cities) */}
          {otherCityEvents.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span>MORE LOCATIONS &amp; REGIONAL HUBS</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 uppercase tracking-tight mt-0.5">
                  More Events Across Regions ({otherCityEvents.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherCityEvents.map((event) => (
                  <UserDashboardEventCard
                    key={event.id}
                    event={event}
                    onNavigate={onNavigate}
                    isRegistered={registeredEventIds.includes(event.id)}
                    isSaved={savedEventIds.includes(event.id)}
                    onToggleRegister={() => handleToggleRegistration(event.id)}
                    onToggleSave={() => handleToggleSave(event.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section C: Upcoming Events Overview */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-950 uppercase tracking-tight">
              Upcoming Events Calendar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SASM_MOCK_EVENTS.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onNavigate(`/events/${ev.id}`)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-400 transition cursor-pointer flex items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{ev.category} • {ev.city}</span>
                    <h4 className="font-bold text-slate-950 font-sans text-sm line-clamp-1">{ev.title}</h4>
                    <p className="text-slate-500 text-[11px]">{ev.date} • {ev.startTime}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex-shrink-0">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: EXPLORE EVENTS (FULL DIRECTORY) ── */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-950 uppercase tracking-tight">
              All Available Events ({filteredEvents.length})
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Filtering by: {selectedCategory} • Location: {selectedCity}
            </span>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <UserDashboardEventCard
                  key={event.id}
                  event={event}
                  onNavigate={onNavigate}
                  isRegistered={registeredEventIds.includes(event.id)}
                  isSaved={savedEventIds.includes(event.id)}
                  onToggleRegister={() => handleToggleRegistration(event.id)}
                  onToggleSave={() => handleToggleSave(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center font-mono space-y-2">
              <p className="text-sm font-bold text-slate-800">No events found matching criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: MY EVENTS (REGISTERED EVENTS) ── */}
      {activeTab === 'my-events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-950 uppercase tracking-tight">
                My Registered Events ({registeredEvents.length})
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Events you have confirmed participation or registered for.
              </p>
            </div>
          </div>

          {registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registeredEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 font-sans flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {event.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        CONFIRMED REGISTERED
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-950 leading-snug">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        {event.institution} • {event.city}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1 text-xs font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.date} ({event.startTime} - {event.endTime})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.venue || event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-xs">
                    <button
                      onClick={() => handleToggleRegistration(event.id)}
                      className="text-slate-500 hover:text-rose-600 text-[11px] font-bold"
                    >
                      Cancel Registration
                    </button>
                    <button
                      onClick={() => onNavigate(`/events/${event.id}`)}
                      className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center font-mono space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">You haven't joined any events yet.</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Explore events in your city or region and click "Register" to track your schedule here.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs"
              >
                Explore Events
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: SAVED EVENTS ── */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-950 uppercase tracking-tight">
              Saved / Bookmarked Events ({savedEvents.length})
            </h2>
          </div>

          {savedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedEvents.map((event) => (
                <UserDashboardEventCard
                  key={event.id}
                  event={event}
                  onNavigate={onNavigate}
                  isRegistered={registeredEventIds.includes(event.id)}
                  isSaved={true}
                  onToggleRegister={() => handleToggleRegistration(event.id)}
                  onToggleSave={() => handleToggleSave(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center font-mono space-y-3">
              <p className="text-sm font-bold text-slate-800">No saved events found.</p>
              <p className="text-xs text-slate-500">Bookmark events while browsing to save them for quick reference.</p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs"
              >
                Explore Events
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: PROFILE ── */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 space-y-6 font-mono text-xs shadow-xs">
          <h2 className="text-lg font-bold text-slate-950 uppercase tracking-tight">
            User Account Profile
          </h2>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <span className="text-slate-400 block font-bold">FULL NAME</span>
              <span className="font-bold text-slate-900 text-sm">{userName}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-bold">EMAIL ADDRESS</span>
              <span className="font-bold text-slate-900 text-sm">{userEmail}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-bold">ACCOUNT ROLE</span>
              <span className="font-bold text-slate-900 text-sm">Verified Attendee / Participant</span>
            </div>

            <div>
              <span className="text-slate-400 block font-bold">PRIMARY DISCOVERY LOCATION</span>
              <span className="font-bold text-slate-900 text-sm">{selectedCity}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/** Modular User Dashboard Event Card with Register & Bookmark Toggles */
function UserDashboardEventCard({
  event,
  onNavigate,
  isRegistered,
  isSaved,
  onToggleRegister,
  onToggleSave
}) {
  const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between select-none font-sans">
      <div>
        {/* Image & Badges Header */}
        <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
          <img
            src={event.image || defaultImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
          
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950/85 text-white backdrop-blur-xs">
              {event.category}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={`p-1.5 rounded-lg border text-xs backdrop-blur-xs transition ${
                isSaved
                  ? 'bg-amber-400 text-slate-950 border-amber-500'
                  : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-white'
              }`}
              title={isSaved ? 'Saved' : 'Bookmark Event'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <h3
            onClick={() => onNavigate(`/events/${event.id}`)}
            className="text-base font-bold text-slate-950 group-hover:text-indigo-600 transition cursor-pointer leading-snug line-clamp-2"
          >
            {event.title}
          </h3>

          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800 truncate">{event.organizer}</p>
            {event.institution && (
              <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{event.institution}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-slate-900">{event.city}</span>
              <span className="truncate">• {event.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{event.date} • {event.startTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRegister();
          }}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1 ${
            isRegistered
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-slate-950 hover:bg-slate-800 text-white'
          }`}
        >
          {isRegistered ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Registered</span>
            </>
          ) : (
            <span>Register Now</span>
          )}
        </button>

        <button
          onClick={() => onNavigate(`/events/${event.id}`)}
          className="font-bold text-slate-900 hover:underline flex items-center gap-1"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
