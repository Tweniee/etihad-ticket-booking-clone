# Etihad Airways Flight Booking System

A modern flight booking application built with Next.js 14, TypeScript, and Tailwind CSS, inspired by premium airline booking systems like Etihad Airways.

## Features

- Flight search with multiple trip types (one-way, round-trip, multi-city)
- Interactive seat selection with visual seat maps
- Passenger information collection with validation
- Add-ons and extras (baggage, meals, insurance, lounge access)
- Secure payment processing with Razorpay/Stripe
- Booking management (view, modify, cancel)
- Email notifications via SendGrid
- Session management with Redis
- Multi-language support (English and Arabic with RTL)
- Responsive design for all devices
- Accessibility compliant (WCAG 2.1 Level AA)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Management**: React Hook Form with Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Session Store**: Redis
- **Payment**: Razorpay / Stripe
- **Email**: SendGrid
- **Testing**: Vitest (unit/property tests), Playwright (E2E tests)
- **Internationalization**: next-intl

## Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for local database and Redis)
- Payment provider account (Razorpay or Stripe)
- SendGrid account for email notifications

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

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following **required** variables:

```env
# Database
DATABASE_URL="postgresql://flight_user:flight_password@localhost:5432/flight_booking?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Payment (choose one or both)
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# OR

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"

# Email
SENDGRID_API_KEY="your_sendgrid_api_key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

See `.env.example` for all available configuration options.

### 4. Start Docker services

Start PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

Verify containers are running and healthy:

```bash
docker-compose ps
```

### 5. Run database migrations

Generate Prisma client and apply migrations:

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

Optional: Verify database setup

```bash
pnpm tsx scripts/verify-db.ts
```

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will redirect to [http://localhost:3000/en](http://localhost:3000/en) (English) or [http://localhost:3000/ar](http://localhost:3000/ar) (Arabic).

## Available Scripts

### Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Testing

- `pnpm test` - Run all tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:e2e:ui` - Run E2E tests with UI

### Database

- `pnpm prisma generate` - Generate Prisma client
- `pnpm prisma migrate dev` - Create and apply migrations
- `pnpm prisma migrate reset` - Reset database
- `pnpm prisma studio` - Open Prisma Studio (database GUI)

## Project Structure

```
etihad-next/
├── app/                    # Next.js app directory
│   ├── [locale]/          # Internationalized routes
│   │   ├── page.tsx       # Home/Search page
│   │   ├── results/       # Flight results
│   │   ├── details/       # Flight details
│   │   ├── passengers/    # Passenger information
│   │   ├── seats/         # Seat selection
│   │   ├── extras/        # Add-ons and extras
│   │   ├── payment/       # Payment processing
│   │   ├── confirmation/  # Booking confirmation
│   │   └── manage/        # Manage booking
│   └── api/               # API routes
│       ├── airports/      # Airport search
│       ├── bookings/      # Booking management
│       ├── flights/       # Flight search
│       ├── payment/       # Payment processing
│       └── seats/         # Seat maps
├── components/            # React components
│   ├── booking/          # Booking flow components
│   ├── payment/          # Payment components
│   ├── results/          # Search results components
│   ├── search/           # Search components
│   └── shared/           # Shared/reusable components
├── lib/                  # Utility libraries
│   ├── config.ts         # Configuration management
│   ├── data/            # Mock data
│   ├── email/           # Email service
│   ├── hooks/           # Custom React hooks
│   ├── store/           # State management (Zustand)
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── validation/      # Zod schemas
│   ├── prisma.ts        # Prisma client
│   └── redis.ts         # Redis client
├── prisma/              # Database schema and migrations
│   ├── migrations/      # Database migrations
│   └── schema.prisma    # Database schema
├── i18n/                # Internationalization
│   ├── messages/        # Translation files
│   │   ├── en.json     # English translations
│   │   └── ar.json     # Arabic translations
│   └── request.ts       # i18n configuration
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── property/       # Property-based tests
│   └── e2e/            # End-to-end tests
├── docs/               # Documentation
├── docker-compose.yml  # Docker services configuration
├── .env                # Environment variables (not in git)
└── .env.example       # Example environment variables
```

## Environment Variables

### Required Configuration

