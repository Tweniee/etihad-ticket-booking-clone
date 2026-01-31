# Chatbot Authentication Flow

## Overview

The chatbot sends JWT tokens to the external AI service at `http://74.162.57.122:8000/chat/stream` for user identification and personalized responses.

## Authentication Flow

### 1. User Login

```
User → LoginModal → /api/auth/login → Sets httpOnly cookie
```

- User selects their profile from the dropdown
- Login API creates JWT token with user info (userId, name, category)
- Token is stored in httpOnly cookie named `auth-token`

### 2. Token Retrieval for Chatbot

```
ChatbotButton → /api/auth/token → Returns JWT token
```

Since the auth cookie is `httpOnly`, JavaScript cannot access it directly via `document.cookie`. Instead:

- ChatbotButton calls `/api/auth/token` endpoint
- Server reads the httpOnly cookie
- Returns the token in JSON response
- ChatbotButton uses this token for AI API calls

### 3. Chatbot API Call

```
ChatbotButton → http://74.162.57.122:8000/chat/stream (with Bearer token)
```

Request format:

```javascript
fetch("http://74.162.57.122:8000/chat/stream", {
  method: "POST",
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // JWT token here
  },
  body: JSON.stringify({
    message: "user message here",
  }),
});
```

## Code Locations

### Token Creation

- **File**: `lib/utils/auth.ts`
- **Function**: `createToken(payload: JWTPayload)`
- **Cookie Setting**: `setAuthCookie(token: string)`

### Token Retrieval Endpoint

- **File**: `app/api/auth/token/route.ts`
- **Method**: GET
- **Returns**: `{ token: string }`
- **Auth Required**: Yes (reads from httpOnly cookie)

### Chatbot Component

- **File**: `components/shared/ChatbotButton.tsx`
- **Token Fetch**: `getAuthToken()` - async function
- **Usage**: Attaches token to AI API requests

## JWT Payload Structure

```typescript
interface JWTPayload {
  userId: number; // From user_info table
  name: string; // User's full name
  category: string; // User category (New Traveller, Frequent Flyer, etc.)
  [key: string]: unknown;
}
```

## Security Considerations

1. **httpOnly Cookie**: Prevents XSS attacks by making token inaccessible to JavaScript
2. **Secure Flag**: Enabled in production to require HTTPS
3. **SameSite**: Set to 'lax' to prevent CSRF attacks
4. **Token Expiry**: 7 days (configurable in `lib/utils/auth.ts`)

## Testing

### Check if user is logged in:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: auth-token=YOUR_TOKEN_HERE"
```

### Get token for chatbot:

```bash
curl http://localhost:3000/api/auth/token \
  -H "Cookie: auth-token=YOUR_TOKEN_HERE"
```

### Test chatbot with token:

```bash
curl -X POST http://74.162.57.122:8000/chat/stream \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

## Troubleshooting

### Token not being sent

1. Check if user is logged in: Open browser DevTools → Application → Cookies
2. Look for `auth-token` cookie
3. If missing, user needs to log in via LoginModal

### Token retrieval fails

1. Check `/api/auth/token` endpoint returns 200
2. Verify httpOnly cookie exists
3. Check browser console for errors

### AI API returns 401

1. Token might be expired (7 days)
2. Token format might be incorrect
3. AI service might not recognize the token

## Environment Variables

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_ALGORITHM="HS256"  # Optional, defaults to HS256
```

## User Data for Testing

Available test users (from `user_info` table):

1. John Smith (New Traveller)
2. David Brown (Family with kids)
3. Salman Khan (Frequent Flyer)
4. Rishi Patel (Frequent Flyer - Business)

Login via the UI to get a valid token.
