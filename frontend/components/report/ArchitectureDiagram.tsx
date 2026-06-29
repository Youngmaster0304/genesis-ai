"use client";

import { useState } from 'react';

interface ArchitectureDiagramProps {
  svgContent?: string;
}

export default function ArchitectureDiagram({ svgContent }: ArchitectureDiagramProps) {
  const [scale, setScale] = useState(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.6));
  const resetZoom = () => setScale(1);

  return (
    <div className="rounded-xl bg-[#0F1421] border border-indigo-950/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">System Architecture Diagram</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Automated technical topology mapped by the AI Architect Specialist.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <button 
            onClick={zoomOut}
            className="w-7 h-7 rounded bg-[#080B14] border border-indigo-950/40 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            -
          </button>
          <button 
            onClick={resetZoom}
            className="px-2.5 h-7 rounded bg-[#080B14] border border-indigo-950/40 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            Reset
          </button>
          <button 
            onClick={zoomIn}
            className="w-7 h-7 rounded bg-[#080B14] border border-indigo-950/40 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            +
          </button>
        </div>
      </div>

      <div className="w-full bg-[#080B14]/80 rounded-lg border border-indigo-950/20 overflow-hidden relative min-h-[350px] flex items-center justify-center p-4">
        {/* Render SVG content dynamically or fallback to styled static SVG */}
        <div 
          style={{ transform: `scale(${scale})`, transition: 'transform 0.2s ease-out' }}
          className="w-full max-w-2xl flex items-center justify-center"
        >
          {svgContent && svgContent.includes('<svg') ? (
            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : (
            <svg viewBox="0 0 600 320" className="w-full h-auto text-indigo-400" fill="none">
              {/* Grid backdrop */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(99, 102, 241, 0.03)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="600" height="320" fill="url(#grid)" />
              
              {/* Nodes */}
              {/* Clients Node */}
              <rect x="20" y="130" width="100" height="50" rx="6" fill="#0F1421" stroke="#6366F1" strokeWidth="1.5" />
              <text x="70" y="160" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Next.js Client</text>
              
              {/* FastAPI Node */}
              <rect x="180" y="130" width="100" height="50" rx="6" fill="#0F1421" stroke="#8B5CF6" strokeWidth="1.5" />
              <text x="230" y="160" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">FastAPI Gateway</text>

              {/* Agents Cluster */}
              <rect x="340" y="40" width="100" height="230" rx="8" fill="#161D2F" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" />
              <text x="390" y="60" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Parallel Agents</text>
              
              <rect x="350" y="80" width="80" height="24" rx="4" fill="#080B14" stroke="#A78BFA" strokeWidth="1" />
              <text x="390" y="95" fill="#A78BFA" fontSize="8" textAnchor="middle">📚 Research</text>
              
              <rect x="350" y="115" width="80" height="24" rx="4" fill="#080B14" stroke="#A78BFA" strokeWidth="1" />
              <text x="390" y="130" fill="#A78BFA" fontSize="8" textAnchor="middle">📜 Patent</text>
              
              <rect x="350" y="150" width="80" height="24" rx="4" fill="#080B14" stroke="#A78BFA" strokeWidth="1" />
              <text x="390" y="165" fill="#A78BFA" fontSize="8" textAnchor="middle">📈 Market</text>
              
              <rect x="350" y="185" width="80" height="24" rx="4" fill="#080B14" stroke="#A78BFA" strokeWidth="1" />
              <text x="390" y="200" fill="#A78BFA" fontSize="8" textAnchor="middle">💡 Innovation</text>
              
              <rect x="350" y="220" width="80" height="24" rx="4" fill="#080B14" stroke="#A78BFA" strokeWidth="1" />
              <text x="390" y="235" fill="#A78BFA" fontSize="8" textAnchor="middle">🏗️ Technical</text>

              {/* LLM Inference Core (Cerebras) */}
              <rect x="490" y="130" width="100" height="50" rx="6" fill="#0F1421" stroke="#EC4899" strokeWidth="1.5" />
              <text x="540" y="155" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Cerebras API</text>
              <text x="540" y="168" fill="#EC4899" fontSize="8" textAnchor="middle">Gemma 4 31B</text>

              {/* Flow Arrows */}
              <path d="M 120 155 L 180 155" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <path d="M 280 155 L 340 155" stroke="#8B5CF6" strokeWidth="1.5" />
              <path d="M 440 155 L 490 155" stroke="#EC4899" strokeWidth="1.5" />
              
              {/* Arrow Marker */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366F1" />
                </marker>
              </defs>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
