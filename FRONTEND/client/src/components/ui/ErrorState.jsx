import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to load stage telemetry',
  message = 'A network or synchronization error occurred while connecting to the stage hub.',
  onRetry,
  className = ''
}) {
  return (
    <div
      className={`p-6 sm:p-10 rounded-3xl bg-red-50/80 border border-red-200 text-center flex flex-col items-center justify-center space-y-4 select-none shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-red-950 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-red-700/80 leading-relaxed font-normal">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-pill-danger text-xs mt-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
