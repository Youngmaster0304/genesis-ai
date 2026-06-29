from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ChiefScientistBrief(BaseModel):
    hypothesis: str = Field(description="3-5 sentence innovation hypothesis covering the core value proposition, target user, and mechanism")
    domain: str = Field(description="Primary domain and specific sub-domain")
    brief: str = Field(description="Comprehensive 5-8 sentence brief for all agents covering the idea, context, competitive landscape hint, and what success looks like")
    critical_questions: Dict[str, List[str]] = Field(description="5 critical research questions per agent specialty area")

class ResearchOutput(BaseModel):
    findings: List[str] = Field(description="Minimum 6 detailed academic/industry findings each 2-3 sentences long with specific data points, statistics, or study results")
    sources: List[str] = Field(description="Minimum 6 credible sources: arXiv papers, journals, industry reports, conference proceedings with year and citation style")
    summary: str = Field(description="A comprehensive 4-6 sentence paragraph synthesizing the research landscape, key trends, and how they validate or challenge the idea")
    technology_readiness: str = Field(description="Assessment of TRL (Technology Readiness Level) 1-9 with justification for this idea's core technologies")
    key_researchers: List[str] = Field(description="3-5 leading researchers or organizations at the frontier of this domain")
    open_problems: List[str] = Field(description="3-5 unsolved problems in the literature that this idea could address")

class PatentOutput(BaseModel):
    existing_patents: List[str] = Field(description="Minimum 5 real or realistic patent numbers with titles, assignees, and brief description of what they cover")
    novelty_gaps: List[str] = Field(description="Minimum 4 specific white-space gaps in the patent landscape that this idea could claim, each explained in 2 sentences")
    risk_level: str = Field(description="Detailed risk assessment: Low/Medium/High with 3-4 sentence explanation of freedom-to-operate risks and mitigation strategies")
    claim_strategy: str = Field(description="3-4 sentence recommended patent claim strategy: what to file, what type of claims, provisional vs full, jurisdictions to target")
    prior_art_summary: str = Field(description="3-4 sentence summary of most relevant prior art and how this idea differentiates from it")
    ip_moat_rating: str = Field(description="Assessment of the potential IP moat strength: Weak/Moderate/Strong with detailed rationale")

class MarketOutput(BaseModel):
    market_size: str = Field(description="Detailed TAM/SAM/SOM breakdown with specific dollar figures, CAGR, and methodology for how these numbers were derived")
    competitors: List[str] = Field(description="Minimum 6 real competitors with company name, funding stage, key differentiator, and their core weakness in 1-2 sentences each")
    trends: List[str] = Field(description="Minimum 5 macro and micro market trends driving adoption, each explained in 2 sentences with supporting data or examples")
    customer_segments: List[str] = Field(description="3-5 specific customer personas with job title, pain point, and willingness-to-pay estimate")
    market_timing: str = Field(description="2-3 sentence analysis of why now is the right time to enter this market — tailwinds, regulatory changes, technology inflection points")
    geographic_focus: str = Field(description="Recommended geographic go-to-market sequencing with rationale for each market priority")

class InnovationOutput(BaseModel):
    novelty_score: int = Field(description="0-100 novelty score")
    differentiation: List[str] = Field(description="Minimum 5 specific, concrete differentiation points vs the current state of the art, each 2-3 sentences with measurable claims")
    risks: List[str] = Field(description="Minimum 5 innovation risks: technical, adoption, timing, regulatory — each with a specific mitigation strategy in 2 sentences")
    breakthrough_potential: str = Field(description="Assessment of whether this is incremental/disruptive/transformative innovation with 3-4 sentence justification")
    analogous_innovations: List[str] = Field(description="3-5 analogous historical innovations that followed a similar pattern, with lessons learned for this idea")
    unfair_advantages: List[str] = Field(description="3-5 potential unfair advantages this venture could build: network effects, data moats, regulatory licenses, etc.")

class TechnicalOutput(BaseModel):
    architecture: str = Field(description="Comprehensive 5-7 sentence description of the full system architecture including data flow, core processing pipeline, and integration points")
    tech_stack: List[str] = Field(description="Minimum 8 specific technologies with version recommendations, justification for selection, and their role in the system")
    feasibility_score: int = Field(description="0-100 technical feasibility score")
    build_vs_buy: List[str] = Field(description="4-6 key build vs buy decisions with recommendation and rationale for each")
    scalability_plan: str = Field(description="3-4 sentence plan for how the architecture scales from MVP to 10x and 100x load")
    technical_risks: List[str] = Field(description="4-6 specific technical risks with probability, impact, and mitigation plan for each")
    mvp_technical_scope: str = Field(description="Clear 3-4 sentence definition of the minimum viable technical implementation — what to build first and why")

class BusinessOutput(BaseModel):
    business_model: str = Field(description="Comprehensive 5-7 sentence description of the full business model: value chain, revenue mechanism, unit economics, and monetization strategy")
    gtm_strategy: str = Field(description="Detailed 5-7 sentence go-to-market strategy: beachhead market, sales motion, marketing channels, partnership strategy, and first 100 customer plan")
    revenue_projections: str = Field(description="Detailed Year 1/2/3 revenue projections with assumptions: ARR, ACV, churn rate, growth rate, and path to profitability")
    pricing_model: List[str] = Field(description="3-5 pricing tiers with names, price points, included features, and target customer segment for each tier")
    unit_economics: str = Field(description="Key unit economics: CAC, LTV, LTV:CAC ratio, gross margin, payback period — with specific numbers and assumptions")
    fundraising_strategy: str = Field(description="3-4 sentence fundraising roadmap: seed/Series A milestones, target investors, use of funds, and valuation justification")

class DebateMessage(BaseModel):
    agent: str
    message: str

class ReportScores(BaseModel):
    innovation: int
    market_opportunity: int
    technical_feasibility: int
    business_viability: int
    patent_novelty: int
    overall: int

class ReportSections(BaseModel):
    executive_summary: str
    research_findings: Dict[str, Any]
    market_analysis: Dict[str, Any]
    competitor_analysis: List[Dict[str, Any]]
    patent_landscape: Dict[str, Any]
    novelty_score_breakdown: Dict[str, Any]
    technical_architecture: Dict[str, Any]
    technology_stack: List[Dict[str, Any]]
    mvp_roadmap: List[Dict[str, Any]]
    business_model: Dict[str, Any]
    risk_analysis: List[Dict[str, Any]]
    gtm_strategy: Dict[str, Any]
    investor_pitch: Dict[str, Any]
    development_timeline: List[Dict[str, Any]]

class GenesisReport(BaseModel):
    session_id: str
    created_at: str
    input_summary: str
    scores: ReportScores
    sections: ReportSections
    debate_transcript: List[DebateMessage]
    agent_execution_times: Dict[str, float]
    total_elapsed_ms: float
