import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  AlertTriangle,
  Hourglass,
  Tv,
  WifiOff,
  Monitor,
  Bell,
  User,
  Menu,
  ChevronDown,
  Sparkles,
  Volume2
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
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    <header className="h-16 border-b border-[#E2E8F0] bg-white sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between select-none shadow-sm">
      {/* Left: Mobile Menu Toggle & Event Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden border border-transparent hover:border-slate-200 transition"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/20 flex-shrink-0">
            <Radio className="w-4 h-4 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none uppercase font-mono">
                {eventName}
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                OPS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[140px] sm:max-w-xs mt-0.5">
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
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-bold tracking-wider">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{timeStr}</span>
        </div>

        {/* Stage HUD / Projector Confidence Monitor */}
        <button
          onClick={onOpenStageDisplay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-bold transition active:scale-95 shadow-sm"
          title="Open Big-Screen Confidence Monitor for Stage Projector"
        >
          <Monitor className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Projector HUD</span>
        </button>

        {/* Teleprompter Quick Action */}
        <button
          onClick={onOpenTeleprompter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-bold transition active:scale-95 shadow-sm"
          title="Open Anchor Teleprompter"
        >
          <Tv className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Teleprompter</span>
        </button>

        {/* Add Delay Quick Action */}
        <button
          onClick={onOpenDelay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 hover:border-amber-300 text-xs font-bold transition active:scale-95 shadow-sm"
          title="Inject schedule delay to current or upcoming session"
        >
          <Hourglass className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">+Delay</span>
        </button>

        {/* Emergency Announcement Button */}
        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-wide transition active:scale-95 shadow-sm border border-red-600"
          title="Open Emergency Stage Announcement Protocol"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>EMERGENCY</span>
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition relative"
            title="System notifications"
          >
            <Bell className="w-4 h-4" />
            {activeAnnouncementsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {activeAnnouncementsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 p-3 rounded-xl bg-white border border-slate-200 shadow-xl z-50 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Operations Feed</span>
                <span className="text-[10px] text-slate-400 font-mono">Live</span>
              </div>
              {activeAnnouncementsCount > 0 ? (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                  <span className="font-bold block text-red-700">Active Stage Announcement</span>
                  Check banner above for current anchor reading script.
                </div>
              ) : (
                <p className="text-slate-500 py-2 text-center">No active alerts or critical notices.</p>
              )}
            </div>
          )}
        </div>

        {/* User / Profile Pill */}
        <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
              <User className="w-3 h-3" />
            </div>
            <div className="hidden xl:block text-left">
              <span className="font-bold text-slate-800 block text-[11px] leading-tight">Stage Lead</span>
              <span className="text-[9px] text-slate-500 block leading-none font-mono">Control Room</span>
            </div>
          </div>

          {/* Connection Health Pill */}
          <div
            className="flex items-center justify-center p-1.5"
            title={connected ? 'Real-time Hub Connected' : 'Disconnected / Reconnecting'}
          >
            {connected ? (
              <span className="relative flex h-2.5 w-2.5" title="Socket Connected">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : (
              <WifiOff className="w-4 h-4 text-red-500 animate-pulse" title="Socket Reconnecting" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}