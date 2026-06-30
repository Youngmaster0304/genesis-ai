"use client";

import Hero from '@/components/landing/Hero';
import WorkflowAnimation from '@/components/landing/WorkflowAnimation';
import FeatureGrid from '@/components/landing/FeatureGrid';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="border-b border-indigo-950/40 bg-[#080B14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <span className="font-bold font-display tracking-wider text-white">GENESIS AI</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <Link href="/analyze" className="rounded-md bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 hover:text-white px-4 py-2 transition text-xs font-semibold">
              Enter Platform
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero content */}
      <Hero />

      {/* Workflow Section */}
      <section className="bg-[#0b0f1b]/50 py-10 border-y border-indigo-950/20">
        <WorkflowAnimation />
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-24 bg-[#080B14] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/30 text-indigo-400 text-xs font-mono font-semibold mb-4">
              ▶ LIVE DEMO
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See Genesis AI in Action
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Watch how 6 autonomous AI agents collaborate in real-time to transform a raw idea into a complete VC-ready R&amp;D package in under 60 seconds.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20 shadow-2xl shadow-indigo-950/50 bg-[#0b0f1b]">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-xl pointer-events-none" />
            <div className="relative aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/bbMiV5o05_w?autoplay=0&rel=0&modestbranding=1"
                title="Genesis AI Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section id="features">
        <FeatureGrid />
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-950/40 bg-[#080B14] py-8 text-center text-xs text-slate-600 font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Genesis AI Corp. All rights reserved.</p>
          <p>Built on Cerebras. Powered by Gemma 4 31B.</p>
        </div>
      </footer>
    </div>
  );
}
