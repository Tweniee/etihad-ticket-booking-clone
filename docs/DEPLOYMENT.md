# Deployment Guide

This guide covers deploying the Etihad Airways Flight Booking System to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Redis Setup](#redis-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Production Database**: PostgreSQL instance (Vercel Postgres, Supabase, Railway, etc.)
3. **Production Redis**: Redis instance (Upstash, Redis Cloud, etc.)
4. **Payment Provider**: Razorpay or Stripe account with production credentials
5. **Email Service**: SendGrid account with verified sender domain
6. **Domain** (optional): Custom domain for your application

## Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Project

From your project directory:

```bash
vercel link
```

Follow the prompts to:

- Select your Vercel scope (personal or team)
- Link to existing project or create new one
- Confirm project settings

### Step 4: Configure Environment Variables

#### Option A: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all required variables (see [Environment Variables](#environment-variables) section)

#### Option B: Using Vercel CLI

```bash
# Set production environment variables
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add SENDGRID_API_KEY production
# ... add all other variables
```

### Step 5: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 6: Run Database Migrations

After deployment, run migrations:

```bash
# Pull production environment variables
vercel env pull .env.production

# Run migrations
pnpm prisma migrate deploy
```

## Environment Variables

### Required Variables

Add these environment variables in Vercel:

#### Database

```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

#### Redis

```
REDIS_URL=redis://default:password@host:port
```

#### Payment Provider (Razorpay)

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
ENABLE_RAZORPAY=true
```

#### Payment Provider (Stripe)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
ENABLE_STRIPE=true
```

#### Email Service

```
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_SUPPORT_EMAIL=support@yourdomain.com
ENABLE_EMAIL_NOTIFICATIONS=true
```

#### Application

```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
SESSION_SECRET=<generate-random-string>
```

#### Security

```
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Generate Session Secret

```bash
openssl rand -base64 32
```

## Database Setup

### Option 1: Vercel Postgres

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Copy the connection string
5. Add as `DATABASE_URL` environment variable

### Option 2: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **Database**
3. Copy connection string (use "Connection pooling" for serverless)
4. Add as `DATABASE_URL` environment variable

### Option 3: Railway

1. Create project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy connection string from service variables
4. Add as `DATABASE_URL` environment variable

### Run Migrations

After setting up the database:

```bash
# Pull environment variables
vercel env pull .env.production

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy
```

## Redis Setup

### Option 1: Upstash (Recommended for Vercel)

1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Select region closest to your Vercel deployment
4. Copy connection string (use REST API for serverless)
5. Add as `REDIS_URL` environment variable

### Option 2: Redis Cloud

1. Create account at [redis.com](https://redis.com)
2. Create database
3. Copy connection string
4. Add as `REDIS_URL` environment variable

## Post-Deployment

### 1. Verify Deployment

Check that your application is running:

```bash
curl https://yourdomain.com/api/health
```

### 2. Test Payment Integration

1. Make a test booking with test payment credentials
2. Verify payment processing works
3. Check booking confirmation email is sent

### 3. Configure Webhooks

#### Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret
5. Add as `STRIPE_WEBHOOK_SECRET` environment variable

#### Razorpay Webhooks

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/webhooks)
2. Add webhook: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret
5. Update webhook verification in your code

### 4. Configure Custom Domain

1. Go to Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_APP_URL` environment variable

### 5. Set Up Monitoring

#### Vercel Analytics

1. Go to project settings
2. Enable **Analytics**
3. Enable **Speed Insights**

#### Error Tracking (Optional)

Consider integrating:

- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Datadog](https://www.datadoghq.com) for APM

## Monitoring

### Health Checks

Monitor these endpoints:

- `GET /api/health` - Application health
- `GET /api/health/db` - Database connectivity
- `GET /api/health/redis` - Redis connectivity

### Vercel Logs

View logs in real-time:

```bash
vercel logs --follow
```

Or in the Vercel dashboard:

1. Go to your project
2. Navigate to **Deployments**
3. Click on a deployment
4. View **Runtime Logs**

### Database Monitoring

#### Prisma Studio (Development Only)

```bash
pnpm prisma studio
```

#### Production Monitoring

Use your database provider's monitoring tools:

- Vercel Postgres: Built-in metrics
- Supabase: Database dashboard
- Railway: Metrics tab

### Redis Monitoring

Use your Redis provider's monitoring tools:

- Upstash: Dashboard metrics
- Redis Cloud: Monitoring tab

## Troubleshooting

### Deployment Fails

**Problem**: Build fails during deployment

**Solutions**:

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` is accessible during build
4. Check Prisma schema is valid: `pnpm prisma validate`

### Database Connection Issues

**Problem**: Cannot connect to database in production

**Solutions**:

1. Verify `DATABASE_URL` is correct
2. Check database allows connections from Vercel IPs
3. For Supabase, use connection pooling URL
4. Test connection: `pnpm prisma db pull`

### Redis Connection Issues

**Problem**: Session management not working

**Solutions**:

1. Verify `REDIS_URL` is correct
2. Check Redis instance is accessible
3. For Upstash, ensure using correct connection string
4. Test connection with Redis CLI

### Payment Processing Issues

**Problem**: Payments failing in production

**Solutions**:

1. Verify using production API keys (not test keys)
2. Check webhook endpoints are configured
3. Review payment provider dashboard for errors
4. Verify `NEXT_PUBLIC_APP_URL` is correct

### Email Sending Issues

**Problem**: Emails not being sent

**Solutions**:

1. Verify SendGrid API key is correct
2. Check sender email is verified
3. Review SendGrid activity logs
4. Verify `SENDGRID_FROM_EMAIL` matches verified sender

### Performance Issues

**Problem**: Application is slow

**Solutions**:

1. Enable Vercel Edge Caching
2. Optimize database queries
3. Add database indexes
4. Use Redis for caching
5. Enable Vercel Speed Insights

### CORS Issues

**Problem**: API requests blocked by CORS

**Solutions**:

1. Verify `CORS_ORIGINS` includes your domain
2. Check API routes have correct CORS headers
3. Ensure `NEXT_PUBLIC_APP_URL` matches your domain

## Rollback

If you need to rollback to a previous deployment:

### Using Vercel Dashboard

1. Go to **Deployments**
2. Find the previous working deployment
3. Click **⋯** → **Promote to Production**

### Using Vercel CLI

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

## Continuous Deployment

### GitHub Integration

1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy:
   - **Production**: Pushes to `main` branch
   - **Preview**: Pull requests and other branches

### Environment-Specific Deployments

Configure different environments:

```bash
# Preview environment
vercel env add VARIABLE_NAME preview

# Production environment
vercel env add VARIABLE_NAME production
```

## Security Checklist

Before going live:

- [ ] All environment variables are set
- [ ] Using production API keys (not test keys)
- [ ] `SESSION_SECRET` is a strong random string
- [ ] Database has proper access controls
- [ ] Redis has authentication enabled
- [ ] CORS is properly configured
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Security headers are configured (in `vercel.json`)
- [ ] Rate limiting is enabled for API routes
- [ ] Input validation is in place
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection is enabled

## Performance Checklist

- [ ] Database indexes are created
- [ ] Redis caching is enabled
- [ ] Images are optimized (Next.js Image component)
- [ ] Code splitting is enabled (automatic with Next.js)
- [ ] API routes are optimized
- [ ] Vercel Analytics is enabled
- [ ] Speed Insights is enabled

## Support

For deployment issues:

- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Contact Vercel Support
- Check project logs and error messages

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Upstash Documentation](https://docs.upstash.com)
- [SendGrid Documentation](https://docs.sendgrid.com)
