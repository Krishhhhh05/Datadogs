# 🚀 LaunchOS - AI Product Launch Orchestrator

<div align="center">

**Transform your product ideas into data-driven launch decisions with AI-powered multi-agent intelligence**

![LaunchOS](https://img.shields.io/badge/LaunchOS-v1.0-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-green?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)

</div>

## ✨ What is LaunchOS?

LaunchOS is an intelligent product launch operating system that uses multiple AI agents to analyze, validate, and provide comprehensive recommendations for your product ideas. It simulates a complete product launch process through 4 specialized phases:

- **Phase 1: Validation** - Market sizing, customer insights, competitive analysis
- **Phase 2: Financial** - Revenue projections, pricing strategy, risk assessment
- **Phase 3: GTM Strategy** - Go-to-market planning, feature prioritization
- **Phase 4: Decision** - AI-powered launch recommendation with confidence scoring

## 🎯 Features

- 🤖 **9 Specialized AI Agents** working in parallel and sequence
- 📊 **Real-time Analysis** with live progress tracking
- 💡 **Beautiful Modern UI** with dark mode design
- 🎨 **Visual Results Dashboard** showing all insights
- 🔄 **Self-Calibrating System** that learns from feedback
- 📈 **Credibility Scoring** for each AI agent

## 🛠️ Tech Stack

- **Backend:** Python, Flask, Groq AI
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **AI:** Multi-agent orchestration system
- **APIs:** Groq LLM (Llama 3 70B)

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- UV (recommended) or pip
- Groq API key ([Get one here](https://console.groq.com/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd LaunchOS
   ```

2. **Install UV (Recommended - 10-100x faster!)**
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. **Install dependencies**
   ```bash
   # With UV (recommended)
   uv sync

   # Or with pip
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

5. **Run the application**
   ```bash
   # With UV (recommended)
   uv run python backend/app.py

   # Or with Python
   python backend/app.py

   # Or use the startup script
   ./run.sh
   ```

6. **Open your browser**
   ```
   http://localhost:5000
   ```

## 📖 How to Use

1. **Enter Your Product Idea**
   - Describe your product concept in the text area
   - Be specific about your target market and value proposition

2. **Click "Analyze Product"**
   - Watch as 9 AI agents analyze your idea in real-time
   - Progress through 4 phases: Validation → Financial → GTM → Decision

3. **Review Results**
   - Get a GO/NO-GO recommendation
   - Explore detailed insights in each tab
   - Review agent credibility scores

## 🏗️ Project Structure

```
LaunchOS/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── core/
│   │   ├── base_agent.py      # Base AI agent class
│   │   └── orchestrator.py    # Multi-phase orchestration
│   └── agents/
│       ├── validation.py      # Market, Customer, Competitive agents
│       ├── financial.py       # Revenue, Pricing, Risk agents
│       ├── gtm.py            # GTM & Feature agents
│       └── decision.py        # Meta-decision agent
├── frontend/
│   ├── index.html            # Main UI
│   ├── styles.css            # Modern dark theme
│   └── app.js                # Frontend logic
├── main.py                    # CLI version
└── requirements.txt
```

## 🤖 The AI Agents

1. **Market Analyzer** - TAM/SAM/SOM estimation, market trends
2. **Customer Insight Specialist** - Personas, pain points, value scoring
3. **Competitive Intelligence Lead** - Competitor analysis, SWOT, differentiation
4. **Revenue Architect** - Financial projections, revenue models
5. **Pricing Strategist** - Pricing optimization, market positioning
6. **Risk Assessment Officer** - Risk identification, mitigation strategies
7. **GTM Agent** - Go-to-market strategy, channel planning
8. **Feature Agent** - Feature prioritization, roadmap planning
9. **Launch Decision Agent** - Final GO/NO-GO recommendation

## 🎨 Screenshots

The UI features:
- Gradient backgrounds with modern design
- Real-time phase progression indicators
- Interactive tabs for detailed results
- Agent credibility visualizations
- Responsive layout for all devices

## 🔧 Configuration

Edit `.env` to customize:

```env
GROQ_API_KEY=your_api_key_here
```

## 📊 Example Product Ideas to Try

```
A premium subscription service for AI-driven portfolio management
targeting tech-savvy Gen Z investors who want to optimize for ESG
and long-term tax efficiency.
```

```
An AI-powered meal planning app that generates personalized recipes
based on dietary restrictions, local ingredient availability, and
sustainability goals for busy urban professionals.
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

MIT License - feel free to use this for your projects!

## 🙏 Credits

Built with:
- [Groq](https://groq.com) - Lightning-fast LLM inference
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [Inter Font](https://rsms.me/inter/) - Beautiful typography

---

<div align="center">

**Made with ❤️ and AI**

*LaunchOS - Where ideas meet intelligent analysis*

</div>
