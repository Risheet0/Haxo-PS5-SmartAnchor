import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function OtpTimer({
  initialSeconds = 50,
  onResend,
  isResending = false
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResendClick = async () => {
    if (secondsLeft > 0 || isResending) return;
    if (onResend) {
      await onResend();
      // Reset countdown upon resend
      setSecondsLeft(initialSeconds);
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    const formattedSecs = secs < 10 ? `0${secs}` : secs;
    return `${formattedMins}:${formattedSecs}`;
  };

  return (
    <div className="text-center font-mono text-xs select-none pt-2">
      {secondsLeft > 0 ? (
        <span className="text-slate-500 font-semibold">
          Resend code in <strong className="text-slate-900 font-bold">{formatTime(secondsLeft)}</strong>
        </span>
      ) : (
        <div className="space-y-1">
          <span className="text-slate-500 block">Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResendClick}
            disabled={isResending}
            className="font-bold text-slate-950 hover:underline uppercase tracking-wider disabled:opacity-50 inline-flex items-center gap-1.5 transition active:scale-95"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-700" />
                <span>Resending Code...</span>
              </>
            ) : (
              <span>Resend OTP</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
