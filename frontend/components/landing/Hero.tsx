"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative relative-glow overflow-hidden py-24 sm:py-32">
      {/* Glow Nebula background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-x-2 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-500/20">
            🧑🔬 Powered by Cerebras
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl font-extrabold font-display tracking-tight text-white sm:text-7xl leading-none"
        >
          GENESIS AI
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl"
        >
          Transform Any Idea Into <br />
          <span className="gradient-text">A Complete Innovation Package. In Seconds.</span>
        </motion.p>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.4 }}
          className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto"
        >
          Upload a whiteboard sketch, image, PDF, or voice note.
          8 AI specialist agents analyze it simultaneously, challenge each other in Debate Mode, and produce a production-grade R&D package in &lt; 10 seconds.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-x-6"
        >
          <Link
            href="/analyze"
            className="rounded-lg bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/35 border border-indigo-400/30 hover:bg-indigo-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-indigo-500/50"
          >
            Start Analyzing →
          </Link>
          <button
            onClick={() => alert("Watch Demo: Loading video timeline...")}
            className="text-sm font-semibold leading-6 text-slate-300 hover:text-white flex items-center gap-2"
          >
            <span>▶</span> Watch Demo
          </button>
        </motion.div>

        {/* Stats bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 border-t border-indigo-950/40 pt-10 sm:grid sm:grid-cols-4 sm:gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center p-4">
            <p className="text-3xl font-bold font-mono text-white">8</p>
            <p className="mt-1 text-sm text-slate-400">Parallel Agents</p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl font-bold font-mono text-white">&lt; 10s</p>
            <p className="mt-1 text-sm text-slate-400">Analysis Speed</p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl font-bold font-mono text-white">12+</p>
            <p className="mt-1 text-sm text-slate-400">Report Sections</p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl font-bold font-mono text-white">Gemma 4</p>
            <p className="mt-1 text-sm text-slate-400">Ultra-Fast Inference</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
