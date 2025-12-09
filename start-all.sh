#!/bin/bash

echo "=================================================="
echo "🚀 Starting ActiveLearn + Lokdin Full Stack"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}[1/3]${NC} Starting Lokdin Engagement Detection Server..."
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend"
bash "../start_real_lokdin.sh" &
LOKDIN_PID=$!
echo -e "${GREEN}✓${NC} Lokdin server starting (PID: $LOKDIN_PID) on port 5002"
echo ""

# Wait a bit for Lokdin to initialize
sleep 3

echo -e "${BLUE}[2/3]${NC} Starting ActiveLearn Backend Server..."
cd "$SCRIPT_DIR/backend"
npm start &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend server starting (PID: $BACKEND_PID) on port 5001"
echo ""

# Wait for backend to start
sleep 3

echo -e "${BLUE}[3/3]${NC} Starting ActiveLearn Frontend..."
cd "$SCRIPT_DIR/reactcode/reactcode1"
PORT=3000 npm start &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend starting (PID: $FRONTEND_PID) on port 3000"
echo ""

echo "=================================================="
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo "=================================================="
echo ""
echo "📍 Service URLs:"
echo "   - Frontend:  http://localhost:3000"
echo "   - Backend:   http://localhost:5001"
echo "   - Lokdin:    http://localhost:5002"
echo ""
echo "📝 Process IDs:"
echo "   - Lokdin:    $LOKDIN_PID"
echo "   - Backend:   $BACKEND_PID"
echo "   - Frontend:  $FRONTEND_PID"
echo ""
echo -e "${YELLOW}⚠️  To stop all services, run:${NC}"
echo "   ./stop-all.sh"
echo ""
echo "Press Ctrl+C to view logs (services will continue running in background)"
echo "=================================================="

# Keep script running to show it's active
wait
