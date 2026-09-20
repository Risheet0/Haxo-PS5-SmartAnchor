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
  Mic2
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
    <div className="flex flex-col h-full justify-between select-none p-4">
      {/* Top Header / Progress Widget */}
      <div className="space-y-4">
        {/* Mobile close button */}
        <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Mic2 className="w-4 h-4 text-indigo-600" />
            <span>Navigation</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event Flow Progress Meter (Expanded only) */}
        {!collapsed && (
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5 text-xs">
                <Mic2 className="w-3.5 h-3.5 text-indigo-600" />
                Stage Progress
              </span>
              <span className="text-slate-900 font-mono font-bold text-xs">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-1.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                <span className="text-slate-400 block text-[9px] font-semibold">DONE</span>
                <span className="font-bold text-slate-800 text-xs">{agendaStats.completed}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-red-50 border border-red-100">
                <span className="text-red-500 block text-[9px] font-bold">LIVE</span>
                <span className="font-bold text-red-600 text-xs">{agendaStats.live}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                <span className="text-slate-400 block text-[9px] font-semibold">NEXT</span>
                <span className="font-bold text-slate-700 text-xs">{agendaStats.upcoming}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1.5">
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
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group relative ${isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-950/15'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                title={collapsed ? `${item.label} - ${item.desc}` : undefined}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition ${isActive
                      ? 'text-white'
                      : item.highlight
                        ? 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between text-left truncate">
                    <span className="truncate">{item.label}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor === 'live'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Count */}
                    {item.count !== undefined && !item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                          }`}
                      >
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

      {/* Bottom Collapse Toggle (Desktop only) */}
      <div className="hidden lg:block pt-3 border-t border-slate-100">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border border-slate-200/80 rounded-3xl ml-4 mb-4 shadow-sm transition-all duration-300 ease-in-out z-30 ${collapsed ? 'w-20' : 'w-64'
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-out shadow-2xl lg:hidden ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}