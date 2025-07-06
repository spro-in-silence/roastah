#!/bin/bash

# Roastah Application Restart Script
# This script stops all running instances and restarts the application

set -e

echo "🛑 Stopping Roastah application..."

# Kill all related processes
echo "   Killing backend processes..."
pkill -f "tsx watch server/dev-server.ts" || true

echo "   Killing frontend processes..."
pkill -f "vite" || true

echo "   Killing concurrently processes..."
pkill -f "concurrently" || true

# Kill processes using specific ports
echo "   Freeing up ports..."
lsof -ti:5000 | xargs kill -9 || true
lsof -ti:5173 | xargs kill -9 || true

# Wait a moment for processes to fully terminate
echo "   Waiting for processes to terminate..."
sleep 2

# Verify ports are free
echo "   Verifying ports are free..."
if lsof -i:5000 > /dev/null 2>&1; then
    echo "   ⚠️  Port 5000 is still in use"
else
    echo "   ✅ Port 5000 is free"
fi

if lsof -i:5173 > /dev/null 2>&1; then
    echo "   ⚠️  Port 5173 is still in use"
else
    echo "   ✅ Port 5173 is free"
fi

echo ""
echo "🚀 Starting Roastah application..."

# Set environment variables and start the application
export GOOGLE_CLOUD_PROJECT=roastah-d
export NODE_ENV=development
export PORT=5000

echo "   Environment:"
echo "     GOOGLE_CLOUD_PROJECT: $GOOGLE_CLOUD_PROJECT"
echo "     NODE_ENV: $NODE_ENV"
echo "     PORT: $PORT"
echo ""

# Start the application
pnpm dev

echo ""
echo "✅ Roastah application restarted successfully!"
echo "   Frontend: http://localhost:5173/"
echo "   Backend:  http://localhost:5000/" 