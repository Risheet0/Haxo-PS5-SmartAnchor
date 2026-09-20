import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ArrowRight,
  User,
  Shield,
  X,
  MapPin,
  Clock,
  Radio,
  Sliders,
  Calendar,
  Layers,
  FileText,
  Bookmark,
  Check,
  Building2,
  Activity
} from 'lucide-react';

export default function LearnPage({ onNavigate }) {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guides = [
    {
      id: 'user-guide',
      title: 'How to Use SASM User Dashboard',
      category: 'User Guide',
      readTime: '5 min read',
      icon: User,
      description: 'Complete walkthrough for attendees: discovering events, setting priority locations, searching, one-click registration, and managing joined events.',
      steps: [
        {
          num: '01',
          title: 'Sign In to User Portal',
          detail: 'Sign in selecting the "Attendee / User" role. Unauthenticated visitors are automatically routed to login when accessing protected event discovery features.'
        },
        {
          num: '02',
          title: 'Set Your Priority Discovery Location',
          detail: 'Select your preferred city (e.g., Ahmedabad, Mumbai, Bengaluru) from the location dropdown. Events near your selected city appear first under "Recommended", while all other regional events remain accessible below.'
        },
        {
          num: '03',
          title: 'Search & Filter Events',
          detail: 'Use the live search bar to filter events by topic, college, company, or category pills (Technology, Cultural, Business, Sports, Hackathons, Workshops).'
        },
        {
          num: '04',
          title: 'One-Click Event Registration',
          detail: 'Click "Register Now" on any event card to reserve your spot instantly. Confirmed events automatically appear under your "My Events" tab.'
        },
        {
          num: '05',
          title: 'Bookmark & Save Events',
          detail: 'Click the bookmark icon on any event to save it to your personal "Saved Events" tab for quick reference.'
        }
      ]
    },
    {
      id: 'manager-guide',
      title: 'How to Use SASM Manager Dashboard',
      category: 'Manager Guide',
      readTime: '8 min read',
      icon: Shield,
      description: 'Complete walkthrough for event hosts: operating the live control room, session health telemetry, stage teleprompter, delay cascading, and agenda setup.',
      steps: [
        {
          num: '01',
          title: 'Sign In to Manager Console',
          detail: 'Sign in selecting the "Event Manager" role to open the dedicated SmartStage live control room (/manager).'
        },
        {
          num: '02',
          title: 'Monitor Live Status Bar & Session Health',
          detail: 'Check real-time system readiness: Socket connection link, current active session countdown, telemetry status, and stage confidence HUD.'
        },
        {
          num: '03',
          title: 'Control Event Timeline & Session Transitions',
          detail: 'Use the Event Timeline controls to transition sessions between UPCOMING, LIVE, COMPLETED, or DELAYED status in real time.'
        },
        {
          num: '04',
          title: 'Inject & Cascade Schedule Delays',
          detail: 'Open the "Inject Delay" modal to add delay offsets (+5m, +10m, +15m). The engine automatically shifts all downstream session start/end times seamlessly.'
        },
        {
          num: '05',
          title: 'Stage Teleprompter & Broadcast Announcements',
          detail: 'Route host scripts directly to the full-screen Stage Teleprompter reader or broadcast high-priority emergency alerts across stage displays.'
        }
      ]
    },
    {
      id: 'platform-guide',
      title: 'SASM Platform Architecture & Execution Flow',
      category: 'System Guide',
      readTime: '6 min read',
      icon: Layers,
      description: 'Overview of SASM strict role separation, socket telemetry synchronization, AI script generator, and location priority algorithm.',
      steps: [
        {
          num: '01',
          title: 'Strict Role Authorization',
          detail: 'Role-based access control enforces 100% separation: Users access event discovery only (/user), while Managers access stage execution controls only (/manager).'
        },
        {
          num: '02',
          title: 'Real-Time Socket Telemetry',
          detail: 'Websocket events instantly synchronize stage updates across manager consoles, attendee schedule feeds, and confidence HUD monitors.'
        },
        {
          num: '03',
          title: 'Location Priority Sorting Algorithm',
          detail: 'Data-driven location sorting ranks local hub events top without filtering out regional events from neighboring cities.'
        },
        {
          num: '04',
          title: 'AI Stage Script Synthesizer',
          detail: 'Built-in Gemini AI generator produces tailored dignitary introductions, opening ceremony remarks, and transition announcements.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 font-sans select-none">
      
      {/* Page Header */}
      <div className="space-y-3 border-b border-slate-200 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
          <BookOpen className="w-3.5 h-3.5 text-slate-700" />
          <span>SASM KNOWLEDGE BASE &amp; USER GUIDES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight">
          Learn &amp; User Guides
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl">
          Comprehensive step-by-step guides and visual walkthroughs for SASM User Portal attendees and Manager Console event hosts.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        {guides.map((g) => {
          const GuideIcon = g.icon;
          return (
            <div
              key={g.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 flex flex-col justify-between shadow-xs hover:border-slate-400 hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                    {g.category}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {g.readTime}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-950 text-white font-mono font-bold">
                    <GuideIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 leading-snug">
                    {g.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {g.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedGuide(g)}
                className="pt-3 border-t border-slate-100 text-xs font-mono font-bold text-slate-950 flex items-center justify-between hover:text-indigo-600 transition"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive Guide Reader Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950 text-white">
                    {selectedGuide.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {selectedGuide.readTime}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                  {selectedGuide.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedGuide(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Overview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedGuide.description}
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
                Step-By-Step Instructions:
              </h3>

              <div className="space-y-3">
                {selectedGuide.steps.map((step) => (
                  <div key={step.num} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-950 text-white font-mono font-bold text-xs flex items-center justify-center">
                        {step.num}
                      </span>
                      <strong className="text-sm font-bold text-slate-950">{step.title}</strong>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-8 font-sans">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual UI Screenshots & Component Walkthrough Preview */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
                VISUAL UI WALKTHROUGH PREVIEW
              </h3>

              {/* Conditional Visual Mockup: User Section vs Manager Section */}
              {selectedGuide.id === 'user-guide' ? (
                /* User Section UI Preview Card */
                <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-4 font-mono text-xs border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>SASM USER PORTAL VIEW</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Location: Ahmedabad</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-slate-400 text-[10px] block font-bold">1. LOCATION SELECTOR</span>
                      <p className="font-sans text-xs text-slate-200 font-bold">Priority City: Ahmedabad ▼</p>
                      <p className="text-[11px] text-slate-400">Prioritizes local events top while keeping regional events discoverable.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-slate-400 text-[10px] block font-bold">2. REGISTERED EVENTS</span>
                      <p className="font-sans text-xs text-emerald-400 font-bold">My Events (2 Confirmed)</p>
                      <p className="text-[11px] text-slate-400">Track schedule, venues, keynote timing, and registration badges.</p>
                    </div>
                  </div>
                </div>
              ) : selectedGuide.id === 'manager-guide' ? (
                /* Manager Section UI Preview Card */
                <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-4 font-mono text-xs border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span>SASM MANAGER CONSOLE VIEW</span>
                    </span>
                    <span className="text-[10px] text-emerald-400">● STAGE LIVE TELEMETRY</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px]">LIVE STATUS BAR</span>
                      <p className="font-bold text-white text-xs">Socket Link: OK</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px]">STAGE DELAY ENGINE</span>
                      <p className="font-bold text-amber-400 text-xs">+10m Cascaded</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px]">TELEPROMPTER</span>
                      <p className="font-bold text-indigo-400 text-xs">Script Active</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Platform Architecture System Preview */
                <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-4 font-mono text-xs border border-slate-800 shadow-md">
                  <div className="text-center font-bold text-indigo-400 pb-2 border-b border-slate-800">
                    [ SASM ROLE SEPARATION ENGINE ]
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">USER ROLE</span>
                      <span className="text-[11px] text-slate-400">Event Discovery Only (/user)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">MANAGER ROLE</span>
                      <span className="text-[11px] text-slate-400">Stage Control Only (/manager)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition"
              >
                Close Guide
              </button>

              <button
                onClick={() => {
                  setSelectedGuide(null);
                  if (selectedGuide.id === 'manager-guide') {
                    onNavigate('/manager');
                  } else {
                    onNavigate('/login');
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1.5"
              >
                <span>{selectedGuide.id === 'manager-guide' ? 'Open Manager Console' : 'Sign In to Try Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
