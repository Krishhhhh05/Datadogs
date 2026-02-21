# ✅ Setup Complete!

## 🎉 Your LaunchOS is Ready!

All dependencies are installed. You just need to add your API key and start the server.

---

## 🔑 Step 1: Get Your Groq API Key

1. Visit: **https://console.groq.com/keys**
2. Sign up or log in
3. Click "Create API Key"
4. Copy your key

---

## ⚙️ Step 2: Add Your API Key

Open the `.env` file and replace `your_groq_api_key_here` with your actual key:

```bash
# Open .env in your editor
nano .env

# Or use this command (replace YOUR_KEY with your actual key):
echo "GROQ_API_KEY=gsk_YOUR_ACTUAL_KEY_HERE" > .env
```

---

## 🚀 Step 3: Start LaunchOS

```bash
uv run python backend/app.py
```

Then open: **http://localhost:5000**

---

## 🎯 Try It Out!

Enter this example idea:

```
A premium subscription service for AI-driven portfolio management
targeting tech-savvy Gen Z investors who want to optimize for ESG
and long-term tax efficiency.
```

Watch as 9 AI agents analyze your product in real-time! ✨

---

## ⚡ Quick Commands

```bash
# Start server
uv run python backend/app.py

# Or use the script
./run.sh

# Update dependencies
uv sync
```

---

## 🆘 Need Help?

- **Port 5000 in use?** Kill existing process: `lsof -ti:5000 | xargs kill -9`
- **Dependencies issue?** Run: `uv sync --reinstall`
- **API errors?** Check your GROQ_API_KEY in `.env`

Enjoy LaunchOS! 🚀
