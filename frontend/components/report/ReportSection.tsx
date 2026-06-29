"use client";

import { ReactNode } from 'react';

interface ReportSectionProps {
  title: string;
  icon: string;
  children: ReactNode;
}

export default function ReportSection({ title, icon, children }: ReportSectionProps) {
  return (
    <div className="rounded-xl bg-[#0F1421] border border-indigo-950/60 p-6 space-y-4">
      <div className="flex items-center gap-3 border-b border-indigo-950/60 pb-4 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-white font-display">{title}</h3>
      </div>
      <div className="text-slate-300 text-sm leading-relaxed space-y-4 font-sans">
        {children}
      </div>
    </div>
  );
}
