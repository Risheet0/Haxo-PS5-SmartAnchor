import React, { useState } from 'react';
import SasmLogo from '../components/SasmLogo';
import { ArrowRight, Lock, Mail, User, Shield } from 'lucide-react';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(null); // null | 'user' | 'manager'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setName('');
    setErrorMessage('');
  };

  const handleDirectLogin = (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!email || !email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage('');

    // Create Authenticated User Session
    const userSession = {
      id: 'usr-' + Date.now(),
      name: name.trim() || (selectedRole === 'manager' ? 'Event Host' : 'Alex Johnson'),
      email: email.trim(),
      role: selectedRole, // 'user' or 'manager'
      locationPreference: 'Ahmedabad',
      email_verified: true,
      logged_in_at: new Date().toISOString()
    };

    localStorage.setItem('sasm_user', JSON.stringify(userSession));
    if (onLoginSuccess) {
      onLoginSuccess(userSession);
    }

    // Role-based navigation rule
    if (selectedRole === 'manager') {
      onNavigate('/manager');
    } else {
      onNavigate('/user');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 font-sans select-none animate-fade-in">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        
        {/* Brand Header */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <SasmLogo size="md" onClick={() => onNavigate('/')} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight pt-1">
            Sign In to SASM
          </h1>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Role Selection Cards */}
        {!selectedRole ? (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Option A: User */}
              <button
                type="button"
                onClick={() => handleSelectRole('user')}
                className="group p-5 rounded-2xl bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-200 text-left transition-all duration-200 space-y-4 shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 flex items-center justify-center font-bold transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-base font-bold text-slate-950 group-hover:text-white">User</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option B: Host */}
              <button
                type="button"
                onClick={() => handleSelectRole('manager')}
                className="group p-5 rounded-2xl bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-200 text-left transition-all duration-200 space-y-4 shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 flex items-center justify-center font-bold transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-base font-bold text-slate-950 group-hover:text-white">Host</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        ) : (
          /* Step 2: Direct Login Form for Selected Role */
          <div className="space-y-4 pt-1 text-xs">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {selectedRole === 'manager' ? (
                  <Shield className="w-4 h-4 text-slate-900" />
                ) : (
                  <User className="w-4 h-4 text-slate-900" />
                )}
                <span className="font-bold text-slate-900 text-sm">
                  {selectedRole === 'manager' ? 'Host Login' : 'User Login'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs text-slate-400 hover:text-slate-800 font-semibold underline cursor-pointer"
              >
                Switch Role
              </button>
            </div>

            <form onSubmit={handleDirectLogin} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'manager' ? 'e.g. Gujarat TechFest Director' : 'e.g. Alex Johnson'}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'manager' ? 'host@sasm.org' : 'alex.johnson@student.edu'}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-5"
              >
                <span>{selectedRole === 'manager' ? 'Open Host Console' : 'Open User Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 font-mono">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('/signup')} className="font-bold text-slate-950 hover:underline">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
