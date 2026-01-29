# Authentication Setup Guide

This guide will help you set up and test the authentication system in the Etihad Airways flight booking application.

## Prerequisites

- PostgreSQL database running (via Docker or locally)
- Redis running (via Docker or locally)
- Node.js and pnpm installed

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# JWT secret for authentication tokens
# Generate with: openssl rand -base64 32
JWT_SECRET="your_jwt_secret_key_here"
```

To generate a secure JWT secret:

```bash
openssl rand -base64 32
```

### 3. Run Database Migration

The User model has been added to the Prisma schema. Run the migration:

```bash
npx prisma migrate dev
```

This will create the `User` table in your database.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Create a Test User (Optional)

To quickly test the authentication system, create a test user:

```bash
pnpm create-test-user
```

This will create a user with:

- Email: `test@example.com`
- Password: `password123`

### 6. Start the Development Server

```bash
pnpm dev
```

Navigate to `http://localhost:3000`

## Testing the Authentication Flow

### Register a New User

1. Click the "Login" button in the header
2. Click "Register" at the bottom of the login modal
3. Fill in the registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: +1234567890 (optional)
   - Password: password123
   - Confirm Password: password123
4. Click "Register"
5. You should be automatically logged in and see your name in the header

### Login with Existing User

1. Click the "Login" button in the header
2. Enter your credentials:
   - Email: test@example.com (or your registered email)
   - Password: password123
3. Click "Login"
4. You should be logged in and see your name in the header

### View Profile

1. After logging in, click on your name in the header
2. Click "My Profile" from the dropdown menu
3. You should see your profile information

### Logout

1. Click on your name in the header
2. Click "Logout" from the dropdown menu
3. You should be logged out and see the "Login" button again

## Features

### Implemented Features

✅ User registration with validation
✅ User login with email and password
✅ Secure password hashing (bcrypt)
✅ JWT-based authentication
✅ HTTP-only cookies for token storage
✅ Protected routes (profile page)
✅ User menu with profile link
✅ Logout functionality
✅ Bilingual support (English/Arabic)
✅ Responsive design
✅ Accessibility features (ARIA labels, keyboard navigation)

### Security Features

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens are stored in HTTP-only cookies (prevents XSS)
- Secure cookies in production (HTTPS only)
- Token expiration (7 days)
- Input validation using Zod schemas
- CSRF protection via SameSite cookies

## API Endpoints

### POST /api/auth/register

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "USER"
  }
}
```

### POST /api/auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "USER"
  }
}
```

### GET /api/auth/me

Get the currently authenticated user.

**Response:**

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "USER"
  }
}
```

### POST /api/auth/logout

Logout the current user.

**Response:**

```json
{
  "success": true
}
```

## Using Authentication in Your Code

### Protect a Page

```typescript
"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { LoadingSpinner } from "@/components/shared";

export default function ProtectedPage() {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
    </div>
  );
}
```

### Use Auth in a Component

```typescript
"use client";

import { useAuth } from "@/lib/contexts/auth-context";

export function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Hello, {user.email}!</div>;
}
```

## Troubleshooting

### "JWT_SECRET is not defined" Error

Make sure you have added `JWT_SECRET` to your `.env` file:

```bash
JWT_SECRET="your_generated_secret_here"
```

### Database Connection Error

Ensure PostgreSQL is running and the `DATABASE_URL` in your `.env` file is correct:

```bash
DATABASE_URL="postgresql://flight_user:flight_password@localhost:5432/flight_booking?schema=public"
```

### User Table Not Found

Run the database migration:

```bash
npx prisma migrate dev
```

### Cannot Login After Registration

Check the browser console for errors. Make sure:

1. The API routes are working (check Network tab)
2. Cookies are being set (check Application tab > Cookies)
3. No CORS issues

## Next Steps

Consider implementing:

- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- OAuth providers (Google, Facebook)
- Profile editing
- Account deletion
- Session management
