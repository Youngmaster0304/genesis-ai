import os
import time
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

# Load env variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")

class CerebrasClient:
    def __init__(self):
        self.api_key = CEREBRAS_API_KEY
        if not self.api_key:
            print("WARNING: CEREBRAS_API_KEY is not set. Using mock responses.")
            self.client = None
        else:
            self.client = OpenAI(
                base_url="https://api.cerebras.ai/v1",
                api_key=self.api_key
            )
            
    def call_agent_model(self, prompt: str, system_prompt: str, schema_class=None, 
                         model: str = "gemma-4-31b", max_tokens: int = 4096) -> dict:
        """
        Calls Cerebras API exclusively on gemma-4-31b (100 req/min, 100K tokens/min).
        Retries on 429 rate-limit with exponential backoff.
        Falls back to mock only if all retries are exhausted.
        """
        if not self.client:
            return self._mock_fallback(schema_class, prompt)
        
        # Always use gemma-4-31b — it has by far the best quota (100 req/min, 100K tokens/min).
        # gpt-oss-120b and zai-glm-4.7 are only 5 req/min — unsafe for parallel agent calls.
        target_model = "gemma-4-31b"
        
        max_retries = 3
        backoff = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                start_time = time.time()
                response = self.client.chat.completions.create(
                    model=target_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.4,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"}
                )
                elapsed_time = time.time() - start_time
                content = response.choices[0].message.content
                
                # Use actual completion tokens if available, else estimate
                try:
                    completion_tokens = response.usage.completion_tokens
                except Exception:
                    completion_tokens = int(len(content.split()) * 1.3)
                    
                tokens_per_sec = int(completion_tokens / max(elapsed_time, 0.01))
                
                parsed_json = self._clean_and_parse_json(content)
                parsed_json["_metrics"] = {
                    "elapsed_time": round(elapsed_time, 2),
                    "tokens_per_sec": tokens_per_sec,
                    "completion_tokens": completion_tokens,
                    "model_used": target_model,
                    "attempt": attempt + 1
                }
                return parsed_json
                
            except Exception as e:
                error_str = str(e)
                is_rate_limit = "429" in error_str or "rate_limit" in error_str.lower() or "too many" in error_str.lower()
                
                if is_rate_limit and attempt < max_retries - 1:
                    wait = backoff * (2 ** attempt)  # 2s, 4s, 8s
                    print(f"[gemma-4-31b] Rate limit hit (attempt {attempt+1}/{max_retries}). Waiting {wait}s before retry...")
                    time.sleep(wait)
                    continue
                else:
                    print(f"[gemma-4-31b] Error on attempt {attempt+1}: {e}")
                    if attempt == max_retries - 1:
                        print("All retries exhausted. Using mock fallback.")
                        return self._mock_fallback(schema_class, prompt)
        
        return self._mock_fallback(schema_class, prompt)

    def _clean_and_parse_json(self, content: str) -> dict:
        content_clean = content.strip()

        # Step 1: Strip markdown code fences if present
        if "```json" in content_clean:
            match = re.search(r"```json\s*(.*?)\s*```", content_clean, re.DOTALL)
            if match:
                content_clean = match.group(1).strip()
        elif "```" in content_clean:
            match = re.search(r"```\s*(.*?)\s*```", content_clean, re.DOTALL)
            if match:
                content_clean = match.group(1).strip()

        # Step 2: Try direct parse first (fast path)
        try:
            return json.loads(content_clean)
        except Exception:
            pass

        # Step 3: Find the outermost JSON object boundaries
        start_idx = content_clean.find('{')
        if start_idx == -1:
            print("No JSON object found in response. Returning error.")
            return {"error": "No JSON found in model response", "raw_content": content_clean[:500]}

        # Step 4: Try from first { to last } (handles trailing text after JSON)
        end_idx = content_clean.rfind('}')
        if end_idx != -1 and end_idx > start_idx:
            try:
                return json.loads(content_clean[start_idx:end_idx + 1])
            except Exception:
                pass

        # Step 5: Model truncated the JSON mid-way — walk backwards to find
        # the deepest valid closing brace that produces parseable JSON
        print(f"JSON appears truncated (length={len(content_clean)}). Attempting repair...")
        candidate = content_clean[start_idx:]
        
        # Try progressively shorter substrings ending at each '}'
        brace_positions = [i for i, c in enumerate(candidate) if c == '}']
        for pos in reversed(brace_positions):
            try:
                result = json.loads(candidate[:pos + 1])
                print(f"Repaired truncated JSON at position {pos}")
                result["_truncated"] = True
                return result
            except Exception:
                continue

        # Step 6: Last resort — try to auto-close the JSON
        print("Attempting to auto-close truncated JSON...")
        try:
            # Count unclosed braces and brackets and close them
            stack = []
            in_string = False
            escape = False
            for char in candidate:
                if escape:
                    escape = False
                    continue
                if char == '\\' and in_string:
                    escape = True
                    continue
                if char == '"' and not escape:
                    in_string = not in_string
                    continue
                if not in_string:
                    if char in '{[':
                        stack.append('}' if char == '{' else ']')
                    elif char in '}]':
                        if stack and stack[-1] == char:
                            stack.pop()

            # Append the missing closing chars in reverse
            closing = ''.join(reversed(stack))
            repaired = candidate.rstrip().rstrip(',') + closing
            result = json.loads(repaired)
            result["_auto_closed"] = True
            print(f"Auto-closed JSON successfully, added: {closing!r}")
            return result
        except Exception as e:
            print(f"All JSON recovery attempts failed: {e}")
            return {"error": "Failed to parse model response", "raw_content": content_clean[:500]}

    def _mock_fallback(self, schema_class, prompt: str) -> dict:
        """Generates standard mocked JSON responses if Cerebras is unavailable or fails."""
        # Simple local generation just to keep system working
        name = schema_class.__name__ if schema_class else "Default"
        time.sleep(0.5) # Simulate slight latency
        
        metrics = {
            "elapsed_time": 0.5,
            "tokens_per_sec": 450,
            "model_used": "gemma4-31b-mocked"
        }
        
        # We will dynamically return schema-matching structures depending on class
        if name == "ChiefScientistBrief":
            return {
                "hypothesis": "AI-driven real-time logistics supply chain optimizer using multimodal sensors and news signals.",
                "domain": "Logistics & AI",
                "brief": f"Analyze the following idea: {prompt}",
                "critical_questions": {
                    "research": ["What are current news signal analysis standard rates?", "How are satellite imaging datasets accessed?", "What models process multimodal spatial temporal data?"],
                    "patent": ["Are there existing patents for 72hr prediction using satellite data?", "What are the core novelty boundaries?", "What is the freedom-to-operate risk?"],
                    "market": ["What is the TAM for real-time logistics analytics?", "Who are the key players in supply chain predictive analytics?", "What trends are accelerating adoption?"],
                    "innovation": ["How does a 72-hour prediction window differentiate this solution?", "What is the unique value proposition compared to traditional solutions?", "What are the barriers to entry?"],
                    "technical": ["What is the recommended technology stack?", "How should the pipeline architecture handle real-time streaming?", "What are the feasibility scores?"],
                    "business": ["What are the SaaS pricing tiers?", "What is the GTM strategy?", "What are the revenue projections?"]
                },
                "_metrics": metrics
            }
        elif name == "ResearchOutput":
            return {
                "findings": ["News signal integration improves early warning by 30%.", "Satellite imagery provides structural context for supply hubs.", "Multi-modal temporal networks excel in graph representations."],
                "sources": ["arXiv:2401.12903", "NeurIPS 2024 Supply Chain Workshop", "Journal of Operations Research"],
                "summary": "Academic research supports using spatial-temporal models with news signals for supply-chain prediction.",
                "_metrics": metrics
            }
        elif name == "PatentOutput":
            return {
                "existing_patents": ["US20210342981A1: Predictive supply chain modeling", "US10893012B2: Satellite based cargo flow monitoring"],
                "novelty_gaps": ["Combining satellite imagery AND NLP news signals in a single transformer architecture for 72-hour windows is novel."],
                "risk_level": "Medium - Requires careful claim wording around news signal synthesis.",
                "_metrics": metrics
            }
        elif name == "MarketOutput":
            return {
                "market_size": "TAM: $12.4B, CAGR: 18.2%",
                "competitors": ["Project44", "FourKites", "Resilinc"],
                "trends": ["Shift to proactive/predictive routing", "Increased global geo-political volatility", "ESG compliance tracking"],
                "_metrics": metrics
            }
        elif name == "InnovationOutput":
            return {
                "novelty_score": 92,
                "differentiation": ["72-hour advance prediction vs 24-hour industry standard", "Satellite + News multimodal sensor fusion model"],
                "risks": ["Data availability in remote regions", "High model training/inference costs"],
                "_metrics": metrics
            }
        elif name == "TechnicalOutput":
            return {
                "architecture": "Multimodal Temporal Graph Neural Network (GNN) + LLM NLP Pipeline",
                "tech_stack": ["FastAPI", "PyTorch", "HuggingFace Transformers", "PostgreSQL", "Apache Kafka"],
                "feasibility_score": 88,
                "_metrics": metrics
            }
        elif name == "BusinessOutput":
            return {
                "business_model": "B2B Enterprise SaaS. Tiered pricing based on volume of tracked assets and prediction nodes.",
                "gtm_strategy": "Direct sales targeting Fortune 500 logistics directors, partnership with ocean/air freight carriers.",
                "revenue_projections": "Year 1 ARR: $1.2M, Year 2: $4.5M, Year 3: $14M",
                "_metrics": metrics
            }
        else:
            # Chief Scientist synthesis mock fallback
            return {
                "scores": {
                    "innovation": 94,
                    "market_opportunity": 91,
                    "technical_feasibility": 96,
                    "business_viability": 89,
                    "patent_novelty": 92,
                    "overall": 93
                },
                "sections": {
                    "executive_summary": "Genesis AI presents a highly feasible 72-hour predictive supply chain disruption management suite. By combining multimodal news signals with satellite spatial imagery, the platform constructs real-time hazard mapping overlays that bypass traditional reactive ERP solutions. Specialist agent reviews indicate key novelty boundaries in spatial-NLP sensor fusion, backed by strong unit economics and a multi-tier SaaS model targeting enterprise logistics operators.",
                    "research_findings": {
                        "summary": "Academic literature highlights a 30% reduction in forecasting latency when real-time news alerts are integrated into temporal routing pipelines.",
                        "findings": ["News signal parsing improves routing adjustments by 2.5x.", "Temporal Graph Neural Networks provide robust topology descriptions under dynamic stress."],
                        "sources": ["arXiv:2401.12903", "NeurIPS 2024 Supply Chain Workshop"]
                    },
                    "market_analysis": {
                        "market_size": "TAM: $12.4B, SAM: $3.2B, SOM: $850M (CAGR: 18.2%)",
                        "trends": ["Shift to proactive risk mitigation.", "Increased geo-political disruptions in maritime lanes.", "Adoption of spatial intelligence systems."]
                    },
                    "competitor_analysis": [
                        {"name": "Project44", "strength": "Large asset tracking database", "weakness": "Strictly reactive, lacks predictive mitigation"},
                        {"name": "Resilinc", "strength": "Supply mapping network", "weakness": "Manual news sourcing, no real-time spatial fusion"}
                    ],
                    "patent_landscape": {
                        "status": "Patent landscape presents clean boundaries. Traditional disclosures cover logistics routing or spatial imagery in isolation, leaving fusion claims open.",
                        "existing_patents": ["US20210342981A1: Predictive supply chain modeling", "US10893012B2: Satellite cargo monitoring"]
                    },
                    "novelty_score_breakdown": {
                        "breakdown": "High novelty (92/100) established on the parallel execution of NLP news feed vectors combined with spatial telemetry neural graphs.",
                        "gaps": ["Absence of news-satellite tensor mapping in commercial platforms.", "72-hour proactive notification window limits competitor replication."]
                    },
                    "technical_architecture": {
                        "architecture_summary": "B2B client nodes push pipeline uploads (whiteboards, descriptions) to FastAPI. FastAPI parallelizes agent inference utilizing Cerebras AI hardware. Outputs merge in the synthesis layer.",
                        "diagram_svg_raw": '<svg viewBox="0 0 600 320" class="w-full h-auto" fill="none"><rect width="600" height="320" fill="rgba(15,20,33,0.3)" /><rect x="20" y="130" width="100" height="50" rx="6" fill="#0F1421" stroke="#6366F1" strokeWidth="1.5" /><text x="70" y="160" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Next.js App</text><rect x="180" y="130" width="100" height="50" rx="6" fill="#0F1421" stroke="#8B5CF6" strokeWidth="1.5" /><text x="230" y="160" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">FastAPI</text><rect x="340" y="40" width="100" height="230" rx="8" fill="#161D2F" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" /><text x="390" y="60" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Agents</text><rect x="350" y="80" width="80" height="24" rx="4" fill="#080B14" stroke="#A78BFA" strokeWidth="1" /><text x="390" y="95" fill="#A78BFA" fontSize="8" textAnchor="middle">📚 Research</text><rect x="350" y="115" width="80" height="24" rx="4" fill="#080B14" stroke="#A78BFA" strokeWidth="1" /><text x="390" y="130" fill="#A78BFA" fontSize="8" textAnchor="middle">📜 Patent</text><rect x="350" y="150" width="80" height="24" rx="4" fill="#080B14" stroke="#A78BFA" strokeWidth="1" /><text x="390" y="165" fill="#A78BFA" fontSize="8" textAnchor="middle">📈 Market</text><rect x="490" y="130" width="100" height="50" rx="6" fill="#0F1421" stroke="#EC4899" strokeWidth="1.5" /><text x="540" y="155" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Cerebras</text><path d="M 120 155 L 180 155" stroke="#6366F1" strokeWidth="1.5" /><path d="M 280 155 L 340 155" stroke="#8B5CF6" strokeWidth="1.5" /><path d="M 440 155 L 490 155" stroke="#EC4899" strokeWidth="1.5" /></svg>'
                    },
                    "technology_stack": [
                        {"name": "Next.js 14", "role": "Frontend client & dashboard layout"},
                        {"name": "FastAPI", "role": "Backend endpoints & SSE streaming"},
                        {"name": "Zustand", "role": "Global state management store"},
                        {"name": "PyTorch", "role": "Spatial-Temporal neural network processing"},
                        {"name": "Cerebras API", "role": "High-speed Gemma 4 inference cluster"}
                    ],
                    "mvp_roadmap": [
                        {"phase": "Phase 1: Architecture Validation", "duration": "Month 1", "tasks": ["Integrate satellite feeds", "Setup GNN benchmarks"]},
                        {"phase": "Phase 2: Agent Customization", "duration": "Month 2-3", "tasks": ["Train local news NLP summarizers", "Optimize inference pipelines"]}
                    ],
                    "business_model": {
                        "description": "Premium B2B Enterprise SaaS. Ingests data packages and bills based on tracked nodes.",
                        "tiers": ["Starter Tier: $2.5k/mo (up to 50 nodes)", "Enterprise Tier: Custom pricing (unlimited tracking)"]
                    },
                    "risk_analysis": [
                        {"risk": "Feed latency issues in ocean choke points", "mitigation": "Bypass with historical corridor trends database"},
                        {"risk": "High computation/inference overheads", "mitigation": "Offload routine agent tasks using Cerebras cached hardware"}
                    ],
                    "gtm_strategy": {
                        "channels": ["Direct sales to Fortune 500 supply chain directors", "Partnerships with marine cargo carriers"],
                        "timeline": "Commercial launch target within 6 months post MVP validation."
                    },
                    "investor_pitch": {
                        "hook": "Predicting global supply disruptions 72 hours early, saving millions in logistics overhead.",
                        "slides_outline": ["Problem: Cargo bottlenecks cost $40B annually", "Solution: News-Satellite fused AI forecasting", "Technology: Cerebras-powered agent orchestrator"]
                    },
                    "development_timeline": [
                        {"milestone": "Telemetry Ingestion System", "week": "Week 2"},
                        {"milestone": "FastAPI Multi-Agent Pipeline", "week": "Week 4"},
                        {"milestone": "Beta Client Dashboard Integration", "week": "Week 8"}
                    ]
                },
                "_metrics": metrics
            }

cerebras_client = CerebrasClient()
