import React, { useState } from 'react';
import SasmLogo from '../components/SasmLogo';
import { ArrowRight, Lock, Mail, User, Shield, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(null); // null | 'user' | 'manager'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!email || !email.trim()) {
      setErrorMessage('Please enter your registered email address or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.login({
        email: email.trim(),
        password,
        role: selectedRole
      });

      if (res && res.success && res.user) {
        const userSession = res.user;
        localStorage.setItem('sasm_user', JSON.stringify(userSession));
        if (onLoginSuccess) {
          onLoginSuccess(userSession);
        }

        if (userSession.role === 'speaker') {
          const targetEvId = userSession.event_id || userSession.eventId || 1;
          onNavigate(`/events/${targetEvId}/speaker`);
        } else if (userSession.role === 'manager') {
          onNavigate('/manager');
        } else {
          onNavigate('/user');
        }
      } else {
        setErrorMessage(res?.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.trim()) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 font-sans select-none animate-fade-in">
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-8">
        
        {/* Brand Header */}
        <div className="space-y-3 text-center">
          <SasmLogo size="lg" onClick={() => onNavigate('/')} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight pt-2">
            Welcome to SASM
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Universal event discovery &amp; management platform portal.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Combined Role Selection Portal (2 Cards: User vs Manager / Speaker) */}
        {!selectedRole ? (
          <div className="space-y-5 pt-2">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                AUTHENTICATION PORTAL
              </span>
              <h2 className="text-lg font-bold text-slate-900">Select Portal Role</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
              
              {/* Option A: User */}
              <button
                type="button"
                onClick={() => handleSelectRole('user')}
                className="group p-6 rounded-2xl bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-200 text-left transition-all duration-200 space-y-3 shadow-xs flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 flex items-center justify-center font-mono font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-white">User</h3>
                    <p className="text-xs text-slate-500 group-hover:text-slate-300 font-mono mt-1">
                      Discover and join events
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono font-bold text-slate-900 group-hover:text-white flex items-center gap-1">
                  <span>Sign In as User</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option B: Combined Manager / Speaker */}
              <button
                type="button"
                onClick={() => handleSelectRole('manager')}
                className="group p-6 rounded-2xl bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-200 text-left transition-all duration-200 space-y-3 shadow-xs flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 flex items-center justify-center font-mono font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-white">Manager / Speaker</h3>
                    <p className="text-xs text-slate-500 group-hover:text-slate-300 font-mono mt-1">
                      Manage events or access Speaker Console
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono font-bold text-slate-900 group-hover:text-white flex items-center gap-1">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        ) : (
          /* Step 2: Strict Login-Only Form for Selected Role */
          <div className="space-y-6 pt-2 font-mono text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {selectedRole === 'manager' ? (
                  <Shield className="w-4 h-4 text-slate-900" />
                ) : (
                  <User className="w-4 h-4 text-slate-900" />
                )}
                <span className="font-bold text-slate-900 text-sm uppercase">
                  {selectedRole === 'manager' ? 'Manager / Speaker Sign In' : 'User Sign In'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-[11px] text-slate-400 hover:text-slate-800 font-bold underline cursor-pointer"
              >
                Switch Role
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">
                  Email / Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'manager'
                        ? 'manager@sasm.org or speaker@example.com'
                        : 'user@example.com'
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold uppercase">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSubmitted(false);
                      setShowForgotPasswordModal(true);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                <span>
                  {loading
                    ? 'Authenticating...'
                    : selectedRole === 'manager'
                    ? 'Sign In'
                    : 'Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Footer info & Signup Link */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-mono">
          {selectedRole === 'manager' ? (
            <p className="text-slate-400 text-[11px]">
              🔒 Manager and Speaker accounts are provisioned by Event Hosts. Contact your Event Host for login credentials.
            </p>
          ) : (
            <div>
              Don't have an account?{' '}
              <button onClick={() => onNavigate('/signup')} className="font-bold text-slate-950 hover:underline cursor-pointer">
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Forgot Password</h3>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {!forgotSubmitted ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs font-mono">
                <p className="text-slate-600 font-sans text-xs">
                  Enter your registered email address to receive password reset instructions or your temporary login key.
                </p>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. speaker@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Password Instructions Sent!</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  If an account exists for <span className="font-bold text-slate-900">{forgotEmail}</span>, password reset details and temporary access codes have been dispatched to your inbox.
                </p>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-950 text-white font-mono font-bold text-xs uppercase"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
