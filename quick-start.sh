#!/bin/bash

echo "╔═══════════════════════════════════════════╗"
echo "║     🚀 LaunchOS Quick Start Helper       ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check if API key is set
if [ ! -f .env ] || grep -q "your_groq_api_key_here" .env 2>/dev/null; then
    echo "🔑 Setting up your Groq API key..."
    echo ""
    echo "Please paste your Groq API key"
    echo "(Get one from: https://console.groq.com/keys)"
    echo ""
    read -p "API Key: " api_key

    if [ -z "$api_key" ]; then
        echo "❌ No API key provided. Exiting."
        exit 1
    fi

    echo "GROQ_API_KEY=$api_key" > .env
    echo "✅ API key saved to .env"
    echo ""
fi

# Start the server
echo "🚀 Starting LaunchOS server..."
echo "📱 Open http://localhost:5000 in your browser"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

uv run python backend/app.py
