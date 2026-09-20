import React from 'react';
import SasmLogo from './SasmLogo';

export default function SasmFooter({ onNavigate }) {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <SasmLogo variant="dark" onClick={() => onNavigate && onNavigate('/')} />
            <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
              The universal platform for discovering, joining, and managing technology summits, college festivals, company hackathons, and community events across regions.
            </p>
            <div className="pt-2 font-mono text-xs text-slate-500">
              <span>Universal Regional &amp; Multi-City Coverage</span>
            </div>
          </div>

          {/* Public Discovery */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Discovery
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate && onNavigate('/events')} className="hover:text-white transition">
                  Technology Summits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/events')} className="hover:text-white transition">
                  College Festivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/events')} className="hover:text-white transition">
                  Company Hackathons
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/events')} className="hover:text-white transition">
                  AI &amp; Coding Events
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate && onNavigate('/overview')} className="hover:text-white transition">
                  Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/what-is-sasm')} className="hover:text-white transition">
                  What is SASM?
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/learn')} className="hover:text-white transition">
                  Learn
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/how-it-works')} className="hover:text-white transition">
                  How it Works
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Roles */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate && onNavigate('/user')} className="hover:text-white transition">
                  User Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/login')} className="hover:text-white transition">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/signup')} className="hover:text-white transition">
                  Get Started
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-3">
          <p>© 2026 SASM Platform. All rights reserved. Universal Events Platform.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Multi-City Event Network</span>
            <span>•</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
