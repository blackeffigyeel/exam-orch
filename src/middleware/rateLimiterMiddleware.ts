import { Request, Response, NextFunction } from 'express';
import { info, warn, error } from '../utils/logger';
import getClientIP from '../utils/getDeviceIP';
import { fetchIPRange } from '../services/rateLimiter/utils/rateLimiterUtils';

// ---------------------------------------------------------------
// In-memory data store (auto-cleared on server restart)
// ---------------------------------------------------------------

interface RateRecord {
  userId?: string | null;
  requestTimestamps: number[];
  blockedUntil?: number | null;
  permanentBlock?: boolean;
  temporaryBlockCount: number;
  lastTempBlockTime?: number | null;
}

const rateStore = new Map<string, RateRecord>();

// ---------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------

const WINDOW_MS = 5 * 60 * 1000;          // 5 minutes
const DEFAULT_MAX_REQUESTS = 25;
const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const TEMP_BLOCK_MS = 5 * 60 * 1000; // temporary block length
const TEMP_THRESHOLD = 2; // two blocks => permanent ban

const DELAY_AFTER = 25;                   // slowdown threshold
const DELAY_MS = 500;                     // multiplier for slowdown

// ---------------------------------------------------------------
// Utility function — fetch or create rate entry
// ---------------------------------------------------------------

function getOrCreate(ipRange: string): RateRecord {
  let entry = rateStore.get(ipRange);

  if (!entry) {
    entry = {
      userId: null,
      requestTimestamps: [],
      blockedUntil: null,
      permanentBlock: false,
      temporaryBlockCount: 0,
      lastTempBlockTime: null
    };

    rateStore.set(ipRange, entry);
  }

  return entry;
}

// ---------------------------------------------------------------
// Middleware 1: Verify block status
// ---------------------------------------------------------------

export async function blockVerify(req: Request, res: Response, next: NextFunction) {
  const ipAddress = getClientIP(req);
  const ipRange = fetchIPRange(ipAddress);
  const now = Date.now();

  const record = getOrCreate(ipRange);

  // Check permanent block first
  if (record.permanentBlock) {
    warn(`Permanent block for IP ${ipRange}`, 'RateLimiter');
    return res.status(403).json({
      success: false,
      message: 'Access permanently denied due to repeated misuse.',
      blockType: 'permanent'
    });
  }

  // Check temporary block
  if (record.blockedUntil && record.blockedUntil > now) {
    warn(`Temporary block for IP ${ipRange}`, 'RateLimiter');
    return res.status(429).json({
      success: false,
      message: 'You are temporarily blocked. Please try again later.',
      blockType: 'temporary'
    });
  }

  // If temporary block elapsed, reset marker
  if (record.blockedUntil && record.blockedUntil <= now) {
    record.blockedUntil = null;
    record.lastTempBlockTime = now;
  }

  return next();
}

// ---------------------------------------------------------------
// Middleware 2: Rate Limiter (Sliding Window)
// ---------------------------------------------------------------

export async function limiter(req: Request, res: Response, next: NextFunction) {
  const ipAddress = getClientIP(req);
  const ipRange = fetchIPRange(ipAddress);
  const now = Date.now();

  const record = getOrCreate(ipRange);

  // Remove timestamps outside the sliding window
  record.requestTimestamps = record.requestTimestamps.filter(
    ts => now - ts < DEFAULT_WINDOW_MS
  );

  record.requestTimestamps.push(now);

  // If user exceeds safe request count
  if (record.requestTimestamps.length > DEFAULT_MAX_REQUESTS) {
    // Apply temporary block if not already blocked
    if (!record.blockedUntil || record.blockedUntil <= now) {
      record.blockedUntil = now + TEMP_BLOCK_MS;

      // Increase temporary block count
      if (record.lastTempBlockTime && now - record.lastTempBlockTime <= 5 * 60 * 1000) {
        record.temporaryBlockCount += 1;
      } else {
        record.temporaryBlockCount = 1;
      }

      record.lastTempBlockTime = now;

      warn(`Temporary block set for IP ${ipRange}`, 'RateLimiter');

      // Check if permanent ban threshold reached
      if (record.temporaryBlockCount >= TEMP_THRESHOLD) {
        record.permanentBlock = true;
        warn(`Permanent block applied to IP ${ipRange}`, 'RateLimiter');

        return res.status(403).json({
          success: false,
          message: 'Access permanently denied due to repeated misuse.',
          blockType: 'permanent'
        });
      }

      return res.status(429).json({
        success: false,
        message: 'Too many requests. You are temporarily blocked.',
        blockType: 'temporary'
      });
    }
  }

  return next();
}

// ---------------------------------------------------------------
// Middleware 3 — slowLimiter (progressive delays after threshold)
// ---------------------------------------------------------------

export function slowLimiter(req: Request, res: Response, next: NextFunction) {
  const ipAddress = getClientIP(req);
  const ipRange = fetchIPRange(ipAddress);
  const now = Date.now();

  const record = getOrCreate(ipRange);

  // Clean timestamps
  record.requestTimestamps = record.requestTimestamps.filter(
    ts => now - ts < WINDOW_MS
  );

  const count = record.requestTimestamps.length;

  if (count <= DELAY_AFTER) {
    return next();
  }

  const excess = count - DELAY_AFTER;
  const delay = excess * DELAY_MS;

  warn(`SlowLimiter delaying IP ${ipRange} by ${delay}ms`, 'SlowLimiter');

  setTimeout(() => next(), delay);
}

// ---------------------------------------------------------------
// Periodic clean-up of old entries to prevent data leak
// ---------------------------------------------------------------

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateStore.entries()) {
    // Remove old inactive entries to avoid memory growth
    if (
      (!record.blockedUntil || record.blockedUntil < now) &&
      record.requestTimestamps.every(ts => now - ts > DEFAULT_WINDOW_MS)
    ) {
      rateStore.delete(ip);
    }
  }
}, 10 * 60 * 1000); // run every 10 minutes
