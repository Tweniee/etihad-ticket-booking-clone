# User and Travel History Data

## Overview

This database contains user profiles and their travel history for personalized flight recommendations and chatbot interactions.

## Tables

### user_info

Stores user profile information.

| Column       | Type         | Description                                                     |
| ------------ | ------------ | --------------------------------------------------------------- |
| user_id      | SERIAL       | Primary key                                                     |
| category     | VARCHAR(50)  | User category (New Traveller, Family with kids, Frequent Flyer) |
| name         | VARCHAR(100) | User's full name                                                |
| citizenship  | VARCHAR(50)  | Country of citizenship                                          |
| uae_resident | BOOLEAN      | Whether user is a UAE resident                                  |
| details      | TEXT         | Additional user details                                         |
| created_at   | TIMESTAMP    | Record creation timestamp                                       |

### travel_history

Stores historical travel records for each user.

| Column      | Type        | Description                           |
| ----------- | ----------- | ------------------------------------- |
| travel_id   | SERIAL      | Primary key                           |
| user_id     | INTEGER     | Foreign key to user_info              |
| destination | VARCHAR(50) | Travel destination country            |
| travel_date | DATE        | Date of travel                        |
| purpose     | VARCHAR(50) | Purpose of travel (Leisure, Business) |
| created_at  | TIMESTAMP   | Record creation timestamp             |

## Sample Data

### Users (4 total)

1. **John Smith** (ID: 1)
   - Category: New Traveller
   - Citizenship: UK
   - UAE Resident: Yes
   - Details: New to travel

2. **David Brown** (ID: 2)
   - Category: Family with kids
   - Citizenship: France
   - UAE Resident: No
   - Details: Family of four - mom, dad and 2 children (1 year, 3 years)
   - Travel History: 10 trips (mostly leisure to UK, Spain, UAE, France, Italy, Germany, Switzerland)

3. **Salman Khan** (ID: 3)
   - Category: Frequent Flyer
   - Citizenship: India
   - UAE Resident: Yes
   - Details: Couple traveller, for leisure
   - Travel History: 12 trips (leisure to Spain, Austria, India, Thailand, Singapore, Malaysia, UAE, Maldives)

4. **Rishi Patel** (ID: 4)
   - Category: Frequent Flyer
   - Citizenship: India
   - UAE Resident: No
   - Details: Single traveller, more for business purpose
   - Travel History: 12 trips (mostly business to UK, UAE, US, Germany, Singapore, Canada, Australia)

## Usage

### Seeding Data

```bash
# Automatically seeded when running start.sh
./start.sh

# Or manually seed
npm run seed-user-travel
```

### Querying Data

```sql
-- Get all users
SELECT * FROM user_info;

-- Get user with travel history
SELECT u.name, u.category, t.destination, t.travel_date, t.purpose
FROM user_info u
LEFT JOIN travel_history t ON u.user_id = t.user_id
WHERE u.user_id = 2
ORDER BY t.travel_date DESC;

-- Get frequent destinations by user
SELECT user_id, destination, COUNT(*) as visit_count
FROM travel_history
GROUP BY user_id, destination
ORDER BY user_id, visit_count DESC;

-- Get travel statistics
SELECT
    u.name,
    COUNT(t.travel_id) as total_trips,
    COUNT(DISTINCT t.destination) as unique_destinations,
    MIN(t.travel_date) as first_trip,
    MAX(t.travel_date) as last_trip
FROM user_info u
LEFT JOIN travel_history t ON u.user_id = t.user_id
GROUP BY u.user_id, u.name;
```

### Using with Chatbot

The chatbot can access this data to provide personalized recommendations:

- User profile information for context
- Travel history for pattern analysis
- Destination preferences
- Travel frequency and recency
- Purpose of travel (business vs leisure)

## File Location

- SQL File: `prisma/data.sql`
- Seed Script: `scripts/seed-user-travel-data.sh`
