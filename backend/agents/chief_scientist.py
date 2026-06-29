from services.cerebras_client import cerebras_client
from models.schemas import ChiefScientistBrief, ReportScores, ReportSections, GenesisReport
import time
import json

CHIEF_DISPATCH_PROMPT = """You are the Chief Scientist of Genesis AI, a multi-agent R&D platform.
A client has submitted the following idea for evaluation:

INPUT: {raw_input}
UPLOADED FILES: {file_descriptions}

Your job:
1. Extract the core innovation hypothesis in 3-4 sentences.
2. Identify the primary domain and sub-domain.
3. Write a precise brief for 6 specialist agents.
4. List 5 critical questions each agent must answer.

Output MUST be a valid JSON object matching this structure:
{{
  "hypothesis": "3-4 sentence innovation hypothesis covering what, for whom, why novel, and why now",
  "domain": "Primary domain > Sub-domain > Vertical",
  "brief": "6-8 sentence comprehensive brief for all agents covering context, competitive landscape, target customer, and success metrics",
  "critical_questions": {{
    "research": ["q1 about core technology papers", "q2 about TRL", "q3 about analogous innovations", "q4 about open problems", "q5 about benchmarks"],
    "patent": ["q1 about FTO risk", "q2 about blocking patents", "q3 about whitespace", "q4 about key patent holders", "q5 about claim strategy"],
    "market": ["q1 about TAM/SAM/SOM", "q2 about named competitors", "q3 about timing factors", "q4 about underserved segments", "q5 about geo entry"],
    "innovation": ["q1 about quantitative differentiation", "q2 about biggest risk", "q3 about breakthrough classification", "q4 about unfair advantages", "q5 about historical analogy"],
    "technical": ["q1 about tech stack", "q2 about hardest technical challenge", "q3 about 90-day MVP scope", "q4 about scalability", "q5 about build vs buy"],
    "business": ["q1 about pricing tiers", "q2 about revenue projections", "q3 about first 100 customers", "q4 about LTV:CAC", "q5 about fundraising roadmap"]
  }}
}}
No preamble. No markdown. Just the raw JSON object.
"""

