import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Radio,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

export default function StageDisplayModal({
  isOpen,
  onClose,
  event,
  agenda = [],
  activeAnnouncement
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Precision clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener (F for fullscreen, Esc to exit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-hide controls after 4 seconds of inactivity
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  if (!isOpen) return null;

  const currentLive =
    agenda.find((a) => a.status === 'LIVE') ||
    agenda.find((a) => a.status === 'UPCOMING') ||
    agenda[0];

  const currentIndex = agenda.findIndex((a) => a.id === currentLive?.id);
  const nextActivity =
    currentIndex >= 0 && currentIndex + 1 < agenda.length
      ? agenda[currentIndex + 1]
      : null;

  const eventName = event?.name || 'TECHFEST 2026';
  const eventVenue = event?.venue || 'Grand Auditorium';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Stage Display Confidence Monitor"
      className={`fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto select-none animate-fade-in font-['Plus_Jakarta_Sans',sans-serif] ${
        isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP MINIMALIST HEADER & DISCREET OVERLAY CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between flex-shrink-0">
        
        {/* Event Branding */}
        <div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-widest font-mono ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {eventName}
          </h1>
          <p className={`text-xs sm:text-sm font-semibold mt-1 uppercase tracking-wider ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {eventVenue}
          </p>
        </div>

        {/* Discreet Controls (Auto-fades for seamless presentation) */}
        <div
          className={`flex items-center gap-3 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'
          }`}
        >
          {/* Live Stage Clock */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold ${
            isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
          }`}>
            <Clock className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span>{currentTimeStr}</span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition ${
              isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-xs'
            }`}
            title="Toggle Light / Dark Stage Display"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition ${
              isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-xs'
            }`}
            title="Toggle Fullscreen presentation mode [F]"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition ${
              isDarkMode ? 'bg-white/5 hover:bg-red-600/80 text-slate-400 hover:text-white border-white/10' : 'bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200 shadow-xs'
            }`}
            title="Exit Stage Display [ESC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. ACTIVE EMERGENCY STAGE OVERRIDE (IF ACTIVE)
          ───────────────────────────────────────────────────────────── */}
      {activeAnnouncement && activeAnnouncement.is_active === 1 && (
        <div className="my-4 p-5 rounded-2xl bg-red-50 border-2 border-red-500 text-red-950 flex items-center gap-4 shadow-lg flex-shrink-0">
          <AlertTriangle className="w-7 h-7 text-red-600 flex-shrink-0" />
          <div>
            <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-widest text-red-700 block mb-0.5">
              STAGE NOTICE:
            </span>
            <p className="text-base sm:text-xl font-bold text-red-950">
              "{activeAnnouncement.ai_script || activeAnnouncement.original_prompt}"
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN STAGE HERO: LIVE NOW
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center my-4 sm:my-6 space-y-3">
        
        {/* Live Now Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white font-mono text-xs sm:text-sm font-bold tracking-widest uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>LIVE NOW</span>
          </div>

          {currentLive?.start_time && (
            <span className={`text-xs sm:text-sm font-mono font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {currentLive.start_time} - {currentLive.end_time}
            </span>
          )}
        </div>

        {/* Current Session Title (Massive high-contrast typography) */}
        <h2 className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight uppercase leading-[1.08] max-w-6xl ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          {currentLive?.title || 'Main Stage Presentation'}
        </h2>

        {/* Speaker Name / Dignitary */}
        {currentLive?.speaker_name && (
          <div className="pt-1 sm:pt-2">
            <p className={`text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight ${
              isDarkMode ? 'text-indigo-400 font-extrabold' : 'text-indigo-700'
            }`}>
              {currentLive.speaker_name}
            </p>
            {currentLive.speaker_org && (
              <p className={`text-xs sm:text-base md:text-lg font-medium mt-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {currentLive.speaker_org}
              </p>
            )}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM SECTION: NEXT UP
          ───────────────────────────────────────────────────────────── */}
      <footer className={`pt-4 sm:pt-6 border-t flex-shrink-0 ${
        isDarkMode ? 'border-white/10' : 'border-slate-200'
      }`}>
        {nextActivity ? (
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6">
            <div className="space-y-1 min-w-0 flex-1">
              <span className={`text-xs sm:text-sm font-bold uppercase tracking-widest font-mono block ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                NEXT
              </span>
              <h3 className={`text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight truncate ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {nextActivity.title}
              </h3>
              {nextActivity.speaker_name && (
                <p className={`text-xs sm:text-base font-medium truncate ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {nextActivity.speaker_name}
                </p>
              )}
            </div>

            <div className="text-left sm:text-right font-mono flex-shrink-0">
              <span className={`text-base sm:text-xl md:text-2xl lg:text-3xl font-bold block ${
                isDarkMode ? 'text-slate-300' : 'text-slate-800'
              }`}>
                {nextActivity.start_time}
              </span>
              {nextActivity.duration_minutes && (
                <span className={`text-xs font-semibold block ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {nextActivity.duration_minutes} min duration
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className={`flex items-center justify-between font-mono text-xs sm:text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span className="uppercase tracking-wider">Final Session of the Day</span>
            <span>Thank you for attending {eventName}</span>
          </div>
        )}
      </footer>
    </div>
  );
}
