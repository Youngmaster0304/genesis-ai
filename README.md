# Genesis AI 🧬
### *The Autonomous Innovation Organization*

> Transform any raw idea into a complete, validated R&D innovation package in seconds — powered by 6 parallel AI agents running on **Gemma 4 31B via Cerebras**.

---

## ✨ What It Does

Genesis AI is a **multi-agent AI platform** that acts as an entire R&D organization for your idea:

| Agent | Role |
|---|---|
| 🧑‍🔬 Chief Scientist | Orchestrates all agents, synthesizes final report |
| 📚 Research Agent | Academic literature, TRL assessment, domain benchmarks |
| 📜 Patent Intelligence | Freedom-to-operate, novelty gaps, IP moat rating |
| 📈 Market Intelligence | TAM/SAM/SOM, competitors, market timing |
| 💡 Innovation Evaluator | Novelty scoring, differentiation, breakthrough classification |
| 🏗️ Technical Architect | Full system architecture, tech stack, MVP scope |
| 💼 Business Strategist | Business model, GTM, financials, fundraising roadmap |

**Output:** A complete 13-section R&D report + downloadable 12-slide investor pitch deck (`.pptx`).

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + custom CSS variables
- **Framer Motion** — animations
- **Zustand** — state management
- **Lucide React** — icons

### Backend
- **Python FastAPI** — REST API + SSE streaming
- **Cerebras API** — Gemma 4 31B inference (ultra-fast)
- **python-pptx** — Professional PPTX generation
- **asyncio** — Parallel agent execution

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- A [Cerebras API key](https://cloud.cerebras.ai)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/genesis-ai.git
cd genesis-ai
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create your .env file
echo "CEREBRAS_API_KEY=your_key_here" > .env

# Start the server
python main.py
```
Backend runs at `http://127.0.0.1:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

---

## 📦 Project Structure

```
genesis-ai/
├── backend/
│   ├── agents/
│   │   ├── base.py              # Base agent with rich role prompts
│   │   ├── chief_scientist.py   # Orchestrator + synthesizer
│   │   ├── research.py
│   │   ├── patent.py
│   │   ├── market.py
│   │   ├── innovation.py
│   │   ├── technical.py
│   │   └── business.py
│   ├── services/
│   │   ├── cerebras_client.py   # Gemma 4 31B API client
│   │   ├── pptx_generator.py    # 12-slide PPTX builder
│   │   ├── sse_broadcaster.py   # Real-time SSE streaming
│   │   └── file_processor.py   # Multimodal file handling
│   ├── models/
│   │   └── schemas.py           # Pydantic output schemas
│   ├── main.py                  # FastAPI app + endpoints
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── page.tsx             # Landing page
    │   └── analyze/
    │       ├── page.tsx         # Analysis dashboard
    │       └── [sessionId]/report/page.tsx  # Report viewer
    ├── components/
    │   └── report/
    │       ├── ExportPanel.tsx  # PPTX / MD / JSON export
    │       ├── InnovationScores.tsx
    │       └── ArchitectureDiagram.tsx
    └── lib/
        ├── api.ts               # API client functions
        └── types.ts             # TypeScript interfaces
```

---

## 🔑 Environment Variables

Create `backend/.env`:
```env
CEREBRAS_API_KEY=csk-xxxxxxxxxxxxxxxxxxxx
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Start multi-agent analysis |
| `GET` | `/api/session/{id}/stream` | SSE live progress stream |
| `GET` | `/api/session/{id}/report` | Fetch final JSON report |
| `GET` | `/api/session/{id}/export/pptx` | Download 12-slide pitch deck |
| `GET` | `/api/session/{id}/export/md` | Export report as Markdown |
| `GET` | `/api/session/{id}/export/json` | Export report as JSON |

---

## 🎨 Features

- ⚡ **Ultra-fast inference** — Gemma 4 31B on Cerebras hardware
- 🔀 **True parallelism** — 6 agents run simultaneously via `asyncio.gather`
- 📡 **Live streaming** — Real-time agent progress via Server-Sent Events
- 🎯 **12-slide PPTX** — Professional dark-themed investor pitch deck
- 🧪 **Multi-modal input** — Upload PDFs, images, whiteboards alongside your idea
- 🛡️ **Resilient** — Exponential backoff retry on rate limits

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ using Genesis AI*
