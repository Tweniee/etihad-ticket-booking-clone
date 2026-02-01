#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting Etihad Flight Booking App${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Step 1: Start Docker services
echo -e "${YELLOW}[1/6] Starting Docker services (PostgreSQL & Redis)...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}[2/6] Waiting for services to be ready...${NC}"
sleep 5

# Check PostgreSQL health
echo -n "  Checking PostgreSQL... "
for i in {1..30}; do
    if docker exec flight-booking-postgres pg_isready -U flight_user -d flight_booking > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Failed${NC}"
        exit 1
    fi
    sleep 1
done

# Check Redis health
echo -n "  Checking Redis... "
for i in {1..30}; do
    if docker exec flight-booking-redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Failed${NC}"
        exit 1
    fi
    sleep 1
done

# Step 2: Install dependencies
echo -e "${YELLOW}[3/6] Installing dependencies...${NC}"
if command -v pnpm > /dev/null 2>&1; then
    pnpm install
elif command -v npm > /dev/null 2>&1; then
    npm install
else
    echo -e "${RED}✗ Neither pnpm nor npm found. Please install Node.js package manager.${NC}"
    exit 1
fi

# Step 3: Run Prisma migrations
echo -e "${YELLOW}[4/6] Running database migrations...${NC}"
npx prisma migrate deploy

# Step 4: Generate Prisma Client
echo -e "${YELLOW}[5/7] Generating Prisma Client...${NC}"
npx prisma generate

# Step 5: Seed user and travel data
echo -e "${YELLOW}[6/7] Seeding user and travel history data...${NC}"
./scripts/seed-user-travel-data.sh

# Step 6: Start the development server
echo -e "${YELLOW}[7/7] Starting Next.js development server...${NC}\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ All services started successfully!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Services running:${NC}"
echo -e "  • PostgreSQL:    ${GREEN}localhost:5432${NC}"
echo -e "  • Redis:         ${GREEN}localhost:6379${NC}"
echo -e "  • Next.js App:   ${GREEN}http://localhost:3000${NC}"
echo -e "  • Prisma Studio: Run ${YELLOW}npx prisma studio --port 51212${NC}\n"

echo -e "${BLUE}Useful commands:${NC}"
echo -e "  • Stop services:     ${YELLOW}./remove.sh${NC}"
echo -e "  • View logs:         ${YELLOW}tail -f nextjs.log${NC}"
echo -e "  • View docker logs:  ${YELLOW}docker-compose logs -f${NC}"
echo -e "  • Seed mock data:    ${YELLOW}npm run seed-bookings${NC}\n"

# Start the Next.js dev server in detached mode
LOG_FILE="nextjs.log"
if command -v pnpm > /dev/null 2>&1; then
    nohup pnpm dev > "$LOG_FILE" 2>&1 &
else
    nohup npm run dev > "$LOG_FILE" 2>&1 &
fi

NEXT_PID=$!
echo "$NEXT_PID" > .nextjs.pid

echo -e "${GREEN}Next.js server started in background (PID: $NEXT_PID)${NC}"
echo -e "${BLUE}Logs: ${YELLOW}tail -f $LOG_FILE${NC}\n"
