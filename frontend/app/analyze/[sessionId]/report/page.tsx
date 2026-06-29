"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getReport } from '@/lib/api';
import { GenesisReport } from '@/lib/types';
import InnovationScores from '@/components/report/InnovationScores';
import ExportPanel from '@/components/report/ExportPanel';
import Link from 'next/link';

/* ─── tiny helpers ─────────────────────────────────────────── */
function Tag({ children, color = 'indigo' }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, string> = {
    indigo: 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
    rose:    'bg-rose-950/40 border-rose-500/20 text-rose-400',
    amber:   'bg-amber-950/40 border-amber-500/20 text-amber-400',
    purple:  'bg-purple-950/40 border-purple-500/20 text-purple-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${map[color] ?? map.indigo}`}>
      {children}
    </span>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-indigo-950/60 bg-[#0F1421] p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="text-2xl mt-0.5">{icon}</span>
      <div>
        <h2 className="text-lg font-bold text-white font-display tracking-wide">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── Market Size Donut Chart (pure SVG) ───────────────────── */
function MarketDonut({ tam, sam, som }: { tam: number; sam: number; som: number }) {
  const total = tam;
  const r = 70;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { label: 'TAM', value: tam, color: '#6366F1', pct: 1 },
    { label: 'SAM', value: sam, color: '#8B5CF6', pct: sam / tam },
    { label: 'SOM', value: som, color: '#EC4899', pct: som / tam },
  ];

  return (
    <div className="flex items-center gap-8">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {segments.map((seg, i) => {
          const offset = circumference * (1 - seg.pct);
          const rotation = -90 + (i === 0 ? 0 : i === 1 ? 5 : 10);
          return (
            <circle
              key={seg.label}
              cx={cx} cy={cy}
              r={r - i * 14}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeDasharray={`${circumference * seg.pct} ${circumference * (1 - seg.pct)}`}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${cx} ${cy})`}
              opacity={0.85}
            />
          );
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="bold">Market</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#94A3B8" fontSize="9">Opportunity</text>
      </svg>
      <div className="space-y-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400">{s.label}</div>
              <div className="text-sm font-bold text-white">${s.value}B</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Risk Heatmap Card ────────────────────────────────────── */
const probColor = (p: string) =>
  p === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  : p === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

const catIcon: Record<string, string> = {
  Technical: '⚙️', Market: '📈', Regulatory: '⚖️',
  Financial: '💰', Competitive: '🛡️', Operational: '🔧',
};

/* ─── Tech Stack Grid ──────────────────────────────────────── */
const catColor: Record<string, string> = {
  Frontend: 'indigo', Backend: 'purple', ML: 'pink',
  Infra: 'amber', DB: 'emerald', Infrastructure: 'amber',
  Database: 'emerald', 'Machine Learning': 'rose',
};

/* ─── Roadmap Phase Card ───────────────────────────────────── */
const phaseColors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

/* ─── Workflow / System Architecture SVG ──────────────────── */
function ArchWorkflow({ nodes, edges }: { nodes: string[]; edges: Array<[string, string, string]> }) {
  if (!nodes || nodes.length === 0) return null;
  const cols = Math.min(nodes.length, 4);
  const nodeW = 130;
  const nodeH = 44;
  const padX = 24;
  const padY = 32;
  const gapX = 40;
  const gapY = 54;
  const rows = Math.ceil(nodes.length / cols);
  const svgW = cols * (nodeW + gapX) - gapX + padX * 2;
  const svgH = rows * (nodeH + gapY) - gapY + padY * 2;

  const nodePos = nodes.map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: padX + col * (nodeW + gapX),
      y: padY + row * (nodeH + gapY),
    };
  });

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6366F1" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Draw edges */}
      {(edges || []).map(([from, to, label], i) => {
        const fi = nodes.findIndex(n => n.toLowerCase().includes(from.toLowerCase()));
        const ti = nodes.findIndex(n => n.toLowerCase().includes(to.toLowerCase()));
        if (fi === -1 || ti === -1) return null;
        const fp = nodePos[fi];
        const tp = nodePos[ti];
        const x1 = fp.x + nodeW / 2;
        const y1 = fp.y + nodeH;
        const x2 = tp.x + nodeW / 2;
        const y2 = tp.y;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={i}>
            <path d={`M${x1},${y1} C${x1},${y1 + 20} ${x2},${y2 - 20} ${x2},${y2}`}
              stroke="#6366F1" strokeWidth="1.5" fill="none"
              strokeDasharray="4 3" opacity="0.5"
              markerEnd="url(#arrow)" />
            {label && (
              <text x={mx} y={my} textAnchor="middle" fill="#8B5CF6"
                fontSize="8" fontFamily="monospace">{label}</text>
            )}
          </g>
        );
      })}

      {/* Draw nodes */}
      {nodes.map((node, i) => {
        const pos = nodePos[i];
        const hue = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'][i % 6];
        return (
          <g key={i}>
            <rect x={pos.x} y={pos.y} width={nodeW} height={nodeH}
              rx="8" fill="#0F1421" stroke={hue} strokeWidth="1.5" opacity="0.9" />
            <rect x={pos.x} y={pos.y} width={4} height={nodeH} rx="2" fill={hue} />
            <text x={pos.x + 14} y={pos.y + nodeH / 2 + 4}
              fill="#E2E8F0" fontSize="10" fontFamily="'Segoe UI', sans-serif" fontWeight="500">
              {node.length > 14 ? node.slice(0, 14) + '…' : node}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── GTM Funnel SVG ───────────────────────────────────────── */
function GTMFunnel({ channels }: { channels: string[] }) {
  const stages = (channels || []).slice(0, 4);
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];
  const w = 360;
  const h = 220;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {stages.map((ch, i) => {
        const topW = w - i * 48;
        const botW = w - (i + 1) * 48;
        const rowH = h / stages.length - 6;
        const y = i * (rowH + 6);
        const topX = (w - topW) / 2;
        const botX = (w - botW) / 2;
        return (
          <g key={i}>
            <polygon
              points={`${topX},${y} ${topX + topW},${y} ${botX + botW},${y + rowH} ${botX},${y + rowH}`}
              fill={colors[i % colors.length]}
              opacity={0.15 + i * 0.06}
              stroke={colors[i % colors.length]}
              strokeWidth="1"
            />
            <text x={w / 2} y={y + rowH / 2 + 4}
              textAnchor="middle" fill="#E2E8F0"
              fontSize="10" fontFamily="'Segoe UI', sans-serif">
              {ch.slice(0, 45)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Competitor Bar Chart ─────────────────────────────────── */
function CompetitorBars({ competitors }: { competitors: any[] }) {
  return (
    <div className="space-y-3">
      {(competitors || []).map((c: any, i: number) => {
        const typeColor = c.type === 'Direct' ? '#EC4899' : c.type === 'Emerging' ? '#F59E0B' : '#6366F1';
        return (
          <div key={i} className="rounded-xl border border-indigo-950/50 bg-[#080B14] p-4">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm">{c.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border"
                    style={{ color: typeColor, borderColor: `${typeColor}33`, background: `${typeColor}15` }}>
                    {c.type}
                  </span>
                  {c.funding && <span className="text-[10px] text-slate-500 font-mono">{c.funding}</span>}
                </div>
                {c.positioning && <p className="text-[10px] text-slate-500 mt-0.5">{c.positioning}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="text-[9px] font-mono font-bold text-emerald-400 mb-1">STRENGTH</div>
                <p className="text-xs text-slate-300 leading-relaxed">{c.strength}</p>
              </div>
              <div>
                <div className="text-[9px] font-mono font-bold text-rose-400 mb-1">WEAKNESS</div>
                <p className="text-xs text-slate-300 leading-relaxed">{c.weakness}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Visual Roadmap Timeline ──────────────────────────────── */
function RoadmapTimeline({ phases }: { phases: any[] }) {
  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-30" />
      <div className="space-y-6">
        {(phases || []).map((phase: any, i: number) => {
          const col = phaseColors[i % phaseColors.length];
          return (
            <div key={i} className="relative flex gap-5 pl-4">
              {/* Dot */}
              <div className="relative z-10 flex items-start">
                <div className="w-5 h-5 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center"
                  style={{ borderColor: col, background: `${col}25` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: col }} />
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 rounded-xl border p-5" style={{ borderColor: `${col}30`, background: `${col}08` }}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-bold text-white text-sm">{phase.phase}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold"
                      style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}>
                      {phase.duration}
                    </span>
                  </div>
                </div>
                {phase.goal && (
                  <p className="text-xs text-slate-400 mb-3 italic">🎯 {phase.goal}</p>
                )}
                <ul className="space-y-1.5">
                  {(phase.tasks || []).map((task: string, ti: number) => (
                    <li key={ti} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="mt-0.5 text-[8px]" style={{ color: col }}>◆</span>
                      {task}
                    </li>
                  ))}
                </ul>
                {phase.success_metric && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-mono text-slate-500">SUCCESS METRIC: </span>
                    <span className="text-[10px] text-slate-300">{phase.success_metric}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Development Timeline ─────────────────────────────────── */
function DevTimeline({ milestones }: { milestones: any[] }) {
  return (
    <div className="relative overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-2">
        {(milestones || []).map((m: any, i: number) => {
          const col = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#06B6D4','#6366F1','#8B5CF6'][i % 8];
          return (
            <div key={i} className="flex flex-col items-center" style={{ minWidth: 130 }}>
              {/* Connector */}
              <div className="flex items-center w-full mb-2">
                <div className="flex-1 h-0.5" style={{ background: i === 0 ? 'transparent' : col, opacity: 0.4 }} />
                <div className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                  style={{ borderColor: col, background: `${col}20` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />
                </div>
                <div className="flex-1 h-0.5" style={{ background: i === (milestones.length - 1) ? 'transparent' : col, opacity: 0.4 }} />
              </div>
              {/* Card */}
              <div className="w-full rounded-lg border p-3 text-center" style={{ borderColor: `${col}30`, background: `${col}08` }}>
                <div className="text-[9px] font-mono font-bold mb-1" style={{ color: col }}>{m.week}</div>
                <div className="text-xs font-bold text-white leading-tight">{m.milestone}</div>
                {m.description && (
                  <div className="text-[10px] text-slate-500 mt-1.5 leading-snug">{m.description}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN REPORT PAGE
══════════════════════════════════════════════════════════════ */
export default function ReportPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const [report, setReport] = useState<GenesisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@media print { .no-print { display:none!important; } }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    getReport(sessionId)
      .then(setReport)
      .catch(() => setError('Report is still compiling or does not exist.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080B14] text-slate-300">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-xs font-mono">Retrieving Innovation Package…</p>
    </div>
  );

  if (error || !report) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080B14] text-slate-300 text-center px-6">
      <span className="text-4xl mb-4">⚠️</span>
      <p className="text-sm max-w-md">{error || 'Report payload error.'}</p>
      <Link href={`/analyze/${sessionId}`}
        className="mt-6 text-xs text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded bg-indigo-950/20 hover:text-white">
        ← Back to Dashboard
      </Link>
    </div>
  );

  const s = report.sections || {} as any;
  const exec      = s.executive_summary || '';
  const research  = s.research_findings || {};
  const market    = s.market_analysis   || {};
  const comps     = s.competitor_analysis || [];
  const patent    = s.patent_landscape  || {};
  const novelty   = s.novelty_score_breakdown || {};
  const tech      = s.technical_architecture  || {};
  const stack     = s.technology_stack  || [];
  const roadmap   = s.mvp_roadmap       || [];
  const biz       = s.business_model    || {};
  const risks     = s.risk_analysis     || [];
  const gtm       = s.gtm_strategy      || {};
  const pitch     = s.investor_pitch    || {};
  const timeline  = s.development_timeline || [];

  const navItems = [
    { id: 'summary',    label: 'Executive Summary',      icon: '📝' },
    { id: 'research',   label: 'Research Findings',      icon: '📚' },
    { id: 'market',     label: 'Market Analysis',        icon: '📈' },
    { id: 'competitors',label: 'Competitor Grid',        icon: '🛡️' },
    { id: 'patent',     label: 'Patent Landscape',       icon: '📜' },
    { id: 'novelty',    label: 'Novelty Breakdown',      icon: '💡' },
    { id: 'technical',  label: 'Architecture & Stack',   icon: '🏗️' },
    { id: 'roadmap',    label: 'MVP Roadmap',            icon: '🗺️' },
    { id: 'business',   label: 'Business Model',         icon: '💼' },
    { id: 'risks',      label: 'Risk Matrix',            icon: '⚡' },
    { id: 'gtm',        label: 'Go-To-Market',           icon: '🚀' },
    { id: 'pitch',      label: 'Investor Pitch',         icon: '🎤' },
    { id: 'timeline',   label: 'Dev Timeline',           icon: '📅' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080B14]">
      {/* Header */}
      <header className="border-b border-indigo-950/40 bg-[#080B14]/90 backdrop-blur-md no-print sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <span className="font-bold font-display tracking-wider text-white text-sm">GENESIS AI</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link href={`/analyze/${sessionId}`} className="text-slate-400 hover:text-white transition">← Live Monitor</Link>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 font-mono">ID: {sessionId?.slice(0, 8)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* Scores */}
        <div className="no-print">
          <InnovationScores scores={report.scores || {} as any} />
        </div>

        {/* Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Sidebar */}
          <nav className="w-full md:w-56 shrink-0 space-y-1 no-print md:sticky md:top-20">
            <div className="px-3 py-2 mb-2 rounded bg-indigo-950/20 border border-indigo-500/10 text-[9px] uppercase font-bold font-mono tracking-widest text-indigo-400">
              Report Index
            </div>
            {navItems.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-[#0F1421] hover:text-white'
                }`}>
                <span>{icon}</span><span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── Executive Summary ── */}
            {activeTab === 'summary' && (
              <Card>
                <SectionHeader icon="📝" title="Executive Summary"
                  subtitle="Chief Scientist synthesis — Bain & Company + MIT Media Lab quality" />
                {exec
                  ? exec.split('\n').filter(Boolean).map((p: string, i: number) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed mb-4 last:mb-0">{p}</p>
                    ))
                  : <p className="text-slate-500 text-sm">Summary is being compiled…</p>}
              </Card>
            )}

            {/* ── Research Findings ── */}
            {activeTab === 'research' && (
              <div className="space-y-5">
                <Card>
                  <SectionHeader icon="📚" title="Research Landscape" />
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">{research.summary}</p>
                  {research.technology_readiness && (
                    <div className="mb-5 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                      <div className="text-[10px] font-mono font-bold text-indigo-400 mb-1">TRL ASSESSMENT</div>
                      <p className="text-xs text-slate-300">{research.technology_readiness}</p>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Key Findings</div>
                      <ul className="space-y-2">
                        {(research.findings || []).map((f: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs text-slate-300">
                            <span className="text-indigo-400 mt-0.5 shrink-0">◆</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Open Problems Addressed</div>
                      <ul className="space-y-2">
                        {(research.open_problems || []).map((p: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs text-slate-300">
                            <span className="text-purple-400 mt-0.5 shrink-0">○</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
                {(research.sources || []).length > 0 && (
                  <Card>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Academic Sources</div>
                    <div className="flex flex-wrap gap-2">
                      {research.sources.map((src: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded border border-indigo-950/60 bg-[#080B14] text-[10px] text-indigo-400 font-mono">{src}</span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── Market Analysis ── */}
            {activeTab === 'market' && (
              <div className="space-y-5">
                <Card>
                  <SectionHeader icon="📈" title="Market Analysis" subtitle="TAM · SAM · SOM breakdown" />
                  <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
                    <MarketDonut tam={42} sam={8} som={1.2} />
                    <div className="flex-1">
                      <div className="text-base font-bold text-indigo-400 mb-2 font-display">{market.market_size}</div>
                      {market.market_timing && (
                        <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20">
                          <div className="text-[10px] font-mono font-bold text-amber-400 mb-1">⏱ WHY NOW</div>
                          <p className="text-xs text-slate-300">{market.market_timing}</p>
                        </div>
                      )}
                      {market.geographic_focus && (
                        <div className="mt-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                          <div className="text-[10px] font-mono font-bold text-emerald-400 mb-1">🌍 GEO ENTRY</div>
                          <p className="text-xs text-slate-300">{market.geographic_focus}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Macro Trends</div>
                  <div className="space-y-2">
                    {(market.trends || []).map((t: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-[#080B14] border border-indigo-950/40">
                        <span className="text-indigo-400 font-mono text-xs font-bold shrink-0">T{i+1}</span>
                        <p className="text-xs text-slate-300">{t}</p>
                      </div>
                    ))}
                  </div>
                </Card>
                {(market.customer_segments || []).length > 0 && (
                  <Card>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Segments</div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {market.customer_segments.map((seg: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-[#080B14] border border-purple-950/50">
                          <div className="text-[9px] text-purple-400 font-mono font-bold mb-1">SEGMENT {i+1}</div>
                          <p className="text-xs text-slate-300">{seg}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── Competitor Grid ── */}
            {activeTab === 'competitors' && (
              <Card>
                <SectionHeader icon="🛡️" title="Competitive Landscape"
                  subtitle="Named competitors with funding, strengths, and exploitable weaknesses" />
                {comps.length > 0
                  ? <CompetitorBars competitors={comps} />
                  : <p className="text-slate-500 text-sm">Competitor data not available for this report.</p>}
              </Card>
            )}

            {/* ── Patent Landscape ── */}
            {activeTab === 'patent' && (
              <div className="space-y-5">
                <Card>
                  <SectionHeader icon="📜" title="Patent Landscape" subtitle="Freedom-to-operate analysis and IP moat rating" />
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`px-4 py-2 rounded-lg border font-bold text-sm ${
                      patent.ip_moat_rating?.toLowerCase().startsWith('strong')
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                        : patent.ip_moat_rating?.toLowerCase().startsWith('moderate')
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-400'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
                    }`}>
                      IP MOAT: {patent.ip_moat_rating || 'Moderate'}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-5 leading-relaxed">{patent.status}</p>
                  {(patent.existing_patents || []).length > 0 && (
                    <>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Prior Art References</div>
                      <div className="space-y-2">
                        {patent.existing_patents.map((p: string, i: number) => (
                          <div key={i} className="flex gap-3 p-3 rounded bg-[#080B14] border border-indigo-950/40">
                            <span className="text-indigo-500 font-mono text-xs shrink-0">#{i+1}</span>
                            <span className="text-xs text-slate-300 font-mono">{p}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {patent.claim_strategy && (
                    <div className="mt-5 p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                      <div className="text-[10px] font-mono font-bold text-indigo-400 mb-2">RECOMMENDED FILING STRATEGY</div>
                      <p className="text-xs text-slate-300">{patent.claim_strategy}</p>
                    </div>
                  )}
                </Card>
                {(patent.novelty_gaps || []).length > 0 && (
                  <Card>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Claimable White-Space Opportunities</div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {patent.novelty_gaps.map((g: string, i: number) => (
                        <div key={i} className="flex gap-2 p-3 rounded bg-emerald-950/10 border border-emerald-500/15">
                          <span className="text-emerald-400 text-sm">✓</span>
                          <p className="text-xs text-slate-300">{g}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── Novelty Breakdown ── */}
            {activeTab === 'novelty' && (
              <Card>
                <SectionHeader icon="💡" title="Novelty & Innovation Breakdown" />
                <div className="flex items-center gap-4 mb-5">
                  <div className="text-4xl font-bold text-indigo-400 font-display">{novelty.score ?? report.scores?.innovation ?? '—'}</div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Innovation Score</div>
                    <Tag color={novelty.breakthrough_classification === 'Transformative' ? 'rose' : novelty.breakthrough_classification === 'Disruptive' ? 'purple' : 'indigo'}>
                      {novelty.breakthrough_classification || 'Disruptive'}
                    </Tag>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">{novelty.breakdown}</p>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Novel Claims</div>
                    <ul className="space-y-2">
                      {(novelty.gaps || []).map((g: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-300">
                          <span className="text-purple-400 shrink-0">✦</span>{g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Historical Analogies</div>
                    <ul className="space-y-2">
                      {(novelty.analogous_innovations || []).map((a: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-300">
                          <span className="text-amber-400 shrink-0">→</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* ── Technical Architecture ── */}
            {activeTab === 'technical' && (
              <div className="space-y-5">
                <Card>
                  <SectionHeader icon="🏗️" title="System Architecture" subtitle="Full-stack design and scalability plan" />
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">{tech.architecture_summary}</p>

                  {/* Architecture Workflow Diagram */}
                  {(tech.diagram_nodes || []).length > 0 && (
                    <div className="mb-6">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">System Workflow Diagram</div>
                      <div className="rounded-xl bg-[#080B14] border border-indigo-950/40 p-4">
                        <ArchWorkflow nodes={tech.diagram_nodes || []} edges={tech.diagram_edges || []} />
                      </div>
                    </div>
                  )}

                  {tech.mvp_technical_scope && (
                    <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20 mb-4">
                      <div className="text-[10px] font-mono font-bold text-indigo-400 mb-1">90-DAY MVP SCOPE</div>
                      <p className="text-xs text-slate-300">{tech.mvp_technical_scope}</p>
                    </div>
                  )}
                  {tech.scalability_plan && (
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                      <div className="text-[10px] font-mono font-bold text-emerald-400 mb-1">SCALABILITY PLAN</div>
                      <p className="text-xs text-slate-300">{tech.scalability_plan}</p>
                    </div>
                  )}
                </Card>
                <Card>
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">Technology Stack</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {stack.map((item: any, i: number) => {
                      const cc = catColor[item.category] || 'indigo';
                      return (
                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-[#080B14] border border-indigo-950/40">
                          <div className="shrink-0">
                            <Tag color={cc}>{item.category || 'Core'}</Tag>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.role}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* ── MVP Roadmap ── */}
            {activeTab === 'roadmap' && (
              <Card>
                <SectionHeader icon="🗺️" title="MVP Roadmap" subtitle="Phase-by-phase build plan with success metrics" />
                {roadmap.length > 0
                  ? <RoadmapTimeline phases={roadmap} />
                  : <p className="text-slate-500 text-sm">Roadmap data is being compiled…</p>}
              </Card>
            )}

            {/* ── Business Model ── */}
            {activeTab === 'business' && (
              <div className="space-y-5">
                <Card>
                  <SectionHeader icon="💼" title="Business Model" />
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">{biz.description}</p>
                  {biz.unit_economics && (
                    <div className="mb-5 p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                      <div className="text-[10px] font-mono font-bold text-emerald-400 mb-1">UNIT ECONOMICS</div>
                      <p className="text-xs text-slate-300 font-mono">{biz.unit_economics}</p>
                    </div>
                  )}
                  {biz.revenue_projections && (
                    <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20 mb-5">
                      <div className="text-[10px] font-mono font-bold text-indigo-400 mb-1">REVENUE PROJECTIONS</div>
                      <p className="text-sm text-white font-bold">{biz.revenue_projections}</p>
                    </div>
                  )}
                  {(biz.tiers || []).length > 0 && (
                    <>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Pricing Tiers</div>
                      <div className="grid md:grid-cols-3 gap-4">
                        {biz.tiers.map((tier: string, i: number) => {
                          const cols2 = ['border-indigo-500/30 bg-indigo-950/20', 'border-purple-500/30 bg-purple-950/20', 'border-pink-500/30 bg-pink-950/20'];
                          const hdr = ['text-indigo-400', 'text-purple-400', 'text-pink-400'];
                          return (
                            <div key={i} className={`p-4 rounded-xl border ${cols2[i % 3]}`}>
                              <div className={`text-[10px] font-mono font-bold mb-2 ${hdr[i % 3]}`}>TIER {i+1}</div>
                              <p className="text-xs text-slate-300">{tier}</p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </Card>
              </div>
            )}

            {/* ── Risk Matrix ── */}
            {activeTab === 'risks' && (
              <Card>
                <SectionHeader icon="⚡" title="Risk Matrix & Mitigation Playbook" />
                {risks.length > 0 ? (
                  <div className="space-y-3">
                    {risks.map((r: any, i: number) => (
                      <div key={i} className="rounded-xl border border-indigo-950/50 bg-[#080B14] p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-lg">{catIcon[r.category] || '⚠️'}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm font-bold text-white">{r.risk}</span>
                              {r.category && <Tag color="indigo">{r.category}</Tag>}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {r.probability && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${probColor(r.probability)}`}>
                                  Prob: {r.probability}
                                </span>
                              )}
                              {r.impact && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${probColor(r.impact)}`}>
                                  Impact: {r.impact}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {r.mitigation && (
                          <div className="flex gap-2 p-3 rounded-lg bg-emerald-950/15 border border-emerald-500/15">
                            <span className="text-emerald-400 text-sm">🛡</span>
                            <p className="text-xs text-slate-300">{r.mitigation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Risk data is being compiled…</p>
                )}
              </Card>
            )}

            {/* ── GTM Strategy ── */}
            {activeTab === 'gtm' && (
              <div className="space-y-5">
                <Card>
                  <SectionHeader icon="🚀" title="Go-To-Market Strategy" />
                  {gtm.beachhead && (
                    <div className="mb-5 p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                      <div className="text-[10px] font-mono font-bold text-indigo-400 mb-1">🎯 BEACHHEAD MARKET</div>
                      <p className="text-sm text-slate-300">{gtm.beachhead}</p>
                    </div>
                  )}
                  {gtm.first_100_customers && (
                    <div className="mb-5 p-4 rounded-lg bg-purple-950/20 border border-purple-500/20">
                      <div className="text-[10px] font-mono font-bold text-purple-400 mb-1">👥 FIRST 100 CUSTOMERS</div>
                      <p className="text-sm text-slate-300">{gtm.first_100_customers}</p>
                    </div>
                  )}
                  {(gtm.channels || []).length > 0 && (
                    <>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Acquisition Funnel</div>
                      <div className="flex justify-center mb-4">
                        <GTMFunnel channels={gtm.channels} />
                      </div>
                    </>
                  )}
                  {gtm.timeline && (
                    <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/20">
                      <div className="text-[10px] font-mono font-bold text-amber-400 mb-1">📅 LAUNCH TIMELINE</div>
                      <p className="text-xs text-slate-300">{gtm.timeline}</p>
                    </div>
                  )}
                </Card>
                {(gtm.partnerships || []).length > 0 && (
                  <Card>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Strategic Partnerships</div>
                    <div className="space-y-2">
                      {gtm.partnerships.map((p: string, i: number) => (
                        <div key={i} className="flex gap-2 p-3 rounded bg-[#080B14] border border-indigo-950/40">
                          <span className="text-indigo-400">🤝</span>
                          <p className="text-xs text-slate-300">{p}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── Investor Pitch ── */}
            {activeTab === 'pitch' && (
              <div className="space-y-5">
                <Card>
                  <SectionHeader icon="🎤" title="Investor Pitch Deck" />
                  {pitch.hook && (
                    <blockquote className="mb-5 pl-4 border-l-2 border-indigo-500 italic text-indigo-300 text-sm leading-relaxed">
                      "{pitch.hook}"
                    </blockquote>
                  )}
                  <div className="grid md:grid-cols-2 gap-4 mb-5">
                    {pitch.problem_statement && (
                      <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-500/20">
                        <div className="text-[10px] font-mono font-bold text-rose-400 mb-2">THE PROBLEM</div>
                        <p className="text-xs text-slate-300">{pitch.problem_statement}</p>
                      </div>
                    )}
                    {pitch.solution_statement && (
                      <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                        <div className="text-[10px] font-mono font-bold text-emerald-400 mb-2">THE SOLUTION</div>
                        <p className="text-xs text-slate-300">{pitch.solution_statement}</p>
                      </div>
                    )}
                  </div>
                  {pitch.traction_needed && (
                    <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/20 mb-5">
                      <div className="text-[10px] font-mono font-bold text-amber-400 mb-1">INVESTMENT THESIS</div>
                      <p className="text-xs text-slate-300">{pitch.traction_needed}</p>
                    </div>
                  )}
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">12-Slide Structure</div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(pitch.slides_outline || []).map((slide: string, i: number) => (
                      <div key={i} className="flex gap-3 p-3 rounded bg-[#080B14] border border-indigo-950/40">
                        <span className="font-mono text-indigo-500 font-bold text-xs shrink-0 w-16">{`Slide ${i+1}`}</span>
                        <span className="text-xs text-slate-300">{slide.replace(/^Slide \d+:?\s*/i, '')}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Dev Timeline ── */}
            {activeTab === 'timeline' && (
              <Card>
                <SectionHeader icon="📅" title="Development Timeline" subtitle="Week-by-week milestones and deliverables" />
                {timeline.length > 0
                  ? <DevTimeline milestones={timeline} />
                  : <p className="text-slate-500 text-sm">Timeline data is being compiled…</p>}
              </Card>
            )}

          </div>
        </div>

        {/* Export Panel */}
        <div className="no-print pt-4">
          <ExportPanel report={report} />
        </div>
      </main>
    </div>
  );
}
