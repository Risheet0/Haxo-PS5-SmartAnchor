import React from 'react';
import { Shield, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WhatIsSasmPage({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 font-sans">
      <div className="space-y-3 border-b border-slate-200 pb-8">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
          ABOUT THE PLATFORM
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight">
          What is SASM?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          SASM is a specialized event platform created specifically for technology festivals, engineering competitions, hackathons, and developer conferences.
        </p>
      </div>

      <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
          <h2 className="text-lg font-bold text-slate-950 font-sans uppercase tracking-tight">
            1. Dedicated to Technology &amp; Engineering
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Unlike generic ticketing platforms, SASM is built around the unique needs of technology events: coding competitions, AI workshops, robotics arenas, hardware expos, and developer summits.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
          <h2 className="text-lg font-bold text-slate-950 font-sans uppercase tracking-tight">
            2. Initial Focus: Ahmedabad Region
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Ahmedabad is one of India's fastest growing technology hubs, home to GTU, Nirma University, Adani University, IIT Gandhinagar, and active GDG/AWS communities. SASM aggregates all regional TechFests into one clean portal.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
          <h2 className="text-lg font-bold text-slate-950 font-sans uppercase tracking-tight">
            3. Integrated Stage Operations for Managers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Event managers gain access to the SmartStage console: real-time timer engines, delay cascading, anchor prompter routing, and stage confidence HUD monitors.
          </p>
        </div>
      </div>

      <div className="pt-4 flex flex-wrap gap-3 font-mono">
        <button
          onClick={() => onNavigate('/events')}
          className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition"
        >
          Explore Ahmedabad Events
        </button>
        <button
          onClick={() => onNavigate('/manager')}
          className="px-6 py-3 rounded-xl bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs hover:bg-slate-200 transition"
        >
          Access Manager Console &rarr;
        </button>
      </div>
    </div>
  );
}
