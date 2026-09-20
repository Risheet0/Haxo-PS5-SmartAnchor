import React, { useState } from 'react';
import SasmLogo from '../SasmLogo';
import OtpInput from './OtpInput';
import OtpTimer from './OtpTimer';
import { maskEmail, verifyOtp, resendOtp } from '../../services/authService';
import { ArrowRight, CheckCircle2, Info, RefreshCw, Edit2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function OtpVerification({
  signupData,
  onVerified,
  onChangeEmail,
  onCancel
}) {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendNotification, setResendNotification] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const maskedEmail = maskEmail(signupData?.email || '');

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6 || verifying || isVerified) return;

    setVerifying(true);
    setErrorMessage('');
    setResendNotification('');

    try {
      const result = await verifyOtp(signupData.email, otp);
      if (result.success) {
        setIsVerified(true);
      } else {
        setErrorMessage(result.message || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Verification error. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMessage('');
    try {
      const result = await resendOtp(signupData.email);
      setResendNotification(result.message || 'A new verification code has been sent.');
      setTimeout(() => setResendNotification(''), 5000);
    } catch (err) {
      setErrorMessage('Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const handleCompleteNext = () => {
    if (onVerified) {
      onVerified(signupData);
    }
  };

  // 1. SUCCESS STATE VIEW
  if (isVerified) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 font-sans select-none animate-fade-in">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 text-center">
          
          <div className="flex justify-center">
            <SasmLogo size="md" />
          </div>

          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight pt-1">
              Email Verified
            </h2>
            <p className="text-xs text-slate-600 font-sans max-w-xs mx-auto leading-relaxed">
              Your email address <strong className="text-slate-900 font-mono">{signupData.email}</strong> has been successfully verified.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 text-left space-y-1">
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Account Type:</span>
              <span className="font-bold text-slate-950 uppercase">{signupData.role === 'manager' ? 'HOST' : signupData.role}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Account Holder:</span>
              <span className="font-bold text-slate-950">{signupData.name}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCompleteNext}
            className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-sm flex items-center justify-center gap-2"
          >
            <span>Continue to {signupData.role === 'manager' ? 'Host Console' : 'User Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. OTP VERIFICATION FORM VIEW
  return (
    <div className="max-w-md mx-auto px-4 py-12 font-sans select-none animate-fade-in">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        
        {/* Header & Logo */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <SasmLogo size="md" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Verify Your Email
          </h1>
          
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            Enter the 6-digit verification code sent to your email.
          </p>
        </div>

        {/* Masked Email Badge & Change Email Action */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Target Email</span>
            <span className="font-bold text-slate-900 block truncate max-w-[200px] sm:max-w-[230px]">
              {maskedEmail}
            </span>
          </div>

          <button
            type="button"
            onClick={onChangeEmail}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
            title="Change email address"
          >
            <Edit2 className="w-3 h-3 text-slate-500" />
            <span>Change email</span>
          </button>
        </div>

        {/* Notification & Error Messages */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-mono text-xs flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {resendNotification && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs flex items-center gap-1.5 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{resendNotification}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-center text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Enter 6-Digit Code
            </label>
            <OtpInput
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (errorMessage) setErrorMessage('');
              }}
              disabled={verifying}
              hasError={Boolean(errorMessage)}
              length={6}
            />
          </div>

          <button
            type="submit"
            disabled={otp.length !== 6 || verifying}
            className={`w-full py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-sm flex items-center justify-center gap-2 ${
              otp.length === 6 && !verifying
                ? 'bg-slate-950 hover:bg-slate-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Email...</span>
              </>
            ) : (
              <>
                <span>Verify Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Countdown Timer */}
        <OtpTimer
          initialSeconds={50}
          onResend={handleResend}
          isResending={resending}
        />

        {/* Back Link */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-mono text-slate-500 hover:text-slate-950 underline"
          >
            Back to Signup Form
          </button>
        </div>

      </div>
    </div>
  );
}
