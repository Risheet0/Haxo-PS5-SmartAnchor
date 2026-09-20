import React, { useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Check,
  X,
  Tv
} from 'lucide-react';

export default function EmergencyBanner({
  announcement,
  onDismiss,
  onOpenTeleprompter
}) {
  const [copied, setCopied] = useState(false);

  if (!announcement || announcement.is_active === 0) return null;

  const content = announcement.ai_script || announcement.original_prompt || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadInTeleprompter = () => {
    if (!onOpenTeleprompter) return;
    const anchorCopy = `[Stage Cue: Step forward calmly, maintain reassuring voice tone and posture]

"Ladies and gentlemen, your attention please:

${content}

[Stage Cue: Pause for 3 seconds, nod respectfully]

We appreciate your patience and cooperation as we resume our scheduled program shortly."`;
    onOpenTeleprompter(anchorCopy);
  };

  return (
    <div className="mx-4 sm:mx-8 mb-4 p-4 rounded-3xl bg-red-50/90 border border-red-200/80 shadow-md shadow-red-500/5 animate-fade-in relative select-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Emergency Icon & Text */}
        <div className="flex items-start gap-3.5 max-w-4xl">
          <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm">
                EMERGENCY STAGE BROADCAST
              </span>
              <span className="text-[11px] text-red-700/70 font-mono">
                {announcement.created_at
                  ? new Date(announcement.created_at).toLocaleTimeString()
                  : 'Active'}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-900 leading-snug">
              "{content}"
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
          {onOpenTeleprompter && (
            <button
              onClick={handleReadInTeleprompter}
              className="btn-pill-secondary text-xs px-3.5 py-1.5"
              title="Read in Anchor Teleprompter"
            >
              <Tv className="w-3.5 h-3.5 text-indigo-600" />
              <span>Teleprompter</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="btn-pill-secondary text-xs px-3.5 py-1.5"
            title="Copy announcement text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => onDismiss(announcement.id)}
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
