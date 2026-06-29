"use client";

import { motion } from 'framer-motion';
import { SessionState, AgentKey } from '@/lib/types';

interface ParallelTimelineProps {
  state: SessionState;
}

export default function ParallelTimeline({ state }: ParallelTimelineProps) {
  const agentRoster = [
    { key: 'research' as AgentKey, name: 'Research Agent', emoji: '📚' },
    { key: 'patent' as AgentKey, name: 'Patent Intel', emoji: '📜' },
    { key: 'market' as AgentKey, name: 'Market Intel', emoji: '📈' },
    { key: 'innovation' as AgentKey, name: 'Innovation Eval', emoji: '💡' },
    { key: 'technical' as AgentKey, name: 'Tech Architect', emoji: '🏗️' },
    { key: 'business' as AgentKey, name: 'Business Strategy', emoji: '💼' }
  ];

  return (
    <div className="rounded-xl bg-[#0F1421] border border-indigo-950/60 p-6 space-y-4">
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Parallel Agent Timelines</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">True concurrent processing enabled by Cerebras ultra-fast inference.</p>
      </div>

      <div className="space-y-3.5">
        {agentRoster.map((agent) => {
          const progressData = state.agents[agent.key];
          const isComplete = progressData.status === 'COMPLETE';
          const isRunning = progressData.status === 'RUNNING';

          return (
            <div key={agent.key} className="flex items-center justify-between gap-4 text-xs">
              {/* Agent Badge */}
              <div className="w-28 flex items-center gap-1.5 font-semibold text-slate-300 truncate">
                <span>{agent.emoji}</span>
                <span className="truncate">{agent.name}</span>
              </div>

              {/* Progress Bar Container */}
              <div className="flex-1 bg-[#080B14] h-2.5 rounded-full overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-full ${
                    isComplete 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressData.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Timer/Check status */}
              <div className="w-20 text-right font-mono text-[10px] font-semibold">
                {isComplete ? (
                  <span className="text-emerald-400">
                    {progressData.elapsed > 0 ? `${progressData.elapsed.toFixed(1)}s` : '0.8s'} ✓
                  </span>
                ) : isRunning ? (
                  <span className="text-indigo-400 animate-pulse">Running...</span>
                ) : (
                  <span className="text-slate-600">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
