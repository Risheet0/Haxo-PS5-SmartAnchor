import React from 'react';
import {
  ArrowRight,
  Compass,
  Users,
  Shield,
  Layers,
  Zap,
  BookOpen,
  Trophy,
  Briefcase,
  Calendar,
  User,
  CheckCircle2,
  Globe,
  Lock
} from 'lucide-react';
import { EVENT_CATEGORIES } from '../services/sasmEventsData';

export default function HomePage({
  onNavigate,
  currentUser
}) {
  // Category navigation handler
  const handleCategoryClick = () => {
    if (currentUser && currentUser.role === 'user') {
      onNavigate('/user');
    } else {
      onNavigate('/login');
    }
  };

  return (
    <div className="space-y-16 pb-20 font-sans bg-slate-50/50 select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (PUBLIC & CLEAN)
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Platform Identity Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-900">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>SASM • UNIVERSAL EVENT PLATFORM</span>
          </div>

          {/* Headline & Value Proposition */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] uppercase">
              Discover Events. <br className="hidden sm:inline" />
              Join Experiences. <span className="text-slate-500">Make Connections.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl">
              SASM is a universal event discovery and management platform for technology summits, college festivals, corporate conferences, hackathons, workshops, cultural celebrations, and sports tournaments across cities.
            </p>
          </div>

          {/* Action Callouts: Strictly Role Dependent */}
          <div className="flex flex-wrap items-center gap-3.5 font-mono pt-3">
            {!currentUser ? (
              /* LOGGED OUT: Pure Public Sign In / Get Started Actions */
              <>
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition active:scale-95 shadow-sm flex items-center gap-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('/signup')}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-bold text-xs sm:text-sm transition"
                >
                  Get Started
                </button>

                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm transition"
                >
                  How SASM Works
                </button>
              </>
            ) : currentUser.role === 'user' ? (
              /* LOGGED IN USER: Open Authenticated Dashboard */
              <>
                <button
                  onClick={() => onNavigate('/user')}
                  className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition active:scale-95 shadow-sm flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-300" />
                  <span>Open User Event Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* LOGGED IN HOST: Open Host Dashboard */
              <button
                onClick={() => onNavigate('/manager')}
                className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Open Host Dashboard &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. EVENT CATEGORIES OVERVIEW (INFORMATIONAL ONLY, NO CARDS)
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
              EVENT CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
              Platform Event Coverage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Sign in to browse active events across technology, academia, corporate business, arts, sports, and community networks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
            {EVENT_CATEGORIES.filter(c => c !== 'ALL').map((category) => (
              <div
                key={category}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-center flex flex-col items-center justify-center gap-2 shadow-xs"
              >
                <CategoryIcon category={category} />
                <span>{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. HOW SASM HELPS USERS
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
            HOW SASM HELPS YOU
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
            Designed For Attendees &amp; Organizers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-mono font-bold text-lg">
              01
            </div>
            <h3 className="text-xl font-bold text-slate-950">Discover</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Log in to search events based on location, category, date, and interests. Prioritize events near your city while keeping full visibility over regional gatherings.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-mono font-bold text-lg">
              02
            </div>
            <h3 className="text-xl font-bold text-slate-950">Explore</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              View complete event information — schedules, keynote speakers, venue locations, eligibility guidelines, and registration status before deciding to join.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-mono font-bold text-lg">
              03
            </div>
            <h3 className="text-xl font-bold text-slate-950">Experience &amp; Manage</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Participate seamlessly in live sessions or manage end-to-end event execution using SASM's integrated live control room, stage teleprompter, and delay controls.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM CALL TO ACTION BANNER
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden shadow-md">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              UNIVERSAL EVENT PLATFORM
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Get Started With SASM
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sign in to discover events across regions, join vibrant technology communities, or manage your organization's event operations with live stage controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-xs relative z-10 pt-2">
            {!currentUser ? (
              <>
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition shadow-xs"
                >
                  Sign In to SASM &rarr;
                </button>
                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 font-bold hover:bg-slate-800 transition"
                >
                  Learn How SASM Works
                </button>
              </>
            ) : currentUser.role === 'user' ? (
              <button
                onClick={() => onNavigate('/user')}
                className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition shadow-xs"
              >
                Go to User Event Dashboard &rarr;
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/manager')}
                className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition shadow-xs"
              >
                Launch Host Console &rarr;
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

/** Helper icon resolver for categories */
function CategoryIcon({ category }) {
  switch (category) {
    case 'Technology':
      return <Zap className="w-5 h-5 text-indigo-500 group-hover:text-white" />;
    case 'Education':
      return <BookOpen className="w-5 h-5 text-emerald-500 group-hover:text-white" />;
    case 'Business':
      return <Briefcase className="w-5 h-5 text-amber-500 group-hover:text-white" />;
    case 'Cultural':
      return <Compass className="w-5 h-5 text-purple-500 group-hover:text-white" />;
    case 'Sports':
      return <Trophy className="w-5 h-5 text-rose-500 group-hover:text-white" />;
    case 'Hackathon':
      return <Layers className="w-5 h-5 text-cyan-500 group-hover:text-white" />;
    default:
      return <Calendar className="w-5 h-5 text-slate-500 group-hover:text-white" />;
  }
}