# Split synthesis into 2 smaller prompts to avoid truncation
CHIEF_SYNTHESIS_PART1 = """You are the Chief Scientist of Genesis AI synthesizing agent findings into a professional R&D report.

AGENT FINDINGS:
Research: {research_output}
Patent: {patent_output}
Market: {market_output}
Innovation: {innovation_output}
Technical: {technical_output}
Business: {business_output}

Produce PART 1 of the final report JSON. Be specific with real company names, numbers, and data.

Return this exact JSON structure (no extra text):
{{
  "scores": {{
    "innovation": <integer 0-100>,
    "market_opportunity": <integer 0-100>,
    "technical_feasibility": <integer 0-100>,
    "business_viability": <integer 0-100>,
    "patent_novelty": <integer 0-100>,
    "overall": <integer 0-100>
  }},
  "sections": {{
    "executive_summary": "<Write 3-4 substantive paragraphs: (1) what the idea is and its core value prop with numbers, (2) technology approach and why it works, (3) market size TAM/SAM/SOM and competition, (4) path forward and investment case>",
    "research_findings": {{
      "summary": "<2-3 sentences synthesizing how research validates this idea>",
      "findings": ["<specific finding with paper/study reference>", "<finding 2>", "<finding 3>", "<finding 4>", "<finding 5>"],
      "sources": ["<Paper title, authors, year>", "<source 2>", "<source 3>", "<source 4>", "<source 5>"],
      "technology_readiness": "<TRL 1-9 assessment with justification>",
      "key_researchers": ["<Researcher/org 1>", "<researcher 2>", "<researcher 3>"],
      "open_problems": ["<problem this idea addresses 1>", "<problem 2>", "<problem 3>"]
    }},
    "market_analysis": {{
      "market_size": "<TAM: $XB, SAM: $XM, SOM: $XM — CAGR X% by year>",
      "trends": ["<trend 1 with data>", "<trend 2>", "<trend 3>", "<trend 4>", "<trend 5>"],
      "customer_segments": ["<segment 1: persona + pain + WTP>", "<segment 2>", "<segment 3>"],
      "market_timing": "<why now — specific tailwinds, regulatory changes, inflection points>",
      "geographic_focus": "<recommended market entry sequence with rationale>"
    }},
    "competitor_analysis": [
      {{"name": "<real company>", "type": "Direct", "funding": "<$XM Series X>", "strength": "<specific strength>", "weakness": "<specific exploitable weakness>", "positioning": "<market position>"}},
      {{"name": "<real company 2>", "type": "Indirect", "funding": "<funding>", "strength": "<strength>", "weakness": "<weakness>", "positioning": "<position>"}},
      {{"name": "<real company 3>", "type": "Direct", "funding": "<funding>", "strength": "<strength>", "weakness": "<weakness>", "positioning": "<position>"}},
      {{"name": "<real company 4>", "type": "Emerging", "funding": "<funding>", "strength": "<strength>", "weakness": "<weakness>", "positioning": "<position>"}},
      {{"name": "<real company 5>", "type": "Indirect", "funding": "<funding>", "strength": "<strength>", "weakness": "<weakness>", "positioning": "<position>"}}
    ],
    "patent_landscape": {{
      "status": "<3-4 sentence FTO assessment with specific risk areas>",
      "existing_patents": ["<US/EP patent number: title, assignee>", "<patent 2>", "<patent 3>", "<patent 4>"],
      "claim_strategy": "<recommended filing approach: provisional, jurisdictions, claim types>",
      "ip_moat_rating": "<Weak/Moderate/Strong with rationale>",
      "novelty_gaps": ["<claimable white-space 1>", "<gap 2>", "<gap 3>", "<gap 4>"]
    }},
    "novelty_score_breakdown": {{
      "score": <same as scores.innovation>,
      "breakdown": "<3-4 sentence explanation of score with specific comparisons>",
      "gaps": ["<novel claim 1>", "<novel claim 2>", "<novel claim 3>", "<novel claim 4>"],
      "breakthrough_classification": "<Incremental/Disruptive/Transformative with justification>",
      "analogous_innovations": ["<historical analogy with lesson>", "<analogy 2>", "<analogy 3>"]
    }},
    "technical_architecture": {{
      "architecture_summary": "<5-6 sentence description of full system: data ingestion, processing, ML/AI core, storage, API, client layers>",
      "diagram_nodes": ["<component 1>", "<component 2>", "<component 3>", "<component 4>", "<component 5>", "<component 6>"],
      "diagram_edges": [["<from>", "<to>", "<label>"], ["<from>", "<to>", "<label>"], ["<from>", "<to>", "<label>"]],
      "scalability_plan": "<how it scales from MVP to 10x and 100x>",
      "mvp_technical_scope": "<what exactly to build in first 90 days>"
    }},
    "technology_stack": [
      {{"name": "<Technology + version>", "category": "<Frontend/Backend/ML/Infra/DB>", "role": "<specific role and why chosen>"}},
      {{"name": "<tech 2>", "category": "<category>", "role": "<role>"}},
      {{"name": "<tech 3>", "category": "<category>", "role": "<role>"}},
      {{"name": "<tech 4>", "category": "<category>", "role": "<role>"}},
      {{"name": "<tech 5>", "category": "<category>", "role": "<role>"}},
      {{"name": "<tech 6>", "category": "<category>", "role": "<role>"}},
      {{"name": "<tech 7>", "category": "<category>", "role": "<role>"}},
      {{"name": "<tech 8>", "category": "<category>", "role": "<role>"}}
    ]
  }}
}}"""

