import React from 'react';
import {
  Compass,
  Users,
  Building2,
  Calendar,
  MapPin,
  Shield,
  ArrowRight,
  Search,
  CheckCircle2,
  Layers,
  Zap,
  BookOpen,
  Briefcase,
  Trophy,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  Check
} from 'lucide-react';
import { EVENT_CATEGORIES, SUPPORTED_CITIES } from '../services/sasmEventsData';

export default function OverviewPage({ onNavigate }) {
  return (
    <div className="space-y-16 pb-20 font-sans bg-slate-50/50">
      
      {/* ─────────────────────────────────────────────────────────────
          1. PAGE INTRODUCTION
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-900">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>PLATFORM OVERVIEW &amp; ARCHITECTURE</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 uppercase tracking-tight leading-[1.1]">
              SASM Overview
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl">
              SASM is a universal event discovery and management platform designed to connect attendees with events while providing event organizers with a structured, real-time system to publish, manage, and execute operations seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. WHAT SASM CONNECTS (ECOSYSTEM ARCHITECTURE)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
            ECOSYSTEM DIAGRAM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
            What SASM Connects
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A three-pillar ecosystem serving attendees, organizers, and live event experiences.
          </p>
        </div>

        {/* Ecosystem Box Diagram */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          
          {/* Top Platform Core Box */}
          <div className="max-w-xs mx-auto text-center p-4 rounded-2xl bg-slate-950 text-white font-mono text-xs font-bold tracking-widest border border-slate-800 shadow-xs">
            <span>[ SASM PLATFORM ENGINE ]</span>
          </div>

          {/* Clean Connector Line */}
          <div className="flex flex-col items-center justify-center text-slate-300 my-1">
            <div className="w-0.5 h-6 bg-slate-200" />
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* Pillar 1: Users */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">USERS</h3>
                  <span className="text-[11px] font-mono text-slate-500">Attendees &amp; Participants</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 font-mono pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Discover events by location</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Register &amp; save schedules</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Track registration status</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2: Organizers */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">ORGANIZERS</h3>
                  <span className="text-[11px] font-mono text-slate-500">Institutions &amp; Hosts</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 font-mono pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Create &amp; publish events</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Manage agendas &amp; speakers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Monitor live stage execution</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3: Events */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">EVENTS</h3>
                  <span className="text-[11px] font-mono text-slate-500">Live Experiences</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 font-mono pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Explore agendas &amp; venues</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Attend sessions &amp; workshops</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Experience live execution</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. FOR USERS (DISCOVER & LOCATION BEHAVIOR)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
          
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
              FOR ATTENDEES &amp; PARTICIPANTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
              Discover Events Easily
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              SASM gives users a streamlined path to search, evaluate, and join events without clutter or location barriers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-950">Search &amp; Filter</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Find events by title, organizer, institution, topic, or date with instant search indexing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-950">Location Selection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Set a priority discovery location to bubble local events to the top of your directory.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-950">Category Exploration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse across technology, academia, sports, business, arts, hackathons, and community meetups.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-950">Comprehensive Details</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect keynotes, venue maps, schedules, organizer contact details, and eligibility criteria.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-950">Registration &amp; Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reserve your spot instantly and receive clear registration confirmation status.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-950">Personal Event Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track registered events, saved schedules, and upcoming sessions in your user dashboard.
              </p>
            </div>
          </div>

          {/* Location Behavior Callout */}
          <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-4 font-mono text-xs border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>IMPORTANT LOCATION BEHAVIOR</span>
            </div>
            
            <blockquote className="text-sm font-sans font-semibold text-slate-200 leading-relaxed border-l-2 border-indigo-500 pl-4">
              "Select a city to prioritize events near that location while still keeping other available events discoverable."
            </blockquote>

            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 border-t border-slate-800">
              <div className="space-y-1">
                <span className="text-white font-bold block">1. Priority City Selected (e.g. Ahmedabad)</span>
                <p className="text-[11px] text-slate-400">Events matching Ahmedabad are sorted directly to the top under "Recommended near Ahmedabad".</p>
              </div>
              <div className="space-y-1">
                <span className="text-white font-bold block">2. Regional &amp; Other Cities Remain Visible</span>
                <p className="text-[11px] text-slate-400">Events from Mumbai, Vadodara, Surat, etc. remain fully visible below under "More Locations".</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FOR EVENT MANAGERS
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
          
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
                FOR ORGANIZERS &amp; INSTITUTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                Conduct and Manage Events
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                SASM provides event hosts with structured tools for event creation, live telemetry, teleprompter control, and real-time agenda adjustments.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/login')}
              className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs transition flex items-center gap-2 shadow-xs"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Host Login &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-950 block">01. Create &amp; Detail</span>
              <p className="text-slate-600 text-[11px]">Define event titles, organizers, descriptions, venue details, and custom tags.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-950 block">02. Schedule &amp; Timings</span>
              <p className="text-slate-600 text-[11px]">Set start dates, end dates, session timings, and live stage countdowns.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-950 block">03. Requirements &amp; Caps</span>
              <p className="text-slate-600 text-[11px]">Establish eligibility guidelines, participant limits, and registration deadlines.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-950 block">04. Live Execution</span>
              <p className="text-slate-600 text-[11px]">Monitor activity status, control stage delay offsets, and trigger announcements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. EVENT TYPES (EXAMPLES)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
            VERSATILE CATEGORY COVERAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
            Supported Event Formats
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            SASM supports a broad spectrum of event genres. These categories represent common examples and can expand over time.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs">
          {[
            'Technology',
            'Education',
            'Business',
            'Cultural',
            'Sports',
            'Entertainment',
            'Workshops',
            'Conferences',
            'Hackathons',
            'Competitions',
            'Networking',
            'Community',
            'Exhibitions',
            'Other Events'
          ].map((type) => (
            <div
              key={type}
              className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-center shadow-xs"
            >
              {type}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LOCATION COVERAGE
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xs">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
              REGIONAL &amp; MULTI-CITY SCALE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
              Location Coverage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              SASM is engineered for seamless event discovery across different cities and regions, with an extensible framework designed for ongoing geographic expansion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {SUPPORTED_CITIES.map((c) => (
              <span
                key={c.id}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold"
              >
                📍 {c.name}
              </span>
            ))}
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-950 text-white font-bold">
              + Future Regional Cities
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. EVENT DISCOVERY FLOW
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
            USER JOURNEY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
            Event Discovery Flow
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono text-xs">
          {[
            '01. Choose Location',
            '02. Browse Events',
            '03. Filter / Search',
            '04. View Event',
            '05. Register / Join',
            '06. Track Event',
            '07. Experience'
          ].map((step, idx) => (
            <div
              key={step}
              className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-center shadow-xs flex flex-col justify-center"
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. ORGANIZER FLOW
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
            HOST WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
            Organizer Execution Flow
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono text-xs">
          {[
            '01. Host Login',
            '02. Create Event',
            '03. Add Info',
            '04. Publish Event',
            '05. User Discovery',
            '06. Registrations',
            '07. Live Execution'
          ].map((step) => (
            <div
              key={step}
              className="p-3.5 rounded-xl bg-slate-950 text-white font-bold text-center border border-slate-800 shadow-xs flex flex-col justify-center"
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. WHY SASM (CORE ADVANTAGES)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
            PLATFORM VALUE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
            Why SASM
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 font-sans">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-tight">One Place</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover different types of events through a single unified interface.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-tight">Location-Aware</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find nearby events easily while keeping regional events discoverable.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-tight">Multiple Formats</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Support diverse categories instead of restricting to a single niche.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-tight">Organizer Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide a structured, real-time operating system for event hosts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-tight">Simple Discovery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seamlessly transition from initial discovery to active event participation.
            </p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. PLATFORM EXPERIENCE JOURNEY
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="text-center font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">
            PLATFORM EXPERIENCE STAGES
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-bold text-slate-900">
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200">Discover</span>
            <span>&rarr;</span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200">Understand</span>
            <span>&rarr;</span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200">Decide</span>
            <span>&rarr;</span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200">Register</span>
            <span>&rarr;</span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200">Participate</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. CALL TO ACTION (CTA SECTION)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-6 text-center max-w-4xl mx-auto shadow-md">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Ready to explore events?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-xl mx-auto">
              Start discovering upcoming events in your city or log in to manage your organization's event operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 font-mono text-xs pt-2">
            <button
              onClick={() => onNavigate('/events')}
              className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition shadow-xs flex items-center gap-2"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/login')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 font-bold hover:bg-slate-800 transition"
            >
              Sign In
            </button>

            <button
              onClick={() => onNavigate('/manager')}
              className="px-6 py-3.5 rounded-xl bg-slate-800 text-indigo-300 border border-slate-700 font-bold hover:bg-slate-700 transition"
            >
              Conduct an Event
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
