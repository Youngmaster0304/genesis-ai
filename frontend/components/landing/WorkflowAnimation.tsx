"use client";

import { motion } from 'framer-motion';

export default function WorkflowAnimation() {
  const agents = [
    { name: "Research Agent", emoji: "📚", color: "#6366F1" },
    { name: "Patent Intel", emoji: "📜", color: "#8B5CF6" },
    { name: "Market Intel", emoji: "📈", color: "#EC4899" },
    { name: "Innovation Eval", emoji: "💡", color: "#10B981" },
    { name: "Tech Architect", emoji: "🏗️", color: "#3B82F6" },
    { name: "Business Strategy", emoji: "💼", color: "#F59E0B" }
  ];

  return (
    <div className="py-20 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold font-display text-white">How the AI R&D Org Executes</h2>
        <p className="mt-4 text-slate-400 max-w-lg mx-auto">Witness the parallel workflow that takes place behind the scenes within seconds.</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Step 1: Input node */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-48 p-5 rounded-xl glass border-indigo-500/20 text-center relative z-10"
        >
          <div className="text-2xl mb-2">📥</div>
          <h3 className="text-sm font-semibold text-white">Multimodal Input</h3>
          <p className="text-xs text-slate-500 mt-1">Idea, PDFs, Images, Audio</p>
        </motion.div>

        {/* Dispatch lines */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <svg className="w-full h-full" viewBox="0 0 1024 400" fill="none">
            {/* Input to Chief */}
            <path d="M 192 200 L 320 200" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" className="flow-line" />
            
            {/* Chief to agents */}
            <path d="M 448 200 C 500 200, 520 80, 570 80" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 448 200 C 500 200, 520 128, 570 128" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 448 200 C 500 200, 520 176, 570 176" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 448 200 C 500 200, 520 224, 570 224" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 448 200 C 500 200, 520 272, 570 272" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 448 200 C 500 200, 520 320, 570 320" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            
            {/* Agents to Synthesis */}
            <path d="M 760 80 C 810 80, 830 200, 880 200" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 760 128 C 810 128, 830 200, 880 200" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 760 176 C 810 176, 830 200, 880 200" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 760 224 C 810 224, 830 200, 880 200" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 760 272 C 810 272, 830 200, 880 200" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
            <path d="M 760 320 C 810 320, 830 200, 880 200" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
          </svg>
        </div>

        {/* Step 2: Chief Scientist orchestrator */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-48 p-5 rounded-xl glass border-purple-500/30 text-center relative z-10 neural-active"
        >
          <div className="text-2xl mb-2">🧑🔬</div>
          <h3 className="text-sm font-semibold text-white">Chief Scientist</h3>
          <p className="text-xs text-slate-400 mt-1">Dispatches & Synthesizes</p>
        </motion.div>

        {/* Step 3: The Parallel Specialists */}
        <div className="flex flex-col gap-3 relative z-10">
          {agents.map((agent, i) => (
            <motion.div 
              key={agent.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="w-48 p-3 rounded-lg bg-[#0F1421] border border-slate-800 text-left flex items-center gap-3"
            >
              <span className="text-lg">{agent.emoji}</span>
              <div>
                <h4 className="text-xs font-semibold text-white">{agent.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono">Parallel Execution</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Step 4: Synthesis & Output report */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-48 p-5 rounded-xl glass border-indigo-500/20 text-center relative z-10"
        >
          <div className="text-2xl mb-2">📊</div>
          <h3 className="text-sm font-semibold text-white">Final R&D Package</h3>
          <p className="text-xs text-indigo-400 mt-1 font-semibold">Generated in 10s</p>
        </motion.div>

      </div>
    </div>
  );
}
