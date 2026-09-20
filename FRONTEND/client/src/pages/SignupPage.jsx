import React, { useState } from 'react';
import SasmLogo from '../components/SasmLogo';
import OtpVerification from '../components/auth/OtpVerification';
import { validateSignupData, sendOtp, completeSignup } from '../services/authService';
import { ArrowRight, Lock, Mail, User, Shield, Check, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function SignupPage({ onNavigate }) {
  // Navigation & Flow Steps: 'STEP_FORM' | 'STEP_OTP'
  const [currentStep, setCurrentStep] = useState('STEP_FORM');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' // 'user' | 'manager'
  });

  // UI State
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    if (formErrors.role) {
      setFormErrors((prev) => ({ ...prev, role: '' }));
    }
  };

  // Step 1: Submit Signup Form & Request OTP
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const { isValid, errors } = validateSignupData(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    setIsSubmittingForm(true);
    try {
      // Trigger send OTP action
      await sendOtp(formData.email);
      // Advance to OTP Verification Step
      setCurrentStep('STEP_OTP');
    } catch (err) {
      setFormErrors({ form: 'Failed to send verification code. Please try again.' });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Step 3: Handle Verified OTP & Complete Account Creation
  const handleOtpVerified = async (verifiedData) => {
    try {
      const result = await completeSignup(verifiedData);
      if (result.success && result.user) {
        localStorage.setItem('sasm_user', JSON.stringify(result.user));
        // Redirect to appropriate authenticated section based on role
        if (result.user.role === 'manager') {
          onNavigate('/manager');
        } else {
          onNavigate('/user');
        }
      }
    } catch (err) {
      console.error('Failed to complete signup:', err);
    }
  };

  // Render OTP Verification Step
  if (currentStep === 'STEP_OTP') {
    return (
      <OtpVerification
        signupData={formData}
        onVerified={handleOtpVerified}
        onChangeEmail={() => setCurrentStep('STEP_FORM')}
        onCancel={() => setCurrentStep('STEP_FORM')}
      />
    );
  }

  // Render Step 1: Sign Up Form
  return (
    <div className="max-w-md mx-auto px-4 py-12 font-sans select-none animate-fade-in">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        
        {/* Header & Logo */}
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <SasmLogo size="md" onClick={() => onNavigate('/')} />
          </div>

          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 inline-block">
            STEP 1 OF 3 • ACCOUNT DETAILS
          </span>

          <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight pt-1">
            Create SASM Account
          </h1>
          
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            Join the universal event platform for attendees and event managers.
          </p>
        </div>

        {/* Global Error Banner */}
        {formErrors.form && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-mono text-xs">
            {formErrors.form}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
          
          {/* Account Type / Role Selection */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              Account Type <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* User Role Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('user')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  formData.role === 'user'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full pb-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs">
                    <User className="w-4 h-4" />
                    <span>User</span>
                  </div>
                  {formData.role === 'user' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className={`text-[10px] font-sans leading-tight ${formData.role === 'user' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Discover and join events.
                </p>
              </button>

              {/* Manager Role Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('manager')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  formData.role === 'manager'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full pb-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs">
                    <Shield className="w-4 h-4" />
                    <span>Manager</span>
                  </div>
                  {formData.role === 'manager' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className={`text-[10px] font-sans leading-tight ${formData.role === 'manager' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Conduct and manage events.
                </p>
              </button>
            </div>
            {formErrors.role && <p className="text-[11px] text-red-600 font-semibold">{formErrors.role}</p>}
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Aarav Sharma"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border text-slate-900 focus:outline-none focus:ring-2 font-sans text-xs sm:text-sm ${
                  formErrors.name
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-slate-300'
                }`}
              />
            </div>
            {formErrors.name && <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.name}</p>}
          </div>

          {/* Email Address Field */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@domain.com"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border text-slate-900 focus:outline-none focus:ring-2 font-sans text-xs sm:text-sm ${
                  formErrors.email
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-slate-300'
                }`}
              />
            </div>
            {formErrors.email && <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 6 characters"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border text-slate-900 focus:outline-none focus:ring-2 font-sans text-xs sm:text-sm ${
                  formErrors.password
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.password && <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border text-slate-900 focus:outline-none focus:ring-2 font-sans text-xs sm:text-sm ${
                  formErrors.confirmPassword
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmittingForm}
            className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-sm flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {isSubmittingForm ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
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
