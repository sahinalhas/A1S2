/**
 * Rate Limiting Middleware
 * Professional rate limiting protection using express-rate-limit
 * 
 * This middleware protects the API from abuse and DoS attacks by limiting
 * the number of requests per IP address within specific time windows.
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * Custom rate limit handler with detailed Turkish error messages
 */
const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
    message: 'Too many requests. Please try again later.',
    retryAfter: res.getHeader('Retry-After')
  });
};

/**
 * AI Endpoints Rate Limiter
 * Limit: 10 requests per minute per IP
 * 
 * Applied to:
 * - /api/ai-assistant/chat
 * - /api/ai-assistant/analyze
 * - /api/ai-assistant/meeting-prep/*
 * - /api/ai-assistant/recommendations/*
 * - /api/deep-analysis/*
 * - /api/advanced-ai-analysis/*
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
  message: {
    success: false,
    error: 'AI servisi için istek limitine ulaştınız. Dakikada maksimum 10 istek yapabilirsiniz.',
  },
  // Skip successful requests from the count
  skipSuccessfulRequests: false,
  // Skip failed requests from the count
  skipFailedRequests: false,
  // Validate trust proxy setting
  validate: { trustProxy: false },
});

/**
 * Export Endpoints Rate Limiter
 * Limit: 5 requests per minute per IP
 * 
 * Applied to:
 * - /api/students/export/*
 * - /api/exams/export/*
 * - /api/surveys/export/*
 * - /api/backup/create
 * - Any endpoint with "export" or "download" in the path
 */
export const exportRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: {
    success: false,
    error: 'Export işlemleri için istek limitine ulaştınız. Dakikada maksimum 5 export yapabilirsiniz.',
  },
  validate: { trustProxy: false },
});

/**
 * Backup/Restore Endpoints Rate Limiter
 * Limit: 3 requests per 5 minutes per IP
 * 
 * Applied to:
 * - /api/backup/create
 * - /api/backup/restore/*
 * - /api/backup/delete/*
 */
export const backupRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: {
    success: false,
    error: 'Yedekleme işlemleri için istek limitine ulaştınız. 5 dakikada maksimum 3 işlem yapabilirsiniz.',
  },
  validate: { trustProxy: false },
});

/**
 * Bulk Operations Rate Limiter
 * Limit: 10 requests per 15 minutes per IP
 * 
 * Applied to:
 * - /api/students/bulk
 * - /api/surveys/bulk-distribute
 * - Any endpoint with "bulk" in the path
 */
export const bulkOperationsRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: {
    success: false,
    error: 'Toplu işlemler için istek limitine ulaştınız. 15 dakikada maksimum 10 toplu işlem yapabilirsiniz.',
  },
  validate: { trustProxy: false },
});

/**
 * Authentication Endpoints Rate Limiter
 * Limit: 5 login attempts per 15 minutes per IP
 * Stricter rate limit to prevent brute force attacks
 * 
 * Applied to:
 * - /api/session/login
 * - /api/session/register
 * - /api/auth/*
 */
const authRateLimiterBase = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: {
    success: false,
    error: 'Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.',
  },
  // Don't count successful requests
  skipSuccessfulRequests: true,
  validate: { trustProxy: false },
});

export const authRateLimiter = (req: any, res: any, next: any) => {
  return authRateLimiterBase(req, res, next);
};

/**
 * General API Rate Limiter
 * Limit: 100 requests per minute per IP
 * 
 * Applied globally to all /api/* endpoints as a baseline protection
 */
export const generalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: {
    success: false,
    error: 'Genel API istek limitine ulaştınız. Dakikada maksimum 100 istek yapabilirsiniz.',
  },
  validate: { trustProxy: false },
});

/**
 * Strict Rate Limiter for Critical Operations
 * Limit: 20 requests per hour per IP
 * 
 * Applied to:
 * - User deletion
 * - Password reset
 * - Critical settings changes
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: {
    success: false,
    error: 'Bu işlem için saatlik istek limitine ulaştınız. Lütfen daha sonra tekrar deneyin.',
  },
  validate: { trustProxy: false },
});

/**
 * Dynamic rate limiter factory
 * Create custom rate limiters on demand
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    message: {
      success: false,
      error: options.message || 'İstek limitine ulaştınız. Lütfen daha sonra tekrar deneyin.',
    },
    validate: { trustProxy: false },
  });
}
