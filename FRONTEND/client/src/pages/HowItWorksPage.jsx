import React from 'react';
import { User, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorksPage({ onNavigate }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 font-sans">
      <div className="space-y-3 border-b border-slate-200 pb-8 text-center sm:text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
          SYSTEM WORKFLOW
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight">
          How SASM Works
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl">
          A streamlined platform architecture connecting TechFest participants and event managers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        {/* For Attendees */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">ROLE 1</span>
              <h2 className="text-xl font-bold text-slate-950">For Users &amp; Students</h2>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <strong className="text-slate-900 block">Discover Events</strong>
                <span>Browse upcoming TechFests and hackathons filtered by Ahmedabad colleges and companies.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <strong className="text-slate-900 block">One-Click Registration</strong>
                <span>Sign in and join events, hackathons, or workshops with instant ticket confirmations.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <strong className="text-slate-900 block">Track Schedule &amp; Badges</strong>
                <span>View real-time event updates and manage joined events in your User Portal.</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/events')}
            className="w-full py-3 rounded-xl bg-slate-950 text-white font-mono font-bold text-xs hover:bg-slate-800 transition"
          >
            Browse TechFest Events
          </button>
        </div>

        {/* For Managers */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">ROLE 2</span>
              <h2 className="text-xl font-bold text-slate-950">For Event Managers</h2>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <strong className="text-slate-900 block">Publish Event Details</strong>
                <span>Set up TechFest agendas, speaker profiles, and technical requirements.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <strong className="text-slate-900 block">Live Stage Control</strong>
                <span>Run live sessions using SmartStage controls: start/pause timers, inject schedule delays, and send stage notices.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <strong className="text-slate-900 block">Telemetry &amp; Confidence HUD</strong>
                <span>Stream real-time stage status to auditorium displays and teleprompters.</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/manager')}
            className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-950 border border-indigo-200 font-mono font-bold text-xs hover:bg-indigo-100 transition"
          >
            Access Manager Dashboard &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
