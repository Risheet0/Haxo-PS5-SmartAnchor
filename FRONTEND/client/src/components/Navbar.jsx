import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  AlertTriangle,
  Hourglass,
  Tv,
  Monitor,
  Bell,
  Menu,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import StatusBadge from './ui/StatusBadge';

export default function Navbar({
  event,
  connected,
  activeAnnouncementsCount = 0,
  onOpenDelay,
  onOpenEmergency,
  onOpenTeleprompter,
  onOpenStageDisplay,
  onToggleSidebarMobile,
  currentLiveItem
}) {
  const [timeStr, setTimeStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const eventName = event?.name || 'TECHFEST 2026';
  const eventStatus = event?.status || 'LIVE';
  const delayMinutes = event?.current_delay_minutes || 0;

  return (
    <header className="h-16 px-4 sm:px-6 mx-4 mt-3 mb-2 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between select-none sticky top-3 z-40">
      {/* Left: Mobile Menu Toggle & Event Brand */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 bg-white shadow-sm border border-slate-200/80 lg:hidden transition"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm flex-shrink-0">
            <Radio className="w-5 h-5 text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                {eventName}
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                OPS
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-xs mt-1">
              {event?.venue || 'Grand Auditorium'} • {currentLiveItem ? `Live: ${currentLiveItem.title}` : 'Stage Hub'}
            </p>
          </div>
        </div>

        {/* Status indicator badge */}
        <div className="hidden md:flex items-center pl-3 border-l border-slate-200">
          <StatusBadge status={eventStatus} delayMinutes={delayMinutes} size="md" />
        </div>
      </div>

      {/* Center/Right Actions & Operations Telemetry */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-sm">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-mono">{timeStr}</span>
        </div>

        {/* Stage HUD / Projector Confidence Monitor */}
        <button
          onClick={onOpenStageDisplay}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-semibold transition active:scale-95 shadow-sm"
          title="Open Big-Screen Confidence Monitor for Stage Projector"
        >
          <Monitor className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Stage HUD</span>
        </button>

        {/* Teleprompter Quick Action */}
        <button
          onClick={onOpenTeleprompter}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-semibold transition active:scale-95 shadow-sm"
          title="Open Anchor Teleprompter"
        >
          <Tv className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Teleprompter</span>
        </button>

        {/* Add Delay Quick Action */}
        <button
          onClick={onOpenDelay}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition active:scale-95 shadow-sm"
          title="Inject schedule delay to current or upcoming session"
        >
          <Hourglass className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">+Delay</span>
        </button>

        {/* Emergency Announcement Button */}
        <button
          onClick={onOpenEmergency}
          className="btn-pill-danger text-xs px-4 py-2 flex items-center gap-1.5"
          title="Open Emergency Stage Announcement Protocol"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>EMERGENCY</span>
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 transition relative shadow-sm"
            title="System notifications"
          >
            <Bell className="w-4 h-4" />
            {activeAnnouncementsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 soft-card p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Live Stage Alerts</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {activeAnnouncementsCount} active
                </span>
              </div>
              <div className="py-3 text-center">
                {activeAnnouncementsCount > 0 ? (
                  <p className="text-xs text-red-600 font-medium">Stage broadcast alert in progress!</p>
                ) : (
                  <p className="text-xs text-slate-500">All stage systems nominal. No active emergency cues.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}