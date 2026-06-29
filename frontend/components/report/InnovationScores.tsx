"use client";

import { motion } from 'framer-motion';
import { ReportScores } from '@/lib/types';

interface InnovationScoresProps {
  scores: ReportScores;
}

export default function InnovationScores({ scores }: InnovationScoresProps) {
  const s = scores || {} as any;
  const overall = s.overall ?? 0;
  const innovation = s.innovation ?? 0;
  const market_opportunity = s.market_opportunity ?? 0;
  const technical_feasibility = s.technical_feasibility ?? 0;
  const business_viability = s.business_viability ?? 0;
  const patent_novelty = s.patent_novelty ?? 0;

  const cards = [
    { title: "Overall Score", value: overall, color: "from-indigo-500 to-purple-500", glow: "rgba(99, 102, 241, 0.15)" },
    { title: "Innovation", value: innovation, color: "from-purple-500 to-indigo-500", glow: "rgba(139, 92, 246, 0.15)" },
    { title: "Market Opportunity", value: market_opportunity, color: "from-pink-500 to-rose-500", glow: "rgba(236, 72, 153, 0.15)" },
    { title: "Technical Feasibility", value: technical_feasibility, color: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.15)" },
    { title: "Business Viability", value: business_viability, color: "from-amber-500 to-orange-500", glow: "rgba(245, 158, 11, 0.15)" },
    { title: "Patent Novelty", value: patent_novelty, color: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.15)" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05, duration: 0.4 }}
          style={{ boxShadow: `0 0 20px ${card.glow}` }}
          className="rounded-xl bg-[#0F1421] border border-indigo-950/60 p-4 text-center flex flex-col justify-between"
        >
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">{card.title}</h4>
            <p className="text-3xl font-bold font-display mt-2 text-white">{card.value}<span className="text-xs text-slate-500">/100</span></p>
          </div>
          
          <div className="w-full bg-[#080B14] h-1.5 rounded-full overflow-hidden mt-4">
            <motion.div
              className={`h-full bg-gradient-to-r ${card.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${card.value}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
