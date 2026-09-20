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

// SASM Universal Event Platform Integration
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import OverviewPage from './pages/OverviewPage';
import WhatIsSasmPage from './pages/WhatIsSasmPage';
import LearnPage from './pages/LearnPage';
import HowItWorksPage from './pages/HowItWorksPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserPortalPage from './pages/UserPortalPage';

export default function App() {
  // Path Router State (supports /home, /overview, /what-is-sasm, /learn, /how-it-works, /login, /signup, /events, /events/:id, /user, /manager)
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  // User Selectable Priority Location State (Default: Ahmedabad)
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');

  // Access Denial / Security Notice Message Banner State
  const [securityNotice, setSecurityNotice] = useState(null);

  // Authenticated User Session State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sasm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Handle URL history state change with automatic access control validation
  const handleNavigate = (path) => {
    setSecurityNotice(null);
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLoginSuccess = (userSession) => {
    setCurrentUser(userSession);
    setSecurityNotice(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('sasm_user');
    setCurrentUser(null);
    setSecurityNotice(null);
    handleNavigate('/');
  };

  useEffect(() => {
    const handlePopState = () => {
      setSecurityNotice(null);
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Existing Manager Dashboard Shell State
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

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('event_updated');
      socket.off('agenda_updated');
      socket.off('agenda_reordered');
      socket.off('activity_status_changed');
    };
  }, []);

  const handleUpdateActivityStatus = async (id, status) => {
    try {
      const res = await api.updateActivityStatus(id, status);
      setAgenda(res.allItems);
      const updatedLogs = await api.getLogs();
      setLogs(updatedLogs);
    } catch (err) {
      console.error('Failed to update session status:', err);
      throw err;
    }
  };

  const handleOpenTeleprompter = (script) => {
    setTeleprompterScript(script);
    setIsTeleprompterOpen(true);
  };

  const handleGenerateScriptRoute = (config) => {
    setScriptGeneratorConfig(config);
    setCurrentTab('scripts');
  };

  const activeAnnouncement = announcements.find((a) => a.is_active === 1);

  const agendaStats = {
    total: agenda.length,
    completed: agenda.filter((a) => a.status === 'COMPLETED').length,
    live: agenda.filter((a) => a.status === 'LIVE').length,
    upcoming: agenda.filter((a) => a.status === 'UPCOMING').length
  };

  // ─────────────────────────────────────────────────────────────
  // STRICT ROLE-BASED ROUTE GUARD FOR MANAGER DASHBOARD (/manager*)
  // ─────────────────────────────────────────────────────────────
  if (currentPath === '/manager' || currentPath.startsWith('/manager')) {
    // 1. Unauthenticated Visitor trying to open /manager -> Redirect to Manager Login
    if (!currentUser) {
      return (
        <PublicLayout
          currentPath={currentPath}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        >
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        </PublicLayout>
      );
    }

    // 2. Normal User trying to open /manager -> BLOCK ACCESS + Redirect to /user
    if (currentUser.role === 'user') {
      return (
        <PublicLayout
          currentPath="/user"
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        >
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-bold flex items-center justify-between">
              <span>⚠️ Access Blocked: Manager access required. You have been redirected to your User Dashboard.</span>
              <button onClick={() => setSecurityNotice(null)} className="text-amber-700 hover:underline">Dismiss</button>
            </div>
          </div>
          <UserPortalPage
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </PublicLayout>
      );
    }

    // 3. Manager User -> Render Complete Existing Manager Dashboard Console
    if (loading) return <DashboardSkeleton />;

    if (loadError && !event) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <ErrorState message={loadError} onRetry={loadData} />
        </div>
      );
    }

    return (
      <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden select-none font-sans">
        {/* Manager Exit Header Bar */}
        <div className="bg-slate-950 text-white px-4 py-1.5 flex items-center justify-between text-xs font-mono border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">SASM MANAGER CONSOLE</span>
            <span className="text-slate-400">• {event?.name || 'TECHFEST 2026'} ({currentUser.name})</span>
          </div>

          <button
            onClick={handleLogout}
            className="hover:text-indigo-400 font-bold transition flex items-center gap-1"
          >
            Logout &rarr;
          </button>
        </div>

        {/* Global Manager Header Bar */}
        <Navbar
          event={event}
          connected={connected}
          activeTab={currentTab}
          onSelectTab={setCurrentTab}
          onToggleMobileSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
        />

        {/* Active Emergency Broadcast Banner */}
        {activeAnnouncement && (
          <EmergencyBanner
            announcement={activeAnnouncement}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
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
          <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
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

  // ─────────────────────────────────────────────────────────────
  // PUBLIC SASM PLATFORM PAGES & USER ROUTES (/user*)
  // ─────────────────────────────────────────────────────────────
  const renderPublicPage = () => {
    if (currentPath === '/overview') {
      return <OverviewPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/what-is-sasm') {
      return <WhatIsSasmPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/learn') {
      return <LearnPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/how-it-works') {
      return <HowItWorksPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/events') {
      return (
        <EventsPage
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onNavigate={handleNavigate}
        />
      );
    }
    if (currentPath.startsWith('/events/')) {
      const eventId = currentPath.replace('/events/', '');
      return <EventDetailPage eventId={eventId} onNavigate={handleNavigate} />;
    }
    if (currentPath === '/login') {
      return (
        <LoginPage
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }
    if (currentPath === '/signup') {
      return <SignupPage onNavigate={handleNavigate} />;
    }

    // ─────────────────────────────────────────────────────────
    // USER ROUTES GUARD (/user, /user/*)
    // ─────────────────────────────────────────────────────────
    if (currentPath === '/user' || currentPath.startsWith('/user')) {
      // 1. Unauthenticated Visitor trying to open /user -> Render Login
      if (!currentUser) {
        return (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      }

      // 2. Manager trying to open /user -> Redirect to /manager
      if (currentUser.role === 'manager') {
        window.history.replaceState({}, '', '/manager');
        setCurrentPath('/manager');
        return null;
      }

      // 3. User -> Render User Dashboard
      return (
        <UserPortalPage
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      );
    }

    // Default Universal Home Page
    return (
      <HomePage
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onNavigate={handleNavigate}
        currentUser={currentUser}
      />
    );
  };

  return (
    <PublicLayout
      currentPath={currentPath}
      selectedCity={selectedCity}
      onSelectCity={setSelectedCity}
      onNavigate={handleNavigate}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderPublicPage()}
    </PublicLayout>
  );
}