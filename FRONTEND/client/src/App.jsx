import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { getSocket } from './services/socket';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmergencyBanner from './components/EmergencyBanner';
import DelayModal from './components/DelayModal';
import EmergencyModal from './components/EmergencyModal';
import TeleprompterModal from './components/TeleprompterModal';
import StageDisplayModal from './components/StageDisplayModal';

import LiveDashboard from './views/LiveDashboard';
import LiveControlView from './views/LiveControlView';
import AgendaManager from './views/AgendaManager';
import SpeakerManager from './views/SpeakerManager';
import AIScriptGenerator from './views/AIScriptGenerator';
import DelayManager from './views/DelayManager';
import EventSetup from './views/EventSetup';
import SettingsView from './views/SettingsView';
import { DashboardSkeleton } from './components/ui/Skeleton';
import ErrorState from './components/ui/ErrorState';

export default function App() {
  const [currentTab, setCurrentTab] = useState('live');
  const [event, setEvent] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Modals & Stage Views
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayModalProps, setDelayModalProps] = useState({});
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isStageDisplayOpen, setIsStageDisplayOpen] = useState(false);
  const [teleprompterScript, setTeleprompterScript] = useState('');
  const [scriptGeneratorConfig, setScriptGeneratorConfig] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [evData, agData, spData, logData, anData] = await Promise.all([
        api.getEvent(),
        api.getAgenda(),
        api.getSpeakers(),
        api.getLogs(),
        api.getAnnouncements()
      ]);

      setEvent(evData);
      setAgenda(agData);
      setSpeakers(spData);
      setLogs(logData);
      setAnnouncements(anData);
    } catch (err) {
      console.error('Error fetching initial event data:', err);
      setLoadError('Unable to load event schedule and stage telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) setConnected(true);

    socket.on('event_updated', (updatedEvent) => {
      setEvent(updatedEvent);
    });

    socket.on('agenda_updated', () => {
      loadData();
    });

    socket.on('agenda_reordered', (newAgenda) => {
      setAgenda(newAgenda);
    });

    socket.on('activity_status_changed', ({ allItems }) => {
      setAgenda(allItems);
      api.getLogs().then(setLogs);
    });

    socket.on('delay_added', ({ event: updatedEv, agenda: updatedAg }) => {
      setEvent(updatedEv);
      setAgenda(updatedAg);
      api.getLogs().then(setLogs);
    });

    socket.on('speaker_updated', () => {
      api.getSpeakers().then(setSpeakers);
      api.getAgenda().then(setAgenda);
    });

    socket.on('emergency_announcement', (newAnnouncement) => {
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      api.getLogs().then(setLogs);
    });

    socket.on('announcement_dismissed', ({ id }) => {
      setAnnouncements(prev =>
        prev.map(a => a.id === id ? { ...a, is_active: 0 } : a)
      );
    });

    socket.on('system_reset', ({ event: ev, agenda: ag, speakers: sp }) => {
      setEvent(ev);
      setAgenda(ag);
      setSpeakers(sp);
      loadData();
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('event_updated');
      socket.off('agenda_updated');
      socket.off('agenda_reordered');
      socket.off('activity_status_changed');
      socket.off('delay_added');
      socket.off('speaker_updated');
      socket.off('emergency_announcement');
      socket.off('announcement_dismissed');
      socket.off('system_reset');
    };
  }, []);

  // Responsive viewport listener for Tablet / Desktop sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1180) {
        setIsSidebarCollapsed(true);
      } else if (window.innerWidth >= 1180) {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGenerateScriptRoute = (config) => {
    setScriptGeneratorConfig(config);
    setCurrentTab('scripts');
  };

  const handleOpenTeleprompter = (customScript) => {
    if (customScript) {
      setTeleprompterScript(customScript);
    } else {
      const currentLive =
        agenda.find(a => a.status === 'LIVE') || agenda[0];

      setTeleprompterScript(
        `[Stage Cue: Stand center stage, smile warmly, engage the audience]

"Welcome back everyone to ${event?.name || 'TechFest 2026'}!

[Stage Cue: Acknowledge the attendees with an open hand gesture]

We are currently in session with:
**${currentLive?.title || 'Keynote Session'}**${currentLive?.speaker_name
          ? ` by **${currentLive.speaker_name}**`
          : ''
        }.

[Stage Cue: Maintain an inspiring, articulate tone]

${currentLive?.notes ||
        'Please pay close attention to the instructions and technical takeaways.'
        }"`
      );
    }

    setIsTeleprompterOpen(true);
  };

  const handleUpdateActivityStatus = async (id, status) => {
    try {
      await api.updateActivityStatus(id, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissAnnouncement = async (id) => {
    try {
      await api.dismissAnnouncement(id);

      setAnnouncements(prev =>
        prev.map(a =>
          a.id === id ? { ...a, is_active: 0 } : a
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const activeAnnouncement = announcements.find(
    a => a.is_active === 1
  );

  const completedCount = agenda.filter(
    a => a.status === 'COMPLETED'
  ).length;

  const liveCount = agenda.filter(
    a => a.status === 'LIVE'
  ).length;

  const upcomingCount = agenda.filter(
    a => a.status === 'UPCOMING' || a.status === 'DELAYED'
  ).length;

  const agendaStats = {
    total: agenda.length,
    completed: completedCount,
    live: liveCount,
    upcoming: upcomingCount,
    delay: event?.current_delay_minutes || 0
  };

  const currentLiveItem = agenda.find(a => a.status === 'LIVE');

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="h-16 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 animate-pulse" />
            <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (loadError && !event) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-md w-full">
          <ErrorState
            title="Unable to load event schedule"
            message={loadError}
            onRetry={loadData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9EFF6] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        event={event}
        connected={connected}
        activeAnnouncementsCount={activeAnnouncement ? 1 : 0}
        onOpenDelay={() => {
          setDelayModalProps({});
          setIsDelayModalOpen(true);
        }}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenTeleprompter={() => handleOpenTeleprompter()}
        onOpenStageDisplay={() => setIsStageDisplayOpen(true)}
        onToggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
        currentLiveItem={currentLiveItem}
      />

      {/* Active Broadcast Announcement Banner */}
      {activeAnnouncement && (
        <EmergencyBanner
          announcement={activeAnnouncement}
          onDismiss={handleDismissAnnouncement}
          onOpenTeleprompter={handleOpenTeleprompter}
        />
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsSidebarMobileOpen(false);
          }}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
          onOpenStageDisplay={() => setIsStageDisplayOpen(true)}
          agendaStats={agendaStats}
        />

        {/* Primary Content View Area */}
        <main className="flex-1 overflow-y-auto bg-[#E9EFF6]">
          {currentTab === 'live' && (
            <LiveControlView
              event={event}
              agenda={agenda}
              speakers={speakers}
              logs={logs}
              announcements={announcements}
              connected={connected}
              isTeleprompterOpen={isTeleprompterOpen}
              isStageDisplayOpen={isStageDisplayOpen}
              onUpdateStatus={handleUpdateActivityStatus}
              onOpenDelay={(props) => {
                setDelayModalProps(props || {});
                setIsDelayModalOpen(true);
              }}
              onOpenEmergency={() => setIsEmergencyModalOpen(true)}
              onGenerateScript={handleGenerateScriptRoute}
              onOpenTeleprompter={handleOpenTeleprompter}
              onOpenStageDisplay={() => setIsStageDisplayOpen(true)}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'dashboard' && (
            <LiveDashboard
              event={event}
              agenda={agenda}
              speakers={speakers}
              logs={logs}
              onUpdateStatus={handleUpdateActivityStatus}
              onOpenDelay={(props) => {
                setDelayModalProps(props || {});
                setIsDelayModalOpen(true);
              }}
              onOpenEmergency={() => setIsEmergencyModalOpen(true)}
              onGenerateScript={handleGenerateScriptRoute}
              onOpenTeleprompter={handleOpenTeleprompter}
            />
          )}

          {currentTab === 'agenda' && (
            <AgendaManager
              agenda={agenda}
              speakers={speakers}
              event={event}
              onRefresh={loadData}
              onOpenDelay={(props) => {
                setDelayModalProps(props || {});
                setIsDelayModalOpen(true);
              }}
              onGenerateScript={handleGenerateScriptRoute}
              onOpenTeleprompter={handleOpenTeleprompter}
            />
          )}

          {currentTab === 'speakers' && (
            <SpeakerManager
              speakers={speakers}
              agenda={agenda}
              event={event}
              onRefresh={loadData}
              onGenerateScript={handleGenerateScriptRoute}
              onOpenTeleprompter={handleOpenTeleprompter}
            />
          )}

          {currentTab === 'scripts' && (
            <AIScriptGenerator
              event={event}
              speakers={speakers}
              agenda={agenda}
              initialConfig={scriptGeneratorConfig}
              onOpenTeleprompter={handleOpenTeleprompter}
            />
          )}

          {currentTab === 'delay' && (
            <DelayManager
              event={event}
              agenda={agenda}
              logs={logs}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'setup' && (
            <EventSetup
              event={event}
              agenda={agenda}
              speakers={speakers}
              onRefresh={loadData}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              event={event}
              onRefresh={loadData}
            />
          )}
        </main>
      </div>

      {/* Quick Delay Injection Modal */}
      <DelayModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        agenda={agenda}
        onAddDelay={api.addDelay}
        {...delayModalProps}
      />

      {/* Emergency Announcement Broadcast Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onBroadcastSuccess={(newAnnouncement) => {
          setAnnouncements(prev => [newAnnouncement, ...prev]);
          loadData();
        }}
        onOpenTeleprompter={handleOpenTeleprompter}
        onOpenStageDisplay={() => setIsStageDisplayOpen(true)}
      />

      {/* Stage Teleprompter Reader Modal */}
      <TeleprompterModal
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        script={teleprompterScript}
        title={`${event?.name || 'TechFest 2026'} • Stage Teleprompter`}
      />

      {/* Stage Display Confidence Monitor HUD */}
      <StageDisplayModal
        isOpen={isStageDisplayOpen}
        onClose={() => setIsStageDisplayOpen(false)}
        event={event}
        agenda={agenda}
        activeAnnouncement={activeAnnouncement}
      />
    </div>
  );
}