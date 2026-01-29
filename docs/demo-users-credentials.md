# Demo User Credentials

## ✅ Status: All Users Created Successfully

All 5 demo users have been successfully created in the database and are ready to use.

## Overview

5 demo users with complete flight history (10 trips each, 50 total flights).

## User Accounts

All users share the same password: **`password123`**

### 1. John Doe 🇺🇸

- **Email:** `john.doe@example.com`
- **Password:** `password123`
- **Phone:** +1234567890
- **Stats:**
  - 10 trips
  - ~$19,810 total spend
  - Favorite Airline: Delta Airlines
  - Most Visited: Doha
  - Frequent Flyer: Delta Gold Member

### 2. Sarah Smith 🇺🇸

- **Email:** `sarah.smith@example.com`
- **Password:** `password123`
- **Phone:** +1234567891
- **Stats:**
  - 10 trips
  - ~$16,355 total spend
  - Favorite Airline: Vistara
  - Most Visited: Mumbai
  - Frequent Flyer: Vistara Member

### 3. Ahmed Ali 🇦🇪

- **Email:** `ahmed.ali@example.com`
- **Password:** `password123`
- **Phone:** +971501234567
- **Stats:**
  - 10 trips
  - ~$16,667 total spend
  - Favorite Airline: Qatar Airways
  - Most Visited: New York
  - Frequent Flyer: Qatar Airways Member

### 4. Maria Garcia 🇪🇸

- **Email:** `maria.garcia@example.com`
- **Password:** `password123`
- **Phone:** +34612345678
- **Stats:**
  - 10 trips
  - ~$21,087 total spend
  - Favorite Airline: Iberia
  - Most Visited: Frankfurt
  - Frequent Flyer: Iberia Member

### 5. David Chen 🇨🇳

- **Email:** `david.chen@example.com`
- **Password:** `password123`
- **Phone:** +8613812345678
- **Stats:**
  - 10 trips
  - ~$19,321 total spend
  - Favorite Airline: Air China
  - Most Visited: Singapore
  - Frequent Flyer: Air China Member

## Quick Login

1. Go to `http://localhost:3000`
2. Click "Login" button
3. Use any email from above
4. Password: `password123`

## Creating Users

### Option 1: Register via UI (Recommended)

1. Click "Login" → "Register"
2. Fill in the form with details above
3. Submit

### Option 2: Bulk Create Script

```bash
pnpm create-demo-users
```

## Mock Flight Data

All users have complete flight history stored in:

```
etihad-next/lib/data/mock-airline-data.json
```

### Data Includes:

- 50 total flights (10 per user)
- Trips spanning last 2-3 years
- Mix of domestic/international
- Various airlines and routes
- Complete booking details
- Payment and status information
- Baggage and meal preferences

### Airlines Featured:

- Emirates, Qatar Airways, Lufthansa
- British Airways, Air India, IndiGo
- Vistara, Delta, United
- Singapore Airlines, Iberia, Air China

### Airports Featured:

JFK, LAX, LHR, DXB, DOH, DEL, BOM, BCN, MAD, FRA, SIN, PEK, PVG

## Regenerating Mock Data

To generate fresh random flight data:

```bash
pnpm generate-mock-data
```

This creates new flights while keeping user profiles consistent.

## Testing Scenarios

### User Journey Tests

- ✅ New user registration
- ✅ Existing user login
- ✅ View flight history
- ✅ Search and book flights
- ✅ Manage bookings
- ✅ Profile management

### Data Queries

- "Show my last trip"
- "Which airline do I fly most?"
- "How much did I spend last year?"
- "My longest flight?"
- "Trips to Europe"
- "Cancelled flights"
- "Frequent flyer status"

## Notes

- All passwords are intentionally simple for demo purposes
- Mock data is synthetic and non-sensitive
- Flight data is realistic but randomly generated
- Suitable for demos, testing, and development
- Not for production use
