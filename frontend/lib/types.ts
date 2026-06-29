export type AgentKey = 'research' | 'patent' | 'market' | 'innovation' | 'technical' | 'business';

export interface AgentProgress {
  status: 'WAITING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  progress: number;
  status_text: string;
  elapsed: number;
  metrics: {
    elapsed_time?: number;
    tokens_per_sec?: number;
    model_used?: string;
  };
}

export interface DebateMessage {
  agent: string;
  message: string;
}

export interface ChiefBrief {
  hypothesis: string;
  domain: string;
  brief: string;
  critical_questions: Record<string, string[]>;
}

export interface ReportScores {
  innovation: number;
  market_opportunity: number;
  technical_feasibility: number;
  business_viability: number;
  patent_novelty: number;
  overall: number;
}

export interface ReportSections {
  executive_summary: string;
  research_findings: {
    summary: string;
    findings: string[];
    sources: string[];
    technology_readiness?: string;
  };
  market_analysis: {
    market_size: string;
    trends: string[];
  };
  competitor_analysis: Array<{
    name: string;
    strength: string;
    weakness: string;
  }>;
  patent_landscape: {
    status: string;
    existing_patents: string[];
  };
  novelty_score_breakdown: {
    breakdown: string;
    gaps: string[];
  };
  technical_architecture: {
    architecture_summary: string;
    diagram_svg_raw: string;
  };
  technology_stack: Array<{
    name: string;
    role: string;
  }>;
  mvp_roadmap: Array<{
    phase: string;
    duration: string;
    tasks: string[];
  }>;
  business_model: {
    description: string;
    tiers: string[];
  };
  risk_analysis: Array<{
    risk: string;
    mitigation: string;
  }>;
  gtm_strategy: {
    channels: string[];
    timeline: string;
  };
  investor_pitch: {
    hook: string;
    slides_outline: string[];
  };
  development_timeline: Array<{
    milestone: string;
    week: string;
  }>;
}

export interface GenesisReport {
  session_id: string;
  created_at: string;
  input_summary: string;
  scores: ReportScores;
  sections: ReportSections;
  debate_transcript: DebateMessage[];
  agent_execution_times: Record<string, number>;
  total_elapsed_ms: number;
}

export interface SessionState {
  session_id: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  chief_brief: ChiefBrief | null;
  agents: Record<AgentKey, AgentProgress>;
  debate: DebateMessage[];
  report: GenesisReport | null;
  created_at: string | null;
}
