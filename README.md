# Etihad Flight Booking System

A modern flight booking application inspired by premium airline booking systems like Etihad Airways. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Flight Search**: Search for flights by origin, destination, dates, and passenger count
- **Seat Selection**: Interactive seat map for selecting preferred seats
- **Passenger Information**: Collect passenger details with validation
- **Add-ons & Extras**: Optional services like baggage, meals, insurance, and lounge access
- **Secure Payment**: Stripe integration for secure payment processing
- **Booking Management**: View and manage existing bookings
- **Multi-language Support**: English and Arabic with RTL layout
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 Level AA compliant

## Tech Stack

### Frontend

- **Framework**: Next.js 14 (React 18) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Management**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend

- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Session Store**: Redis
- **Payment**: Stripe
- **Email**: SendGrid

### Testing

- **Unit/Property Tests**: Vitest with fast-check
- **E2E Tests**: Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL
- Redis

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd etihad-next
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Set up the database:

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

5. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run unit and property tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:e2e:ui` - Run E2E tests with UI

## Project Structure

```
etihad-next/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── ...                # Pages and layouts
├── components/            # React components
│   ├── shared/           # Shared/reusable components
│   ├── search/           # Search-related components
│   ├── results/          # Results display components
│   └── booking/          # Booking flow components
├── lib/                   # Utility libraries
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── validation/       # Zod schemas
├── prisma/               # Prisma schema and migrations
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── property/        # Property-based tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
└── public/              # Static assets
```

## Testing

### Unit and Property Tests

Run unit and property-based tests:

```bash
pnpm test
```

Run with UI:

```bash
pnpm test:ui
```

Run with coverage:

```bash
pnpm test:coverage
```

### End-to-End Tests

Run E2E tests:

```bash
pnpm test:e2e
```

Run with UI:

```bash
pnpm test:e2e:ui
```

## Documentation

- [Requirements Document](.kiro/specs/flight-booking-system/requirements.md)
- [Design Document](.kiro/specs/flight-booking-system/design.md)
- [Implementation Tasks](.kiro/specs/flight-booking-system/tasks.md)

## License

This project is for educational purposes.
