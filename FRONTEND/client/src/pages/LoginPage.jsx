import React, { useState } from 'react';
import SasmLogo from '../components/SasmLogo';
import OtpVerification from '../components/auth/OtpVerification';
import { sendLoginOtp } from '../services/authService';
import { ArrowRight, Lock, Mail, User, Shield, RefreshCw } from 'lucide-react';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(null); // null | 'user' | 'manager'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Login Steps: 'CREDENTIALS' | 'OTP_VERIFICATION'
  const [step, setStep] = useState('CREDENTIALS');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setName('');
    setErrorMessage('');
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!email || !email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Dispatch real SMTP login OTP from backend
      await sendLoginOtp(email.trim(), selectedRole);
      // Advance to OTP Verification Step
      setStep('OTP_VERIFICATION');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send login verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpVerified = (verifiedData) => {
    const userSession = {
      id: 'usr-' + Date.now(),
      name: name.trim() || (selectedRole === 'manager' ? 'Event Manager' : 'Alex Johnson'),
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

    // Role-based redirection rule
    if (selectedRole === 'manager') {
      onNavigate('/manager');
    } else {
      onNavigate('/user');
    }
  };

  // Render OTP Verification Step for Login
  if (step === 'OTP_VERIFICATION') {
    return (
      <OtpVerification
        signupData={{
          name: name.trim() || (selectedRole === 'manager' ? 'Event Manager' : 'User'),
          email: email.trim(),
          role: selectedRole
        }}
        onVerified={handleLoginOtpVerified}
        onChangeEmail={() => setStep('CREDENTIALS')}
        onCancel={() => setStep('CREDENTIALS')}
      />
    );
  }

  // Render Step 1: Login Role & Credentials Form
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
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-mono text-xs">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Who Are You Role Selection */}
        {!selectedRole ? (
          <div className="space-y-5 pt-2">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                AUTHENTICATION PORTAL
              </span>
              <h2 className="text-lg font-bold text-slate-900">Who are you?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
              
              {/* Option A: User */}
              <button
                type="button"
                onClick={() => handleSelectRole('user')}
                className="group p-6 rounded-2xl bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-200 text-left transition-all duration-200 space-y-3 shadow-xs flex flex-col justify-between"
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

              {/* Option B: Manager */}
              <button
                type="button"
                onClick={() => handleSelectRole('manager')}
                className="group p-6 rounded-2xl bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-200 text-left transition-all duration-200 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 flex items-center justify-center font-mono font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-white">Manager</h3>
                    <p className="text-xs text-slate-500 group-hover:text-slate-300 font-mono mt-1">
                      Conduct and manage events
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono font-bold text-slate-900 group-hover:text-white flex items-center gap-1">
                  <span>Sign In as Manager</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        ) : (
          /* Step 2: Login Credentials Form */
          <div className="space-y-6 pt-2 font-mono text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {selectedRole === 'manager' ? (
                  <Shield className="w-4 h-4 text-slate-900" />
                ) : (
                  <User className="w-4 h-4 text-slate-900" />
                )}
                <span className="font-bold text-slate-900 text-sm uppercase">
                  {selectedRole === 'manager' ? 'Manager Login' : 'User Login'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-[11px] text-slate-400 hover:text-slate-800 font-bold underline"
              >
                Switch Role
              </button>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'manager' ? 'e.g. Gujarat TechFest Director' : 'e.g. Alex Johnson'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'manager' ? 'manager@sasm.org' : 'alex.johnson@student.edu'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Password <span className="text-red-500">*</span></label>
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
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Login Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
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
