#!/bin/bash

# LaunchOS Startup Script
echo "🚀 Starting LaunchOS..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your GROQ_API_KEY, then run this script again."
    exit 1
fi

# Check if GROQ_API_KEY is set
if grep -q "your_groq_api_key_here" .env; then
    echo "⚠️  Please set your GROQ_API_KEY in the .env file"
    exit 1
fi

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Sync dependencies with uv
echo "📦 Installing dependencies with uv..."
uv sync

# Start the server
echo "✨ Starting LaunchOS server..."
echo "🌐 Open http://localhost:5000 in your browser"
echo ""
uv run python backend/app.py