| Variable              | Description                  | Example                                    |
| --------------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL`        | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL`           | Redis connection string      | `redis://localhost:6379`                   |
| `SENDGRID_API_KEY`    | SendGrid API key             | `SG.xxx`                                   |
| `SENDGRID_FROM_EMAIL` | Verified sender email        | `noreply@yourdomain.com`                   |
| `NEXT_PUBLIC_APP_URL` | Application URL              | `http://localhost:3000`                    |

### Payment Configuration (choose one or both)

**Razorpay:**

- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret

**Stripe:**

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Optional Configuration

| Variable                     | Description            | Default        |
| ---------------------------- | ---------------------- | -------------- |
| `NODE_ENV`                   | Environment            | `development`  |
| `SESSION_SECRET`             | Session encryption key | Auto-generated |
| `LOG_LEVEL`                  | Logging level          | `info`         |
| `ENABLE_STRIPE`              | Enable Stripe          | `true`         |
| `ENABLE_RAZORPAY`            | Enable Razorpay        | `true`         |
| `ENABLE_EMAIL_NOTIFICATIONS` | Enable emails          | `true`         |
| `SKIP_EMAIL_SENDING`         | Skip email in dev      | `false`        |

See `.env.example` for complete list and descriptions.

## Database Management

### View database with Prisma Studio

```bash
pnpm prisma studio
```

Opens a web interface at http://localhost:5555 to view and edit database records.

### Create a new migration

```bash
pnpm prisma migrate dev --name <migration-name>
```

### Reset database (WARNING: deletes all data)

```bash
pnpm prisma migrate reset
```

### Seed database (if seed script exists)

```bash
pnpm prisma db seed
```

## Docker Management

### View container status

```bash
docker-compose ps
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop containers

```bash
docker-compose down
```

### Stop and remove volumes (WARNING: deletes all data)

```bash
docker-compose down -v
```

### Restart containers

```bash
docker-compose restart
```

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run specific test file
pnpm test tests/unit/setup.test.ts

# Run tests in watch mode
pnpm test -- --watch

# Run with coverage
pnpm test:coverage
```

### Integration Tests

```bash
pnpm test tests/integration
```

### Property-Based Tests

```bash
pnpm test tests/property
```

### End-to-End Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific test
pnpm test:e2e tests/e2e/booking-flow.spec.ts
```

## Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

4. **Configure environment variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Set `NODE_ENV=production`

5. **Set up external services**
   - PostgreSQL: Use Vercel Postgres, Supabase, or Railway
   - Redis: Use Upstash or Redis Cloud
   - Update `DATABASE_URL` and `REDIS_URL` in Vercel

6. **Run migrations**
   ```bash
   vercel env pull .env.production
   pnpm prisma migrate deploy
   ```

### Docker Deployment

```bash
# Build image
docker build -t etihad-booking .

# Run container
docker run -p 3000:3000 --env-file .env etihad-booking
```

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL

**Solutions**:

1. Check if PostgreSQL is running: `docker-compose ps`
2. Verify connection string in `.env`
3. Test connection: `docker-compose exec postgres psql -U flight_user -d flight_booking`
4. Check logs: `docker-compose logs postgres`

### Redis Connection Issues

**Problem**: Cannot connect to Redis

**Solutions**:

1. Check if Redis is running: `docker-compose ps`
2. Test connection: `docker-compose exec redis redis-cli ping`
3. Check logs: `docker-compose logs redis`

### Payment Integration Issues

**Problem**: Payment processing fails

**Solutions**:

1. Verify API keys are correct in `.env`
2. Check payment provider dashboard for test mode
3. Review webhook configuration for production
4. Check browser console for client-side errors

### Email Sending Issues

**Problem**: Emails not being sent

**Solutions**:

1. Verify SendGrid API key is correct
2. Check sender email is verified in SendGrid
3. Review SendGrid activity logs
4. Set `SKIP_EMAIL_SENDING=true` for development testing

### Build Errors

**Problem**: Build fails with TypeScript errors

**Solutions**:

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
3. Regenerate Prisma client: `pnpm prisma generate`

## Documentation

- [Keyboard Navigation Guide](./docs/keyboard-navigation.md)
- [API Documentation](./docs/route-implementation-summary.md)
- [Error Handling](./lib/utils/ERROR_HANDLING.md)
- [Database Migration Verification](./docs/database-migration-verification.md)

## Support

For issues and questions:

- Check the documentation in the `docs/` directory
- Review existing issues on GitHub
- Contact support at support@etihad-booking.com

## License

MIT
