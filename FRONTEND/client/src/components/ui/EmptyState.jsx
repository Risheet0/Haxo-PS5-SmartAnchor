import React from 'react';
import { Plus, FolderOpen } from 'lucide-react';

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
      className={`p-8 sm:p-12 soft-card text-center flex flex-col items-center justify-center space-y-4 select-none ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-pill-primary mt-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
