"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GenesisReport } from '@/lib/types';
import { getMarkdownExport, downloadPptx } from '@/lib/api';

interface ExportPanelProps {
  report: GenesisReport;
}

export default function ExportPanel({ report }: ExportPanelProps) {
  const [pptxLoading, setPptxLoading] = useState(false);
  const [pptxDone, setPptxDone] = useState(false);
  const [pptxError, setPptxError] = useState('');

  const handleDownloadPptx = async () => {
    setPptxLoading(true);
    setPptxError('');
    setPptxDone(false);
    try {
      await downloadPptx(report.session_id);
      setPptxDone(true);
      setTimeout(() => setPptxDone(false), 3000);
    } catch (e: any) {
      setPptxError(e?.message || 'Failed to generate pitch deck.');
    } finally {
      setPptxLoading(false);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `genesis-report-${report.session_id}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadMarkdown = async () => {
    try {
      const markdown = await getMarkdownExport(report.session_id);
      const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(markdown);
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `genesis-report-${report.session_id}.md`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Failed to compile markdown export: " + e);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      {/* ── PPTX Hero Button ─────────────────────────────────────── */}
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-indigo-500/30"
        style={{ background: 'linear-gradient(135deg, #0F1421 0%, #161D2F 100%)' }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Glowing top bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-6 flex flex-col md:flex-row items-center gap-6">
          {/* Icon + copy */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
              🎯
            </div>
            <div>
              <h4 className="text-white font-bold text-base font-display">
                Download Investor Pitch Deck
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Professional 12-slide PowerPoint generated from your R&amp;D report.
                Dark-themed, VC-ready, fully formatted.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={handleDownloadPptx}
            disabled={pptxLoading}
            whileHover={{ scale: pptxLoading ? 1 : 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`
              relative shrink-0 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide
              transition-all duration-200 flex items-center gap-2.5 min-w-[220px] justify-center
              ${pptxDone
                ? 'bg-emerald-600 border border-emerald-400/30 text-white shadow-lg shadow-emerald-600/25'
                : pptxLoading
                  ? 'bg-indigo-700/50 border border-indigo-500/30 text-indigo-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-400/30 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50'
              }
            `}
          >
            <AnimatePresence mode="wait">
              {pptxLoading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  {/* Spinner */}
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Generating Slides…
                </motion.span>
              ) : pptxDone ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  ✓ Downloaded!
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export as PowerPoint
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Slide preview pills */}
        <div className="px-6 pb-4 flex flex-wrap gap-1.5">
          {[
            'Title', 'Problem', 'Solution', 'Market',
            'Competition', 'Technology', 'Business Model',
            'Financials', 'GTM Strategy', 'IP & Patents',
            'Roadmap', 'The Ask'
          ].map((s, i) => (
            <span key={s}
              className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/20 text-indigo-400"
              style={{ background: 'rgba(99,102,241,0.07)' }}
            >
              {String(i + 1).padStart(2, '0')} {s.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {pptxError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-6 mb-4 px-4 py-2 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-xs"
            >
              ⚠ {pptxError}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Secondary export row ───────────────────────────────────── */}
      <div className="rounded-xl border border-indigo-950/60 p-4 flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ background: '#0F1421' }}>
        <div>
          <h4 className="text-sm font-bold text-white font-display">Other Export Formats</h4>
          <p className="text-xs text-slate-500 mt-0.5">Download the full R&amp;D package in your preferred format.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleDownloadMarkdown}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-900/40 text-xs font-semibold font-mono tracking-wider transition"
          >
            📄 Markdown
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-900/40 text-xs font-semibold font-mono tracking-wider transition"
          >
            {"{ }"} JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-900/40 text-xs font-semibold font-mono tracking-wider transition"
          >
            🖨️ PDF / Print
          </button>
        </div>
      </div>
    </div>
  );
}
