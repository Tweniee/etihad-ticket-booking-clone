# Project Scripts Guide

## Quick Start Scripts

### 🚀 start.sh

Starts the complete project with all dependencies.

```bash
./start.sh
```

**What it does:**

1. Starts Docker services (PostgreSQL & Redis)
2. Waits for services to be healthy
3. Installs Node.js dependencies
4. Runs database migrations
5. Generates Prisma Client
6. Seeds user and travel history data (4 users, 34 travel records)
7. Starts Next.js development server

**Services started:**

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Next.js App: `http://localhost:3000`

---

### 🗑️ remove.sh

Removes all Docker containers, volumes, and images created by the project.

```bash
./remove.sh
```

**What it removes:**

1. Stops all Docker containers
2. Removes Docker volumes (⚠️ **deletes all database data**)
3. Removes specific containers (flight-booking-postgres, flight-booking-redis)
4. Removes Docker images (postgres:16-alpine, redis:7-alpine)
5. Cleans up dangling volumes

**Note:** This script will ask for confirmation before proceeding.

---

## Additional NPM Scripts

### Development

```bash
npm run dev              # Start Next.js development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Testing

```bash
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
```

### Database & Data

```bash
npm run create-test-user    # Create a test user
npm run create-demo-users   # Create demo users
npm run generate-mock-data  # Generate mock airline data JSON
npm run seed-bookings       # Seed mock bookings to database
npm run seed-user-travel    # Seed user and travel history data
npm run verify-auth         # Verify authentication system
```

### Prisma

```bash
npx prisma studio --port 51212  # Open Prisma Studio
npx prisma migrate dev          # Create and apply migration
npx prisma migrate deploy       # Apply migrations (production)
npx prisma generate             # Generate Prisma Client
```

---

## Typical Workflow

### First Time Setup

```bash
# 1. Start everything
./start.sh

# 2. In another terminal, seed data (optional)
npm run seed-bookings

# 3. Open Prisma Studio to view data (optional)
npx prisma studio --port 51212
```

### Daily Development

```bash
# Start services
./start.sh

# When done, stop services
# Press Ctrl+C to stop Next.js
docker-compose down  # Stop Docker services
```

### Complete Cleanup

```bash
# Remove everything and start fresh
./remove.sh
./start.sh
```

---

## Troubleshooting

### Docker not running

```bash
# Make sure Docker Desktop is running
docker info
```

### Port already in use

```bash
# Check what's using the port
lsof -i :3000  # Next.js
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill the process or change ports in .env and docker-compose.yml
```

### Database connection issues

```bash
# Test database connection
npx tsx scripts/test-db-connection.ts

# Reset database
docker-compose down -v
./start.sh
```

### Permission denied on scripts

```bash
# Make scripts executable
chmod +x start.sh remove.sh
```
