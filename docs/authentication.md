# Authentication System

This document describes the authentication system implemented in the Etihad Airways flight booking application.

## Overview

The application uses a JWT-based authentication system with the following features:

- User registration and login
- Secure password hashing with bcrypt
- JWT tokens stored in HTTP-only cookies
- Client-side auth state management with React Context
- Protected routes
- Bilingual support (English/Arabic)

## Architecture

### Backend (API Routes)

#### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout and clear auth cookie
- `GET /api/auth/me` - Get current authenticated user

### Database Schema

The `User` model in Prisma:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  phone     String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  USER
  ADMIN
}
```

### Frontend Components

#### Auth Context (`lib/contexts/auth-context.tsx`)

Provides global authentication state and methods:

```typescript
const { user, loading, login, register, logout, refreshUser } = useAuth();
```

#### Components

- `LoginModal` - Modal dialog for user login
- `RegisterModal` - Modal dialog for user registration
- `Header` - Navigation header with login/user menu

#### Hooks

- `useAuth()` - Access auth context
- `useRequireAuth()` - Protect pages requiring authentication

## Usage

### Protecting a Page

```typescript
"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function ProtectedPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return <div>Protected content for {user.email}</div>;
}
```

### Using Auth in Components

```typescript
"use client";

import { useAuth } from "@/lib/contexts/auth-context";

export function MyComponent() {
  const { user, login, logout } = useAuth();

  if (user) {
    return <button onClick={logout}>Logout</button>;
  }

  return <button onClick={() => login(email, password)}>Login</button>;
}
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **HTTP-Only Cookies**: JWT tokens are stored in HTTP-only cookies to prevent XSS attacks
3. **Secure Cookies**: In production, cookies are marked as secure (HTTPS only)
4. **Token Expiration**: JWT tokens expire after 7 days
5. **Input Validation**: All inputs are validated using Zod schemas

## Environment Variables

Add to your `.env` file:

```bash
# JWT secret for authentication tokens
# Generate with: openssl rand -base64 32
JWT_SECRET="your_jwt_secret_key_here"
```

## API Examples

### Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Current User

```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

## Testing

To test the authentication system:

1. Start the development server: `pnpm dev`
2. Navigate to `http://localhost:3000`
3. Click "Login" in the header
4. Click "Register" to create a new account
5. Fill in the registration form and submit
6. You should be automatically logged in
7. Click on your name in the header to see the user menu
8. Navigate to "My Profile" to see your profile page
9. Click "Logout" to log out

## Future Enhancements

- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- OAuth providers (Google, Facebook, etc.)
- Session management (view/revoke active sessions)
- Account deletion
- Profile editing
