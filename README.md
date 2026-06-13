# LifeOps — AI Personal Chief of Staff

LifeOps is an intelligent agent that connects every app in your life, understands your patterns across all domains simultaneously, and takes real action on your behalf. It ingests data from 12+ sources — banking, fitness, calendar, email, tasks, GitHub, social, and more — and provides a unified AI interface for understanding and improving your life.

Demo Video: https://youtu.be/8EGDvS--9f8?is=45pn4Besoz0upHay

## Architecture

```
Frontend (React 18 + Vite + Tailwind)
       │
  HTTP API
       │
Backend (FastAPI)
       │
Orchestrator Agent
  ├── Query Planner     — classifies intent & domains
  ├── Context Assembler — fetches data from MongoDB, memories, trends
  ├── Brief Agent       — generates morning brief
  ├── Pattern Agent     — detects behavioral patterns & anomalies
  └── Action Agent      — generates structured recommendations
       │
  Service Layer
  ├── LLM Service       — Groq (primary) / Gemini (fallback)
  ├── Memory Service    — persistent user memories
  ├── Search Service    — Elasticsearch cross-domain search
  ├── Analytics Service — BigQuery weekly trends
  ├── Action Service    — decision tracking & feedback loop
  └── Safety Service    — hallucination guard & content safety
       │
  Data Layer
  ├── MongoDB           — primary user data store
  ├── Elasticsearch     — vector search for memories
  └── BigQuery          — analytics & trends
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python FastAPI, Motor (async MongoDB) |
| Database | MongoDB |
| Search | Elasticsearch |
| Analytics | Google BigQuery |
| LLM | Groq (llama-3.3-70b-versatile) / Gemini 2.0 Flash |
| Auth | JWT (HS256) + Google OAuth |
| Integrations | Plaid, Fitbit, Google Fit, Google Calendar, Gmail, Todoist, GitHub, Strava, Spotify, DoorDash, Uber, Netflix, Amazon |
| Tracing | Arize Phoenix |

## Data Domains

- **Finance** — Plaid transactions, spending categorization, budget tracking
- **Health & Fitness** — Fitbit/Google Fit (steps, sleep, HR), Strava activities
- **Calendar** — Google Calendar events & scheduling
- **Email** — Gmail message analysis
- **Tasks & Work** — Todoist tasks, GitHub events (PRs, commits, issues)
- **Social** — Relationship tracking with contact frequency & interaction history
- **Entertainment** — Spotify listening, Netflix viewing
- **Food & Transport** — DoorDash orders, Uber trips

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Elasticsearch 8.x
- Groq API key (or Gemini API key as fallback)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
cp .env.example .env     # configure your keys
python seed_demo.py      # seed demo data
uvicorn app.main:app --reload --port 8080
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and sign in with `demo@lifeops.dev` / `lifeops123`.

## Seed Data

Run `python seed_demo.py` to populate MongoDB with realistic demo data across all domains. Run `python seed_actions.py` to seed sample decisions and recommendations for the Actions page.

## License

MIT
