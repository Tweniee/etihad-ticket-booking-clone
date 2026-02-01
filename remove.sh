#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}========================================${NC}"
echo -e "${RED}  Removing Etihad Flight Booking App${NC}"
echo -e "${RED}========================================${NC}\n"

# Confirmation prompt
read -p "$(echo -e ${YELLOW}This will remove all Docker containers, volumes, and images. Continue? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Cancelled.${NC}"
    exit 0
fi

# Step 0: Stop Next.js dev server if running
if [ -f .nextjs.pid ]; then
    NEXT_PID=$(cat .nextjs.pid)
    if ps -p $NEXT_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}[0/5] Stopping Next.js server (PID: $NEXT_PID)...${NC}"
        kill $NEXT_PID 2>/dev/null || true
        sleep 1
    fi
    rm -f .nextjs.pid
fi

# Step 1: Stop and remove containers
echo -e "${YELLOW}[1/5] Stopping Docker containers...${NC}"
docker-compose down

# Step 2: Remove volumes (database data)
echo -e "${YELLOW}[2/5] Removing Docker volumes...${NC}"
docker volume rm etihad-next_postgres_data 2>/dev/null || true
docker volume rm etihad-next_redis_data 2>/dev/null || true

# Also try with project directory name variations
CURRENT_DIR=$(basename "$(pwd)")
docker volume rm ${CURRENT_DIR}_postgres_data 2>/dev/null || true
docker volume rm ${CURRENT_DIR}_redis_data 2>/dev/null || true

# Step 3: Remove specific containers if they still exist
echo -e "${YELLOW}[3/5] Removing containers...${NC}"
docker rm -f flight-booking-postgres 2>/dev/null || true
docker rm -f flight-booking-redis 2>/dev/null || true

# Step 4: Remove Docker images
echo -e "${YELLOW}[4/5] Removing Docker images...${NC}"
docker rmi postgres:16-alpine 2>/dev/null || true
docker rmi redis:7-alpine 2>/dev/null || true

# Step 5: Clean up any dangling volumes
echo -e "${YELLOW}[5/5] Cleaning up dangling volumes...${NC}"
docker volume prune -f

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Cleanup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Removed:${NC}"
echo -e "  • PostgreSQL container and image"
echo -e "  • Redis container and image"
echo -e "  • All associated volumes and data"
echo -e "  • Dangling Docker volumes\n"

echo -e "${YELLOW}Note:${NC} Node modules and application files remain intact."
echo -e "To start again, run: ${GREEN}./start.sh${NC}\n"
