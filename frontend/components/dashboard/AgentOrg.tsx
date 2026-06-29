"use client";

import ChiefScientist from './ChiefScientist';
import AgentCard from './AgentCard';
import { SessionState, AgentKey } from '@/lib/types';

interface AgentOrgProps {
  state: SessionState;
  elapsedSeconds: number;
}

export default function AgentOrg({ state, elapsedSeconds }: AgentOrgProps) {
  const agentRoster = [
    { key: 'research' as AgentKey, name: 'Research Agent', emoji: '📚', role: 'Prior art, literature, context' },
    { key: 'patent' as AgentKey, name: 'Patent Intelligence', emoji: '📜', role: 'Patent landscape, gaps' },
    { key: 'market' as AgentKey, name: 'Market Intelligence', emoji: '📈', role: 'TAM/SAM/SOM, competitors' },
    { key: 'innovation' as AgentKey, name: 'Innovation Evaluator', emoji: '💡', role: 'Novelty & differentiation scoring' },
    { key: 'technical' as AgentKey, name: 'Technical Architect', emoji: '🏗️', role: 'Architecture, stack design' },
    { key: 'business' as AgentKey, name: 'Business Strategist', emoji: '💼', role: 'GTM, revenue models' }
  ];

  return (
    <div className="space-y-8">
      {/* Orchestrator node */}
      <ChiefScientist 
        status={state.status} 
        brief={state.chief_brief} 
        elapsedSeconds={elapsedSeconds} 
      />

      {/* SVG Connecting Flow Lines for Desktop */}
      <div className="relative h-6 w-full hidden md:block overflow-hidden -my-4 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 24" fill="none">
          {/* Centered source linking to split tracks */}
          <path d="M 500 0 L 500 8 C 500 16, 160 8, 160 24" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1.5" className={state.status === 'processing' ? 'flow-line' : ''} />
          <path d="M 500 0 L 500 8 C 500 16, 330 8, 330 24" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1.5" className={state.status === 'processing' ? 'flow-line' : ''} />
          <path d="M 500 0 L 500 8 C 500 16, 500 16, 500 24" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1.5" className={state.status === 'processing' ? 'flow-line' : ''} />
          <path d="M 500 0 L 500 8 C 500 16, 670 8, 670 24" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1.5" className={state.status === 'processing' ? 'flow-line' : ''} />
          <path d="M 500 0 L 500 8 C 500 16, 840 8, 840 24" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1.5" className={state.status === 'processing' ? 'flow-line' : ''} />
        </svg>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {agentRoster.map((agent) => (
          <AgentCard
            key={agent.key}
            name={agent.name}
            emoji={agent.emoji}
            role={agent.role}
            data={state.agents[agent.key]}
          />
        ))}
      </div>
    </div>
  );
}
