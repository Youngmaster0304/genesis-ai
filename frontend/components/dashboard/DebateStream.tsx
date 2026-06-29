"use client";

import { motion } from 'framer-motion';
import { DebateMessage } from '@/lib/types';

interface DebateStreamProps {
  debate: DebateMessage[];
}

export default function DebateStream({ debate }: DebateStreamProps) {
  const getAgentTheme = (agent: string) => {
    switch (agent.toLowerCase()) {
      case 'chief scientist':
        return { border: 'border-purple-500/30', bg: 'bg-purple-950/20', text: 'text-purple-400', emoji: '🧑🔬' };
      case 'research agent':
        return { border: 'border-indigo-500/30', bg: 'bg-indigo-950/20', text: 'text-indigo-400', emoji: '📚' };
      case 'patent intelligence':
        return { border: 'border-violet-500/30', bg: 'bg-violet-950/20', text: 'text-violet-400', emoji: '📜' };
      case 'market intelligence':
        return { border: 'border-pink-500/30', bg: 'bg-pink-950/20', text: 'text-pink-400', emoji: '📈' };
      case 'innovation evaluator':
        return { border: 'border-emerald-500/30', bg: 'bg-emerald-950/20', text: 'text-emerald-400', emoji: '💡' };
      case 'technical architect':
        return { border: 'border-blue-500/30', bg: 'bg-blue-950/20', text: 'text-blue-400', emoji: '🏗️' };
      case 'business strategist':
        return { border: 'border-amber-500/30', bg: 'bg-amber-950/20', text: 'text-amber-400', emoji: '💼' };
      default:
        return { border: 'border-slate-800', bg: 'bg-slate-900/20', text: 'text-slate-400', emoji: '🤖' };
    }
  };

  return (
    <div className="rounded-xl bg-[#0F1421] border border-indigo-950/60 p-6 space-y-4">
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          🤝 AI Debate Chamber
          {debate.length > 0 && debate.length < 4 && (
            <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
          )}
        </h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Specialists challenge assumptions and build alignment before synthesis.</p>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {debate.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600 font-mono">
            Waiting for specialists to conclude parallel work and enter debate chamber...
          </div>
        ) : (
          debate.map((msg, idx) => {
            const theme = getAgentTheme(msg.agent);
            return (
              <motion.div
                key={msg.agent + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`p-3.5 rounded-lg border ${theme.border} ${theme.bg} text-xs leading-relaxed`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1.5">
                  <span>{theme.emoji}</span>
                  <span className={theme.text}>{msg.agent}</span>
                </div>
                <p className="text-slate-300 font-sans">{msg.message}</p>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
