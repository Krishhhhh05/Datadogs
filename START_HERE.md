# 🎯 Quick Start Guide

## Step 1: Get Your API Key
1. Go to https://console.groq.com/keys
2. Sign up or log in
3. Create a new API key
4. Copy it

## Step 2: Set Up Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and paste your API key
# Replace "your_groq_api_key_here" with your actual key
```

## Step 3: Install Dependencies

### Option A: Using UV (Recommended - Super Fast! ⚡)
```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install all dependencies
uv sync
```

### Option B: Using pip (Traditional)
```bash
pip install -r requirements.txt
```

## Step 4: Run LaunchOS

### With UV (Recommended)
```bash
# Option 1: Use the startup script
./run.sh

# Option 2: Run directly
uv run python backend/app.py
```

### With Python
```bash
python backend/app.py
```

## Step 5: Open Browser
Open: http://localhost:5000

---

## 🎨 What You'll See

1. **Beautiful Landing Page** - Enter your product idea
2. **Real-Time Progress** - Watch 4 phases complete
3. **Detailed Results** - Explore validation, financial, GTM insights
4. **AI Recommendations** - Get a data-driven GO/NO-GO decision

---

## 💡 Try This Example

```
A premium subscription service for AI-driven portfolio management
targeting tech-savvy Gen Z investors who want to optimize for ESG
and long-term tax efficiency.
```

---

## ⚡ Need Help?

- Make sure your GROQ_API_KEY is set correctly in `.env`
- Ensure Python 3.9+ is installed
- Check that port 5000 is available
- See README.md for detailed documentation
