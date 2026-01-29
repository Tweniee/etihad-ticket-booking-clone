/**
 * Application Configuration
 *
 * Centralized configuration management for environment variables
 * Validates required environment variables and provides type-safe access
 */

/**
 * Validate required environment variable
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable with default value
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Database Configuration
 */
export const database = {
  url: getRequiredEnv("DATABASE_URL"),
} as const;

/**
 * Redis Configuration
 */
export const redis = {
  url: getRequiredEnv("REDIS_URL"),
} as const;

/**
 * Stripe Payment Configuration
 */
export const stripe = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  enabled: getOptionalEnv("ENABLE_STRIPE", "true") === "true",
} as const;

/**
 * Razorpay Payment Configuration
 */
export const razorpay = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  enabled: getOptionalEnv("ENABLE_RAZORPAY", "true") === "true",
} as const;

/**
 * SendGrid Email Configuration
 */
export const sendgrid = {
  apiKey: process.env.SENDGRID_API_KEY || "",
  fromEmail: process.env.SENDGRID_FROM_EMAIL || "noreply@etihad-booking.com",
  supportEmail:
    process.env.SENDGRID_SUPPORT_EMAIL || "support@etihad-booking.com",
  enabled: getOptionalEnv("ENABLE_EMAIL_NOTIFICATIONS", "true") === "true",
  skipSending: getOptionalEnv("SKIP_EMAIL_SENDING", "false") === "true",
} as const;

/**
 * Application Configuration
 */
export const app = {
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  env: getOptionalEnv("NODE_ENV", "development"),
  isDevelopment: getOptionalEnv("NODE_ENV", "development") === "development",
  isProduction: getOptionalEnv("NODE_ENV", "development") === "production",
  debug: getOptionalEnv("DEBUG", "false") === "true",
} as const;

/**
 * Security Configuration
 */
export const security = {
  sessionSecret:
    process.env.SESSION_SECRET || "default-session-secret-change-in-production",
  corsOrigins: getOptionalEnv("CORS_ORIGINS", "http://localhost:3000").split(
    ",",
  ),
} as const;

/**
 * Logging Configuration
 */
export const logging = {
  level: getOptionalEnv("LOG_LEVEL", "info"),
} as const;

/**
 * Validate all required configuration on startup
 */
export function validateConfig() {
  const errors: string[] = [];

  // Validate database
  if (!database.url) {
    errors.push("DATABASE_URL is required");
  }

  // Validate Redis
  if (!redis.url) {
    errors.push("REDIS_URL is required");
  }

  // Validate payment providers (at least one should be configured)
  const hasStripe = stripe.enabled && stripe.secretKey && stripe.publishableKey;
  const hasRazorpay = razorpay.enabled && razorpay.keyId && razorpay.keySecret;

  if (!hasStripe && !hasRazorpay) {
    errors.push(
      "At least one payment provider (Stripe or Razorpay) must be configured",
    );
  }

  // Validate email configuration
  if (sendgrid.enabled && !sendgrid.apiKey && !sendgrid.skipSending) {
    errors.push(
      "SENDGRID_API_KEY is required when email notifications are enabled",
    );
  }

  // Validate session secret in production
  if (
    app.isProduction &&
    security.sessionSecret === "default-session-secret-change-in-production"
  ) {
    errors.push("SESSION_SECRET must be set in production");
  }

  if (errors.length > 0) {
    console.error("Configuration validation failed:");
    errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error(
      "Invalid configuration. Please check your environment variables.",
    );
  }

  console.log("✓ Configuration validated successfully");
}

/**
 * Get active payment provider
 */
export function getActivePaymentProvider(): "stripe" | "razorpay" | null {
  if (stripe.enabled && stripe.secretKey && stripe.publishableKey) {
    return "stripe";
  }
  if (razorpay.enabled && razorpay.keyId && razorpay.keySecret) {
    return "razorpay";
  }
  return null;
}

/**
 * Export all configuration
 */
export const config = {
  database,
  redis,
  stripe,
  razorpay,
  sendgrid,
  app,
  security,
  logging,
  validate: validateConfig,
  getActivePaymentProvider,
} as const;

export default config;
