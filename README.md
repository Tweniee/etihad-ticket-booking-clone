# Etihad Flight Booking System

A modern flight booking application built with Next.js 14, inspired by premium airline booking systems like Etihad Airways.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Management**: React Hook Form with Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Session Store**: Redis
- **Payment Processing**: Stripe
- **Email Service**: SendGrid
- **Testing**: Vitest (unit/property tests), Playwright (E2E tests)

## Prerequisites

- Node.js 18+
- pnpm
- Docker and Docker Compose

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd etihad-next
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

- `DATABASE_URL`: PostgreSQL connection string (default works with Docker setup)
- `REDIS_URL`: Redis connection string (default works with Docker setup)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `SENDGRID_API_KEY`: Your SendGrid API key
- `SENDGRID_FROM_EMAIL`: Your verified sender email

### 4. Start Docker containers

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

Verify containers are running:

```bash
docker-compose ps
```

### 5. Run database migrations

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run unit and integration tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:e2e:ui` - Run E2E tests with UI

## Project Structure

```
etihad-next/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── fonts/             # Custom fonts
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── booking/          # Booking flow components
│   ├── results/          # Search results components
│   ├── search/           # Search components
│   └── shared/           # Shared/reusable components
├── lib/                   # Utility libraries
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── validation/       # Zod schemas
│   ├── prisma.ts         # Prisma client
│   └── redis.ts          # Redis client
├── prisma/               # Prisma schema and migrations
│   ├── migrations/       # Database migrations
│   └── schema.prisma     # Database schema
├── tests/                # Test files
│   ├── e2e/             # End-to-end tests
│   ├── integration/     # Integration tests
│   ├── property/        # Property-based tests
│   ├── unit/            # Unit tests
│   └── setup.ts         # Test setup
├── docker-compose.yml    # Docker services configuration
├── .env                  # Environment variables (not in git)
├── .env.example         # Example environment variables
└── package.json         # Dependencies and scripts
```

## Database Management

### View database with Prisma Studio

```bash
npx prisma studio
```

### Create a new migration

```bash
npx prisma migrate dev --name <migration-name>
```

### Reset database

```bash
npx prisma migrate reset
```

## Docker Management

### Stop containers

```bash
docker-compose down
```

### Stop and remove volumes

```bash
docker-compose down -v
```

### View logs

```bash
docker-compose logs -f
```

## Testing

### Run all tests

```bash
pnpm test
```

### Run specific test file

```bash
pnpm test tests/unit/setup.test.ts
```

### Run tests in watch mode

```bash
pnpm test
```

### Run E2E tests

```bash
pnpm test:e2e
```

## Features

- Flight search with multiple trip types (one-way, round-trip, multi-city)
- Interactive seat selection
- Passenger information collection
- Add-ons and extras (baggage, meals, insurance, lounge access)
- Secure payment processing with Stripe
- Booking management (view, modify, cancel)
- Email notifications
- Session management
- Responsive design (mobile, tablet, desktop)
- Accessibility compliant (WCAG 2.1 Level AA)
- Multi-language support (English, Arabic with RTL)

## License

MIT
