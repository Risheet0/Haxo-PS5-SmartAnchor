import React from 'react';
import { Shield, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WhatIsSasmPage({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 font-sans select-none">
      <div className="space-y-3 border-b border-slate-200 pb-8">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
          ABOUT THE PLATFORM
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight">
          What is SASM?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          SASM is a universal event discovery and management platform built for technology festivals, academic conferences, hackathons, corporate expos, and community gatherings.
        </p>
      </div>

      <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold text-slate-950 font-sans uppercase tracking-tight">
            1. Universal Event Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Built for diverse event formats: coding hackathons, AI workshops, university festivals, corporate summits, sports tournaments, and cultural celebrations across multiple cities.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold text-slate-950 font-sans uppercase tracking-tight">
            2. Multi-City Location-Aware Discovery
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            SASM prioritizes events based on the user's selected location while keeping all regional gatherings visible and discoverable across different hubs.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold text-slate-950 font-sans uppercase tracking-tight">
            3. Integrated Stage Operations for Managers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Event managers gain access to real-time execution tools: timer engines, delay cascading, anchor prompter routing, and stage confidence HUD monitors.
          </p>
        </div>
      </div>

      <div className="pt-4 flex flex-wrap gap-3 font-mono">
        <button
          onClick={() => onNavigate('/login')}
          className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition"
        >
          Sign In to Discover Events
        </button>
        <button
          onClick={() => onNavigate('/how-it-works')}
          className="px-6 py-3 rounded-xl bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs hover:bg-slate-200 transition"
        >
          Learn How It Works &rarr;
        </button>
      </div>
    </div>
  );
}
