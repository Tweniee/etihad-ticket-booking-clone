#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Seeding user and travel history data...${NC}"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL not found in .env file${NC}"
    exit 1
fi

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Execute SQL file using docker exec
echo -e "${YELLOW}Loading data.sql into database...${NC}"

# Check if running in Docker or local PostgreSQL
if docker ps | grep -q flight-booking-postgres; then
    # Use docker exec
    docker exec -i flight-booking-postgres psql -U "$DB_USER" -d "$DB_NAME" < prisma/data.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ User and travel history data seeded successfully!${NC}"
        echo -e "${GREEN}  - 4 users created${NC}"
        echo -e "${GREEN}  - 34 travel history records created${NC}"
    else
        echo -e "${RED}✗ Failed to seed data${NC}"
        exit 1
    fi
else
    # Use local psql
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f prisma/data.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ User and travel history data seeded successfully!${NC}"
        echo -e "${GREEN}  - 4 users created${NC}"
        echo -e "${GREEN}  - 34 travel history records created${NC}"
    else
        echo -e "${RED}✗ Failed to seed data${NC}"
        exit 1
    fi
fi
