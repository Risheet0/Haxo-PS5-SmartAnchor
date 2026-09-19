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
      className={`p-6 sm:p-10 rounded-2xl bg-[#240C10] border-2 border-red-500/60 text-center flex flex-col items-center justify-center space-y-3 shadow-panel select-none ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 mb-1">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-red-200/80 leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
