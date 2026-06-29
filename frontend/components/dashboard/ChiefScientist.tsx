"use client";

import { motion } from 'framer-motion';
import { ChiefBrief } from '@/lib/types';

interface ChiefScientistProps {
  status: 'pending' | 'processing' | 'complete' | 'failed';
  brief: ChiefBrief | null;
  elapsedSeconds: number;
}

export default function ChiefScientist({ status, brief, elapsedSeconds }: ChiefScientistProps) {
  // Compute display states
  let statusText = "INITIATING PIPELINE...";
  let progressPct = 10;
  
  if (status === 'processing') {
    if (!brief) {
      statusText = "COORDINATING INPUTS & EXTRACTING HYPOTHESIS...";
      progressPct = 25;
    } else {
      statusText = "SPECIALIST AGENTS EXECUTING IN PARALLEL...";
      progressPct = 60;
    }
  } else if (status === 'complete') {
    statusText = "SYNTHESIS AND R&D PACKAGE READY";
    progressPct = 100;
  } else if (status === 'failed') {
    statusText = "ANALYSIS ERROR";
    progressPct = 100;
  }

  return (
    <div className="rounded-xl glass border-purple-500/20 p-6 glow-effect relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none -z-10" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-950/60 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce duration-[3000ms]">🧑🔬</span>
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              Chief Scientist Node
              {status === 'processing' && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Orchestrator & Synthesizer</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className={`px-2.5 py-1 rounded border ${
            status === 'complete' 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
              : status === 'failed'
              ? 'bg-red-950/40 text-red-400 border-red-500/20'
              : 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20'
          }`}>
            ● {statusText}
          </span>
          <span className="text-slate-400">Elapsed: {elapsedSeconds}s</span>
        </div>
      </div>

      {brief ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Core Hypothesis</h4>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-sm font-semibold text-white mt-1 leading-relaxed font-sans"
              >
                {brief.hypothesis}
              </motion.p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Primary Domain</h4>
              <p className="text-sm font-semibold text-indigo-400 mt-1 font-display">{brief.domain}</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-[#080B14]/60 border border-indigo-950/40">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">Dispatch Brief</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{brief.brief}</p>
          </div>
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 mt-4 font-mono">Chief Scientist is parsing proposal data and generating brief...</p>
        </div>
      )}

      {/* Orchestrator Progress bar */}
      <div className="w-full bg-[#080B14] h-1 rounded-full overflow-hidden mt-6">
        <motion.div 
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
