import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-12" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="flex-1 h-9" />
        <Skeleton className="flex-1 h-9" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-3.5">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="w-28 h-3.5" />
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-36 h-3" />
          </div>
          <Skeleton className="w-20 h-7" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner / Event Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-72 h-8" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-28 h-9" />
          <Skeleton className="w-28 h-9" />
        </div>
      </div>

      {/* Grid of live cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