CHIEF_SYNTHESIS_PART2 = """You are the Chief Scientist of Genesis AI completing the second half of a synthesis report.

CONTEXT — Agent findings summary:
Market size: {market_size}
Business model: {business_model}
Technical approach: {technical_approach}
Innovation score: {innovation_score}
Domain: {domain}

Produce PART 2 of the final report JSON covering business, risks, GTM, pitch, roadmap, and timeline.
Be specific: use real numbers, real company names, realistic timelines.

Return this exact JSON structure (no extra text):
{{
  "mvp_roadmap": [
    {{"phase": "Phase 1: Foundation", "duration": "Weeks 1-6", "goal": "<specific goal>", "tasks": ["<task 1>", "<task 2>", "<task 3>", "<task 4>"], "success_metric": "<measurable milestone>"}},
    {{"phase": "Phase 2: Core Product", "duration": "Weeks 7-14", "goal": "<specific goal>", "tasks": ["<task 1>", "<task 2>", "<task 3>", "<task 4>"], "success_metric": "<measurable milestone>"}},
    {{"phase": "Phase 3: Beta Launch", "duration": "Weeks 15-20", "goal": "<specific goal>", "tasks": ["<task 1>", "<task 2>", "<task 3>", "<task 4>"], "success_metric": "<measurable milestone>"}},
    {{"phase": "Phase 4: Scale", "duration": "Weeks 21-30", "goal": "<specific goal>", "tasks": ["<task 1>", "<task 2>", "<task 3>", "<task 4>"], "success_metric": "<measurable milestone>"}}
  ],
  "business_model": {{
    "description": "<4-5 sentences on full business model: value chain, revenue mechanism, unit economics>",
    "tiers": ["<Tier 1 name: $X/mo — features — target segment>", "<Tier 2: $X/mo — features>", "<Tier 3: Enterprise — custom pricing — features>"],
    "unit_economics": "CAC: $X, LTV: $X, LTV:CAC ratio: X:1, Gross Margin: X%, Payback: X months",
    "revenue_projections": "Year 1: $XM ARR (X customers × $X ACV), Year 2: $XM ARR, Year 3: $XM ARR"
  }},
  "risk_analysis": [
    {{"category": "Technical", "risk": "<specific technical risk>", "probability": "High", "impact": "High", "mitigation": "<specific mitigation strategy>"}},
    {{"category": "Market", "risk": "<specific market risk>", "probability": "Medium", "impact": "High", "mitigation": "<mitigation>"}},
    {{"category": "Regulatory", "risk": "<specific regulatory risk>", "probability": "Medium", "impact": "Medium", "mitigation": "<mitigation>"}},
    {{"category": "Financial", "risk": "<specific financial risk>", "probability": "Low", "impact": "High", "mitigation": "<mitigation>"}},
    {{"category": "Competitive", "risk": "<specific competitive risk>", "probability": "High", "impact": "Medium", "mitigation": "<mitigation>"}},
    {{"category": "Operational", "risk": "<specific operational risk>", "probability": "Low", "impact": "Medium", "mitigation": "<mitigation>"}}
  ],
  "gtm_strategy": {{
    "beachhead": "<specific beachhead market and why — 2 sentences>",
    "channels": ["<Channel 1: specific tactic + expected CAC>", "<Channel 2>", "<Channel 3>", "<Channel 4>"],
    "first_100_customers": "<specific plan for first 100 paying customers — outbound, events, partnerships>",
    "partnerships": ["<strategic partner 1 and value>", "<partner 2>", "<partner 3>"],
    "timeline": "<pre-launch / launch / scale phases with specific month milestones>"
  }},
  "investor_pitch": {{
    "hook": "<single powerful sentence: the why this, why now, why you>",
    "problem_statement": "<crisp 2-3 sentence problem with market pain quantified>",
    "solution_statement": "<2-3 sentence solution with key differentiator>",
    "traction_needed": "<what proof points make this investable at seed/Series A>",
    "slides_outline": [
      "Slide 1: Title — Company name, tagline, contact info",
      "Slide 2: Problem — The specific pain point with market data",
      "Slide 3: Solution — How it works with product screenshot/demo",
      "Slide 4: Market Size — TAM/SAM/SOM with bottom-up methodology",
      "Slide 5: Product Demo — Key features and user journey",
      "Slide 6: Business Model — Pricing tiers and revenue streams",
      "Slide 7: Traction — Current metrics, pilots, and early customers",
      "Slide 8: Competition — Positioning map and unfair advantages",
      "Slide 9: Technology & IP — Architecture and patent moat",
      "Slide 10: Team — Founders, advisors, and key hires",
      "Slide 11: Financials — 3-year projections with key assumptions",
      "Slide 12: The Ask — Funding amount, use of funds, next milestones"
    ]
  }},
  "development_timeline": [
    {{"milestone": "<specific deliverable>", "week": "Week 2", "description": "<what is built>", "dependencies": "<prerequisite>"}},
    {{"milestone": "<deliverable 2>", "week": "Week 4", "description": "<what>", "dependencies": "<prereq>"}},
    {{"milestone": "<deliverable 3>", "week": "Week 6", "description": "<what>", "dependencies": "<prereq>"}},
    {{"milestone": "<deliverable 4>", "week": "Week 8", "description": "<what>", "dependencies": "<prereq>"}},
    {{"milestone": "<deliverable 5>", "week": "Week 12", "description": "<what>", "dependencies": "<prereq>"}},
    {{"milestone": "<deliverable 6>", "week": "Week 16", "description": "<what>", "dependencies": "<prereq>"}},
    {{"milestone": "<deliverable 7>", "week": "Week 20", "description": "<what>", "dependencies": "<prereq>"}},
    {{"milestone": "<deliverable 8>", "week": "Week 26", "description": "<what>", "dependencies": "<prereq>"}}
  ]
}}"""


