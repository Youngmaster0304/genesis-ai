"use client";

import { motion } from 'framer-motion';
import { AgentProgress } from '@/lib/types';

interface AgentCardProps {
  name: string;
  emoji: string;
  role: string;
  data: AgentProgress;
}

export default function AgentCard({ name, emoji, role, data }: AgentCardProps) {
  const isRunning = data.status === 'RUNNING';
  const isComplete = data.status === 'COMPLETE';
  const isFailed = data.status === 'FAILED';
  const isWaiting = data.status === 'WAITING';

  return (
    <div 
      className={`rounded-xl bg-[#0F1421] border p-5 transition-all duration-300 relative ${
        isRunning 
          ? 'border-indigo-500 neural-active shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
          : isComplete
          ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
          : isFailed
          ? 'border-red-500/40'
          : 'border-indigo-950/40 opacity-50'
      }`}
    >
      <div className="flex items-center justify-between border-b border-indigo-950/40 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{emoji}</span>
          <div>
            <h3 className="text-xs font-bold text-white font-display">{name}</h3>
            <p className="text-[10px] text-slate-500 font-mono">{role}</p>
          </div>
        </div>

        {/* State Indicators */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
          {isRunning && (
            <span className="text-indigo-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              RUNNING
            </span>
          )}
          {isComplete && (
            <span className="text-emerald-400 flex items-center gap-1">
              ✓ COMPLETE
            </span>
          )}
          {isFailed && (
            <span className="text-red-400">
              ✕ FAILED
            </span>
          )}
          {isWaiting && (
            <span className="text-slate-500">
              ● WAITING
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 min-h-[50px] flex flex-col justify-between">
        <p className={`text-xs ${isFailed ? 'text-red-400' : 'text-slate-300'} font-sans leading-relaxed`}>
          {data.status_text}
        </p>

        {/* Progress bar for running */}
        {(isRunning || isComplete) && (
          <div className="w-full bg-[#080B14] h-1 rounded-full overflow-hidden mt-2">
            <motion.div 
              className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${data.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Metadata section (Execution speed, tokens/sec) */}
        {isComplete && data.metrics.tokens_per_sec && (
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-2 bg-[#080B14]/40 p-1.5 rounded border border-indigo-950/20">
            <span>Time: {data.elapsed.toFixed(2)}s</span>
            <span className="text-indigo-400 font-semibold">{data.metrics.tokens_per_sec} t/s</span>
            <span className="text-slate-600 font-semibold">{data.metrics.model_used}</span>
          </div>
        )}
      </div>
    </div>
  );
}
