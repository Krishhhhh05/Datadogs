#!/bin/bash

# DataDogs Startup Script
echo "🐾 Starting DataDogs..."

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

# Kill any existing processes on ports 5000 and 5001
echo "🧹 Cleaning up old processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
sleep 1

# Load env
export $(grep -v '^#' .env | xargs)

# ── Start backend on port 5001 ──
echo "⚙️  Starting backend on http://localhost:5001 ..."
PYTHONPATH="$(pwd)" python3 backend/app.py &
BACKEND_PID=$!
sleep 2

# ── Start frontend on port 5000 ──
echo "🌐 Starting frontend on http://localhost:5000 ..."
python3 -m http.server 5000 --directory frontend &
FRONTEND_PID=$!

echo ""
echo "✅ DataDogs is running!"
echo "   Frontend → http://localhost:5000/login.html"
echo "   Backend  → http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait and handle shutdown
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
