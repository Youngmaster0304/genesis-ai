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
