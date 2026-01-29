# Quick Start Guide

## 🚀 Services Running

| Service       | URL                    | Status     |
| ------------- | ---------------------- | ---------- |
| Web App       | http://localhost:3000  | ✅ Running |
| Prisma Studio | http://localhost:51212 | ✅ Running |
| PostgreSQL    | localhost:5432         | ✅ Running |
| Redis         | localhost:6379         | ✅ Running |

## 👤 Demo User Credentials

All users have password: **`password123`**

| Name         | Email                    |
| ------------ | ------------------------ |
| John Doe     | john.doe@example.com     |
| Sarah Smith  | sarah.smith@example.com  |
| Ahmed Ali    | ahmed.ali@example.com    |
| Maria Garcia | maria.garcia@example.com |
| David Chen   | david.chen@example.com   |

## 🎯 Quick Actions

### Login to App

1. Go to http://localhost:3000
2. Click "Login"
3. Use any email above with password `password123`

### View Database

- Open http://localhost:51212 in browser
- Browse Users, Bookings, and other tables

### Create More Users

```bash
npm run create-demo-users
```

### Generate Mock Data

```bash
npm run generate-mock-data
```

## 📚 Documentation

- [Authentication System](docs/authentication.md)
- [Demo Users Details](docs/demo-users-credentials.md)
- [Login Flow Summary](docs/login-flow-summary.md)
- [Setup Verification](SETUP_VERIFICATION.md)

## 🛠️ Development Commands

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Open Prisma Studio
npx prisma studio --port 51212

# Database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

## ✅ System Status

- ✅ Authentication system fully functional
- ✅ 5 demo users created in database
- ✅ JWT-based login/logout working
- ✅ Protected routes implemented
- ✅ Bilingual support (EN/AR)
- ✅ Input text visibility fixed
- ✅ Single header with auth integration
- ✅ Mock flight data generated

## 🎉 Ready to Use!

Everything is set up and working. Start by logging in with any demo user and exploring the application.
