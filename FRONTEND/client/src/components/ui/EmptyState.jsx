import React from 'react';
import { Plus, Sparkles, FolderOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'Get started by creating your first record.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center space-y-3 shadow-sm select-none ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 mb-1">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-mono">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
