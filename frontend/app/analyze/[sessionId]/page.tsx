"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGenesisStore } from '@/lib/store';
import { AgentKey, SessionState } from '@/lib/types';
import AgentOrg from '@/components/dashboard/AgentOrg';
import ParallelTimeline from '@/components/dashboard/ParallelTimeline';
import DebateStream from '@/components/dashboard/DebateStream';
import Link from 'next/link';

export default function LiveDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const { sessionState, setSessionState, setSessionId, updateAgent, addDebateMessage, setChiefBrief, setReport } = useGenesisStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  // Live Timer Effect
  useEffect(() => {
    if (sessionState?.status === 'processing' || sessionState?.status === 'pending') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState?.status]);

  // SSE stream connecting Effect
  useEffect(() => {
    if (!sessionId) return;
    
    // Set active ID in store
    setSessionId(sessionId);

    // Initialize EventSource
    const eventSource = new EventSource(`http://127.0.0.1:8000/api/session/${sessionId}/stream`);
    sseRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;
        
        switch (type) {
          case 'session_state':
            // Overwrite whole state if received
            setSessionState(data);
            break;
          case 'brief_ready':
            setChiefBrief(data);
            break;
          case 'agent_started':
            updateAgent(data.agent as AgentKey, { status: 'RUNNING', progress: 15, status_text: 'Calling Cerebras Gemma-4 cluster...' });
            break;
          case 'agent_progress':
            updateAgent(data.agent as AgentKey, { progress: data.progress, status_text: data.status_text });
            break;
          case 'agent_complete':
            updateAgent(data.agent as AgentKey, {
              status: 'COMPLETE',
              progress: 100,
              status_text: 'Specialist analysis resolved.',
              elapsed: data.elapsed_ms / 1000,
              metrics: data.metrics
            });
            break;
          case 'agent_failed':
            updateAgent(data.agent as AgentKey, { status: 'FAILED', status_text: `Error: ${data.error}` });
            break;
          case 'debate_message':
            addDebateMessage(data);
            break;
          case 'synthesis_start':
            // Chief Scientist synthesis trigger
            if (sessionState) {
              setSessionState({
                ...sessionState,
                status: 'processing'
              });
            }
            break;
          case 'report_ready':
            setReport(data.report);
            break;
          case 'error':
            setErrorMessage(data.message || "An unexpected pipeline error occurred.");
            break;
          default:
            break;
        }
      } catch (err) {
        console.error("Error parsing SSE event data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error. Reconnecting...", err);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  const isComplete = sessionState?.status === 'complete';

  return (
    <div className="flex flex-col min-h-screen bg-[#080B14]">
      {/* Header */}
      <header className="border-b border-indigo-950/40 bg-[#080B14]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <span className="font-bold font-display tracking-wider text-white">GENESIS AI</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Session: {sessionId.slice(0, 8)}...</span>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-indigo-400 font-semibold">Live Monitor</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        
        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-xs text-red-400 font-mono">
            <strong>Orchestration Failure:</strong> {errorMessage}
          </div>
        )}

        {sessionState ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Middle: Chief and Agents Org Grid */}
            <div className="lg:col-span-2 space-y-8">
              <AgentOrg state={sessionState} elapsedSeconds={elapsedSeconds} />
            </div>

            {/* Right Panel: Parallel Timeline + Debate Stream */}
            <div className="space-y-6">
              <ParallelTimeline state={sessionState} />
              <DebateStream debate={sessionState.debate} />
            </div>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400 mt-4 font-mono">Connecting to SSE gateway...</p>
          </div>
        )}

        {/* Floating completion CTA banner at bottom */}
        {isComplete && sessionState?.report && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md w-full px-4 z-50 animate-bounce">
            <Link
              href={`/analyze/${sessionId}/report`}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm py-4 px-6 shadow-xl shadow-emerald-500/20 border border-emerald-400/30 text-center transition transform hover:-translate-y-0.5"
            >
              📂 View Final R&D Report
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
