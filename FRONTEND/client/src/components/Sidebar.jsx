import React from 'react';
import {
  LayoutDashboard,
  Radio,
  CalendarDays,
  Users,
  Sparkles,
  Clock4,
  Monitor,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Mic2,
  Tv
} from 'lucide-react';

export default function Sidebar({
  currentTab,
  onSelectTab,
  collapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
  onOpenStageDisplay,
  agendaStats = {
    total: 7,
    completed: 2,
    live: 1,
    upcoming: 4,
    delay: 0
  }
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Overview & telemetry'
    },
    {
      id: 'live',
      label: 'Live Control',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'live',
      desc: 'Real-time stage runner'
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: CalendarDays,
      count: agendaStats.total,
      desc: 'Rundown & schedule'
    },
    {
      id: 'speakers',
      label: 'Speakers',
      icon: Users,
      desc: 'Dignitaries & bios'
    },
    {
      id: 'scripts',
      label: 'AI Scripts',
      icon: Sparkles,
      highlight: true,
      desc: 'Anchor teleprompter gen'
    },
    {
      id: 'delay',
      label: 'Delays',
      icon: Clock4,
      badge: agendaStats.delay > 0 ? `+${agendaStats.delay}m` : null,
      badgeColor: 'warning',
      desc: 'Cascade scheduler'
    },
    {
      id: 'stage-display',
      label: 'Stage Display',
      icon: Monitor,
      isAction: true,
      onClick: onOpenStageDisplay,
      desc: 'Projector confidence HUD'
    },
    {
      id: 'setup',
      label: 'Event Setup',
      icon: Calendar,
      desc: 'Event config & info'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      desc: 'Audio, AV & demo reset'
    }
  ];

  const progress = Math.min(
    100,
    Math.round((agendaStats.completed / (agendaStats.total || 1)) * 100)
  );

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Header / Progress Widget */}
      <div className="p-3 space-y-4">
        {/* Mobile close button */}
        <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Mic2 className="w-4 h-4 text-indigo-600" />
            <span>Navigation Menu</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event Flow Progress Meter (Expanded only) */}
        {!collapsed && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 text-[10px]">
                <Mic2 className="w-3 h-3 text-indigo-600" />
                Stage Progress
              </span>
              <span className="text-indigo-600 font-mono font-bold text-xs">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2.5">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
              <div className="p-1 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[8px] font-bold">DONE</span>
                <span className="font-bold text-slate-800">{agendaStats.completed}</span>
              </div>
              <div className="p-1 rounded bg-red-50 border border-red-200">
                <span className="text-red-600 block text-[8px] font-bold">LIVE</span>
                <span className="font-bold text-red-700">{agendaStats.live}</span>
              </div>
              <div className="p-1 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[8px] font-bold">QUEUED</span>
                <span className="font-bold text-slate-700">{agendaStats.upcoming}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction && item.onClick) {
                    item.onClick();
                  } else {
                    onSelectTab(item.id);
                  }
                  if (onCloseMobile) onCloseMobile();
                }}
                title={collapsed ? `${item.label} - ${item.desc}` : undefined}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                } rounded-lg text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {/* Active left indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-600 rounded-r" />
                )}

                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive
                        ? 'text-indigo-600'
                        : item.highlight
                        ? 'text-indigo-600 group-hover:text-indigo-700'
                        : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  {!collapsed && <span className="tracking-tight">{item.label}</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.badgeColor === 'live'
                            ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                            : item.badgeColor === 'warning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && !item.badge && (
                      <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.2 rounded bg-white border border-slate-200">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {!collapsed && (
          <div className="mb-3 p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 leading-snug">
            <span className="font-bold text-indigo-700 flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" />
              Stage Operator Mode
            </span>
            <span>Real-time socket synchronized with auditorium console.</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent hover:border-slate-200 text-xs font-semibold transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-[11px]">Collapse View</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-[#E2E8F0] transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        } min-h-[calc(100vh-4rem)]`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 bg-white border-r border-[#E2E8F0] h-full z-50 flex flex-col shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}