#!/bin/bash

# OMKO Production Deployment Script
# Deploys changes from GitHub to Hostinger production server

echo "================================"
echo "OMKO Production Deployment"
echo "================================"
echo "Date: $(date)"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend deployment
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Deploying Backend...${NC}"
echo -e "${BLUE}================================${NC}"

cd real_estate_admin

echo -e "${YELLOW}1. Pulling latest changes from GitHub...${NC}"
git pull origin master

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend pulled successfully${NC}"
else
    echo -e "${RED}✗ Failed to pull backend${NC}"
    exit 1
fi

echo -e "${YELLOW}2. Running Laravel cache clear...${NC}"
php artisan cache:clear
php artisan config:clear
php artisan view:clear

echo -e "${YELLOW}3. Running database migrations (if any)...${NC}"
php artisan migrate --force

echo -e "${GREEN}✓ Backend deployment completed${NC}"
echo ""

# Frontend deployment
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Deploying Frontend...${NC}"
echo -e "${BLUE}================================${NC}"

cd ../Web-omko

echo -e "${YELLOW}1. Pulling latest changes from GitHub...${NC}"
git pull origin master

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend pulled successfully${NC}"
else
    echo -e "${RED}✗ Failed to pull frontend${NC}"
    exit 1
fi

echo -e "${YELLOW}2. Installing dependencies...${NC}"
npm install --production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${YELLOW}3. Building Next.js application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}4. Restarting application...${NC}"
# If using PM2 or Node process manager
pm2 restart omko-frontend || echo "Manual restart may be required"

echo -e "${GREEN}✓ Frontend deployment completed${NC}"
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL${NC}"
echo -e "${BLUE}================================${NC}"
echo "Deployment completed at: $(date)"
echo ""
echo "Backend Commits:"
cd ../real_estate_admin && git log --oneline -n 3
echo ""
echo "Frontend Commits:"
cd ../Web-omko && git log --oneline -n 3
