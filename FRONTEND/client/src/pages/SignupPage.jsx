import React, { useState } from 'react';
import SasmLogo from '../components/SasmLogo';
import { ArrowRight, Lock, Mail, User, Building } from 'lucide-react';

export default function SignupPage({ onNavigate }) {
  const [role, setRole] = useState('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'MANAGER') {
      onNavigate('/manager');
    } else {
      onNavigate('/user');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-3 text-center">
          <SasmLogo size="lg" onClick={() => onNavigate('/')} />
          <h1 className="text-xl font-bold text-slate-950 uppercase tracking-tight pt-2">
            Create SASM Account
          </h1>
          <p className="text-xs text-slate-500">
            Join the TechFest platform for Ahmedabad students and event conductors.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`py-2 rounded-lg transition ${
              role === 'USER' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student / User
          </button>
          <button
            type="button"
            onClick={() => setRole('MANAGER')}
            className={`py-2 rounded-lg transition ${
              role === 'MANAGER' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Event Manager
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-700 font-bold uppercase mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase mb-1">College / Organization</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="GTU / Nirma / Adani / GDG Ahmedabad"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-95 shadow-sm flex items-center justify-center gap-2"
          >
            <span>{role === 'MANAGER' ? 'Access Manager Console' : 'Create Student Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-mono">
          Already registered?{' '}
          <button onClick={() => onNavigate('/login')} className="font-bold text-slate-950 hover:underline">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
