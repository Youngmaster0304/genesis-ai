"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitIdea } from '@/lib/api';
import { useGenesisStore } from '@/lib/store';
import MultimodalInput from '@/components/upload/MultimodalInput';
import Link from 'next/link';

export default function AnalyzeInputPage() {
  const [ideaText, setIdeaText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setSessionId = useGenesisStore((state) => state.setSessionId);
  const router = useRouter();

  const handleStartAnalysis = async () => {
    if (!ideaText.trim()) {
      alert("Please provide an innovation description concept first.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Post to FastAPI
      const sessionId = await submitIdea(ideaText, files);
      setSessionId(sessionId);
      
      // Navigate to live dashboard
      router.push(`/analyze/${sessionId}`);
    } catch (e) {
      alert("Failed to initialize pipeline: " + e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080B14]">
      {/* Header */}
      <header className="border-b border-indigo-950/40 bg-[#080B14]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <span className="font-bold font-display tracking-wider text-white">GENESIS AI</span>
          </Link>
          <div className="text-xs text-slate-400 font-mono">
            R&D Innovation Portal
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display text-white">Initiate Innovation Package</h1>
          <p className="text-slate-400 text-sm">
            Provide details about your project. Submit diagrams, slides, whiteboard pictures, PDFs, or a voice pitch for a full multi-agent review.
          </p>
        </div>

        <div className="rounded-xl glass border-indigo-950/60 p-6 md:p-8 space-y-6">
          <MultimodalInput
            ideaText={ideaText}
            files={files}
            onIdeaChange={setIdeaText}
            onFilesChange={setFiles}
          />

          <div className="pt-4 border-t border-indigo-950/60 flex flex-col items-center gap-3">
            <button
              onClick={handleStartAnalysis}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-indigo-900/40 border border-indigo-500/20 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 border border-indigo-400/30 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-500/50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                  Contacting Chief Scientist...
                </>
              ) : (
                <>
                  🧑🔬 Initiate Analysis
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 font-mono">
              "8 specialist agents will begin working in parallel immediately"
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