class ChiefScientistAgent:
    def __init__(self):
        self.name = "Chief Scientist"
        self.emoji = "🧑‍🔬"
        self.role = "Orchestrator + Synthesizer"

    def dispatch(self, raw_input: str, file_descriptions: str) -> dict:
        system_prompt = """You are the Chief Scientist of Genesis AI.
You are intellectually rigorous and produce only the highest quality analysis.
Reply ONLY in valid JSON. No markdown. No preamble. Just the raw JSON object."""

        prompt = CHIEF_DISPATCH_PROMPT.format(
            raw_input=raw_input,
            file_descriptions=file_descriptions if file_descriptions else "No files uploaded."
        )
        return cerebras_client.call_agent_model(
            prompt=prompt,
            system_prompt=system_prompt,
            schema_class=ChiefScientistBrief,
            model="gemma-4-31b",
            max_tokens=2048
        )

    def synthesize(self,
                   research: dict,
                   patent: dict,
                   market: dict,
                   innovation: dict,
                   technical: dict,
                   business: dict,
                   debate_transcript: list) -> dict:

        system_prompt = """You are the Chief Scientist of Genesis AI.
You synthesize specialist agent findings into world-class R&D reports read by top-tier VCs and technical boards.
Reply ONLY in valid JSON. No markdown. No preamble. Just the raw JSON object."""

        # ── Part 1: scores + first 7 sections ──────────────────────────────
        prompt1 = CHIEF_SYNTHESIS_PART1.format(
            research_output=json.dumps(research, indent=2)[:1500],
            patent_output=json.dumps(patent, indent=2)[:1000],
            market_output=json.dumps(market, indent=2)[:1500],
            innovation_output=json.dumps(innovation, indent=2)[:1000],
            technical_output=json.dumps(technical, indent=2)[:1500],
            business_output=json.dumps(business, indent=2)[:1000],
        )

        part1 = cerebras_client.call_agent_model(
            prompt=prompt1,
            system_prompt=system_prompt,
            schema_class=None,
            model="gemma-4-31b",
            max_tokens=6000
        )

        # ── Part 2: business model, roadmap, risks, GTM, pitch, timeline ──
        market_size = market.get("market_size", "Large addressable market")
        biz_model = business.get("business_model", "B2B SaaS")
        tech_approach = technical.get("architecture", "Modern cloud-native stack")
        inno_score = innovation.get("novelty_score", 85)
        domain = research.get("summary", "Technology innovation")[:200]

        prompt2 = CHIEF_SYNTHESIS_PART2.format(
            market_size=market_size,
            business_model=biz_model,
            technical_approach=str(tech_approach)[:300],
            innovation_score=inno_score,
            domain=domain
        )

        part2 = cerebras_client.call_agent_model(
            prompt=prompt2,
            system_prompt=system_prompt,
            schema_class=None,
            model="gemma-4-31b",
            max_tokens=5000
        )

        # ── Merge both parts into the final report ──────────────────────────
        merged_sections = part1.get("sections", {})
        merged_sections.update({
            "mvp_roadmap": part2.get("mvp_roadmap", []),
            "business_model": part2.get("business_model", {}),
            "risk_analysis": part2.get("risk_analysis", []),
            "gtm_strategy": part2.get("gtm_strategy", {}),
            "investor_pitch": part2.get("investor_pitch", {}),
            "development_timeline": part2.get("development_timeline", []),
        })

        return {
            "scores": part1.get("scores", {
                "innovation": innovation.get("novelty_score", 80),
                "market_opportunity": 78,
                "technical_feasibility": 82,
                "business_viability": 75,
                "patent_novelty": 77,
                "overall": 78
            }),
            "sections": merged_sections,
            "_metrics": part1.get("_metrics", {})
        }


chief_scientist = ChiefScientistAgent()
