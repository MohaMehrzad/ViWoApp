import { Throttle } from '@nestjs/throttler';

// Strict rate limiting for authentication endpoints (5 requests per minute)
export const AuthThrottle = () => Throttle({ default: { limit: 5, ttl: 60000 } });

// Moderate rate limiting for file uploads (10 requests per minute)
export const UploadThrottle = () => Throttle({ default: { limit: 10, ttl: 60000 } });

// Lenient rate limiting for general API endpoints (100 requests per minute)
export const ApiThrottle = () => Throttle({ default: { limit: 100, ttl: 60000 } });

// Very strict rate limiting for password reset/sensitive actions (3 requests per 5 minutes)
export const SensitiveThrottle = () => Throttle({ default: { limit: 3, ttl: 300000 } });

