import React from 'react';
import SasmNavbar from '../components/SasmNavbar';
import SasmFooter from '../components/SasmFooter';

export default function PublicLayout({
  children,
  currentPath = '/',
  selectedCity = 'Ahmedabad',
  onSelectCity,
  onNavigate,
  currentUser,
  onLogout
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Navigation Bar */}
      <SasmNavbar
        currentPath={currentPath}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Main Page View Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <SasmFooter onNavigate={onNavigate} />
    </div>
  );
}
