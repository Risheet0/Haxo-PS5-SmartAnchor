import React, { useState } from 'react';
import {
  Compass,
  Info,
  BookOpen,
  HelpCircle,
  Calendar,
  Shield,
  Menu,
  X,
  MapPin,
  ChevronDown,
  ArrowUpRight,
  User,
  LogOut,
  Bookmark,
  CheckCircle2,
  Globe
} from 'lucide-react';
import SasmLogo from './SasmLogo';
import { SUPPORTED_CITIES } from '../services/sasmEventsData';

export default function SasmNavbar({
  currentPath = '/',
  selectedCity = 'Ahmedabad',
  onSelectCity,
  onNavigate,
  currentUser,
  onLogout
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Dynamic Navigation Links construction based on exact authentication role
  let navLinks = [];

  if (!currentUser) {
    // 1. LOGGED-OUT STATE: Pure public informational navigation ONLY
    navLinks = [
      { label: 'Home', path: '/', icon: Compass },
      { label: 'Overview', path: '/overview', icon: Info },
      { label: 'What is SASM?', path: '/what-is-sasm', icon: Shield },
      { label: 'Learn', path: '/learn', icon: BookOpen },
      { label: 'How It Works', path: '/how-it-works', icon: HelpCircle }
    ];
  } else if (currentUser.role === 'user') {
    // 2. USER LOGGED IN STATE: User-specific event discovery navigation ONLY
    navLinks = [
      { label: 'Home', path: '/', icon: Compass },
      { label: 'Explore Events', path: '/events', icon: Globe },
      { label: 'My Events', path: '/user', icon: CheckCircle2 },
      { label: 'Saved Events', path: '/user', icon: Bookmark }
    ];
  } else if (currentUser.role === 'manager') {
    // 3. MANAGER LOGGED IN STATE: Manager-specific navigation ONLY
    navLinks = [
      { label: 'Home', path: '/', icon: Compass },
      { label: 'Manager Dashboard', path: '/manager', icon: Shield }
    ];
  }

  const handleLinkClick = (path) => {
    setIsMobileMenuOpen(false);
    setIsCityDropdownOpen(false);
    if (onNavigate) onNavigate(path);
  };

  const handleCityChange = (cityName) => {
    setIsCityDropdownOpen(false);
    if (onSelectCity) onSelectCity(cityName);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: SASM Logo & Nav Links */}
        <div className="flex items-center gap-6 lg:gap-8">
          <SasmLogo onClick={() => handleLinkClick('/')} />

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 font-mono">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.label + link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Authentication Actions */}
        <div className="hidden sm:flex items-center gap-3 font-mono">
          {currentUser ? (
            /* Logged-In User or Manager Actions */
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLinkClick(currentUser.role === 'manager' ? '/manager' : '/user')}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                  currentPath === '/user' || currentPath === '/manager'
                    ? 'bg-slate-950 text-white border-slate-950'
                    : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {currentUser.role === 'manager' ? (
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-700" />
                )}
                <span>{currentUser.name}</span>
              </button>

              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-950 border border-slate-200 text-xs font-bold transition flex items-center gap-1"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Logged-Out Public Actions */
            <>
              <button
                onClick={() => handleLinkClick('/login')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  currentPath === '/login'
                    ? 'text-slate-950 font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Sign In
              </button>

              <button
                onClick={() => handleLinkClick('/signup')}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95 shadow-sm flex items-center gap-1"
              >
                <span>Get Started</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex sm:hidden items-center gap-2">
          {!currentUser ? (
            <button
              onClick={() => handleLinkClick('/login')}
              className="px-3 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-bold font-mono"
            >
              SIGN IN
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold font-mono"
            >
              LOGOUT
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white p-4 space-y-3 font-mono">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const LinkIcon = link.icon;
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.label + link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LinkIcon className="w-4 h-4 opacity-70" />
                    <span>{link.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {!currentUser ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                onClick={() => handleLinkClick('/login')}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold text-center border border-slate-200"
              >
                Sign In
              </button>
              <button
                onClick={() => handleLinkClick('/signup')}
                className="w-full py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold text-center"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold text-center border border-rose-200"
              >
                Logout ({currentUser.name})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
