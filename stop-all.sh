#!/bin/bash

echo "=================================================="
echo "🛑 Stopping All ActiveLearn Services"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping Lokdin server (port 5002)...${NC}"
lsof -ti:5002 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Lokdin stopped"
else
    echo -e "${YELLOW}⚠${NC} Lokdin was not running"
fi

echo ""
echo -e "${YELLOW}Stopping ActiveLearn Backend (port 5001)...${NC}"
lsof -ti:5001 | xargs kill -9 2>/dev/null
pkill -f "node.*server.js" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backend stopped"
else
    echo -e "${YELLOW}⚠${NC} Backend was not running"
fi

echo ""
echo -e "${YELLOW}Stopping ActiveLearn Frontend (port 3000)...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Frontend stopped"
else
    echo -e "${YELLOW}⚠${NC} Frontend was not running"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ All services stopped${NC}"
echo "=================================================="
