# 🐾 Venture Forge — Multi-Agent Product Launch OS

<div align="center">

**AI-powered multi-agent system that analyzes product ideas and delivers data-driven GO / NO-GO launch decisions**

![Venture Forge](https://img.shields.io/badge/Venture_Forge-v2.0-6366f1?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.12+-10b981?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-f59e0b?style=for-the-badge)
![Agents](https://img.shields.io/badge/AI_Agents-9-8b5cf6?style=for-the-badge)

</div>

---

## ✨ What is Venture Forge?

Venture Forge is an intelligent product launch operating system powered by **9 specialized AI agents** that work in parallel and sequence across **4 analysis phases** to evaluate your product idea end-to-end:

| Phase | Agents | What They Do |
|-------|--------|--------------|
| **1 — Validation** | Market Analyzer, Customer Insight, Competitive Intel | TAM/SAM/SOM sizing, persona mapping, competitor SWOT |
| **2 — Financial** | Revenue Architect, Pricing Strategist, Risk Officer | Revenue projections, tiered pricing, risk matrix |
| **3 — GTM** | GTM Strategist, Product Roadmap Lead | Channel strategy, funnel metrics, feature prioritization |
| **4 — Decision** | Launch Director | Final GO / NO-GO with confidence score |

A **Master Orchestrator** synthesizes all agent outputs into an executive summary, and a **Self-Learning Loop** calibrates agent credibility scores across runs.

---

## 🎯 Key Features

- 🤖 **9 Specialized AI Agents** — parallel + sequential orchestration via `asyncio`
- 🧬 **Self-Learning Loop** — agents calibrate credibility via EMA after each simulation; scores persist across server restarts in `data/learning_log.json`
- 📈 **Live Financial Data** — real-time competitor financials via **yFinance** (market cap, revenue, P/E, stock history)
- 🔍 **Google Trends Integration** — search interest data feeds into market analysis
- 🧠 **Master Agent Chat** — conversational AI assistant with full simulation context
- ✅ **Input Validation** — required fields enforced with inline error feedback
- 📊 **Input Confidence Score** — client-side quality metric (0–100%) based on input completeness
- 🎨 **Premium Dark UI** — glassmorphism, gradient cards, Chart.js visualizations, tab-based dashboard
- 📉 **6+ Interactive Charts** — market size doughnut, revenue projections, risk bubble, competitor radar, stock price history, credibility trend line

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12, Flask, Flask-CORS |
| **AI/LLM** | Groq API — `llama-3.3-70b-versatile` |
| **Data APIs** | yFinance (financials), Google Trends (search interest) |
| **Frontend** | Vanilla JS, HTML5, CSS3, Chart.js, marked.js |
| **Package Mgr** | UV (recommended) or pip |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- [UV](https://docs.astral.sh/uv/) (recommended) or pip
- [Groq API key](https://console.groq.com/keys)

### Installation

```bash
# 1. Clone
git clone https://github.com/Krishhhhh05/Datadogs.git
cd Datadogs

# 2. Install UV (if you don't have it)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 3. Install dependencies
uv sync            # or: pip install -r requirements.txt

# 4. Set your API key
cp .env.example .env
# Edit .env → add your GROQ_API_KEY

# 5. Start the backend
uv run python backend/app.py

# 6. Open the frontend
open frontend/app.html    # macOS
# or just open frontend/app.html in any browser
```

The backend runs on **http://localhost:5001**.

---

## 📖 How to Use

1. **Fill in the form** — Product Description, Industry, Business Model, and Target Audience are **required** (marked with ★)
2. **Click "Analyze Product"** — watch 9 agents work through 4 phases with live progress indicators
3. **Explore the results** across **5 tabs**:
   - **Validation** — market analysis, customer personas, competitive landscape + yFinance data
   - **Financial** — revenue model, pricing tiers, risk assessment
   - **GTM Strategy** — go-to-market plan, feature roadmap
   - **Agents** — per-agent status, output keys, live financial data
   - **🧬 Learning** — credibility trend chart, score table, simulation history
4. **Chat with the Master Agent** — ask follow-up questions with full simulation context

---

## 🏗️ Project Structure

```
Datadogs/
├── backend/
│   ├── app.py                    # Flask API (/simulate, /learning, /chat)
│   ├── core/
│   │   ├── base_agent.py         # BaseAgent class with Groq + credibility EMA
│   │   ├── orchestrator.py       # 5-phase orchestrator + self-learning loop
│   │   ├── finance_service.py    # yFinance wrapper (profiles, price history)
│   │   └── trends_service.py     # Google Trends wrapper
│   ├── agents/
│   │   ├── validation.py         # Market, Customer, Competitive agents
│   │   ├── financial.py          # Revenue, Pricing, Risk agents
│   │   ├── gtm.py                # GTM Strategy + Feature agents
│   │   └── decision.py           # Launch Decision meta-agent
│   └── data/
│       └── learning_log.json     # Persisted agent credibility history
├── frontend/
│   ├── app.html                  # Main UI with 5-tab dashboard
│   ├── app.js                    # All rendering, charts, validation, learning panel
│   └── styles.css                # Premium dark theme + animations
├── core/                          # Root-level agent/core copies
├── agents/                        # Root-level agent copies
├── main.py                        # CLI version (standalone simulation)
├── run.sh                         # Startup script
├── pyproject.toml                 # UV/pip project config
└── requirements.txt
```

---

## 🤖 The 9 AI Agents

| # | Agent | Expertise |
|---|-------|-----------|
| 1 | **Market Analyzer** | TAM/SAM/SOM estimation, Google Trends analysis, market readiness |
| 2 | **Customer Insight Specialist** | User personas, pain points, perceived value scoring |
| 3 | **Competitive Intelligence Lead** | Competitor SWOT, yFinance financials, differentiation |
| 4 | **Revenue Architect** | 5-year projections, subscription models, LTV |
| 5 | **Pricing Strategist** | Tiered pricing, competitive positioning |
| 6 | **Risk Assessment Officer** | Risk matrix (impact × probability), mitigation strategies |
| 7 | **GTM Strategist** | Channel planning, funnel metrics, launch timeline |
| 8 | **Product Roadmap Lead** | Feature prioritization, MVP scoping |
| 9 | **Launch Director** | Final GO/NO-GO with confidence score + contingencies |

Plus: **Master Orchestrator** (executive synthesis + chat) and **Self-Learning Calibration** (post-run EMA).

---

## 🧬 Self-Learning Loop

After each simulation:
1. Agents receive simulated post-launch error feedback
2. Credibility scores update via **Exponential Moving Average**: `Score_t = 0.9 × Score_(t-1) + 0.1 × (1 - Error)`
3. Snapshots persist to `data/learning_log.json`
4. On restart, the orchestrator restores last-known credibility scores

The **Learning tab** visualizes this with a multi-line trend chart and a per-agent score table.

---

## 🔧 Configuration

```env
# .env
GROQ_API_KEY=your_groq_api_key_here
```

---

## 📊 Example Product Ideas

> *A premium subscription service for AI-driven portfolio management targeting tech-savvy Gen Z investors who want to optimize for ESG and long-term tax efficiency.*

> *An AI-powered meal planning app that generates personalized recipes based on dietary restrictions, local ingredient availability, and sustainability goals for busy urban professionals.*

---

## 🤝 Contributing

Contributions welcome! Feel free to report bugs, suggest features, or submit PRs.

## 📝 License

MIT License — free to use for your projects.

## 🙏 Credits

Built with [Groq](https://groq.com) · [Flask](https://flask.palletsprojects.com/) · [Chart.js](https://www.chartjs.org/) · [yFinance](https://github.com/ranaroussi/yfinance) · [Inter Font](https://rsms.me/inter/)

---

<div align="center">

**Made with ❤️ by Venture Forge**

*Where product ideas meet intelligent multi-agent analysis*

</div>
