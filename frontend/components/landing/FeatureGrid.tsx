"use client";

import { motion } from 'framer-motion';

export default function FeatureGrid() {
  const features = [
    {
      title: "🔬 Parallel Multi-Agent Collaboration",
      desc: "Not a single linear chatbot. An entire organization of specialized AI agents runs simultaneously to evaluate your innovation."
    },
    {
      title: "⚡ Cerebras Compute Speed",
      desc: "Inference powered by Cerebras. 8 agents execute and finalize analysis in the time it takes standard models to reply with a single paragraph."
    },
    {
      title: "🌐 Multimodal Intelligence Hub",
      desc: "Supports images of whiteboard sketches, PDF technical docs, video demonstrations, voice pitches, or plain text descriptions."
    },
    {
      title: "🤝 Agent Debate Chamber",
      desc: "Specialists do not work in silos. They challenge each other's conclusions in real-time, resolving novelty gaps before synthesis."
    },
    {
      title: "📊 Structured scoring breakdown",
      desc: "Get quantified assessments across 6 core criteria, including Technical Feasibility, Patent Novelty, and Market Viability."
    },
    {
      title: "📦 Professional R&D Export Package",
      desc: "Compile everything into a structured R&D document. Export instantly as Markdown, full JSON, or a clean viewable PDF."
    }
  ];

  return (
    <div className="py-24 sm:py-32 border-t border-indigo-950/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold font-display text-white sm:text-4xl">Platform Features</h2>
          <p className="mt-4 text-slate-400">Everything you need to analyze, validate, and prepare your startup idea for funding.</p>
        </div>
        
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.4)' }}
              className="p-6 rounded-xl bg-[#0F1421] border border-indigo-950/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-semibold text-white font-display mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
