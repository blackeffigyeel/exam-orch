import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * @desc SQL injection protection middleware.
 */

const MAX_SCAN_STRING_LENGTH = 1000; // Limit to avoid huge payloads
const MASKED_VALUE_PLACEHOLDER = "[TRUNCATED]";

/**
 * @desc Definition of conservative suspicious patterns.
 */
const suspiciousPatterns: RegExp[] = [
  /(\b(select|insert|update|delete|drop|create|alter|union|exec|execute)\b)/i,
  /(--|;|\/\*|\*\/|#)/, // comment tokens or statement terminator
  /(['"`]\s*or\s+['"`]|or\s+1=1|1=1)/i, // tautologies and classic payload fragments
  /\bconcat\s*\(/i, // concat function usage
];

/**
 * @desc Helper function for scanning value normalisation.
 */
const normaliseForScan = (value: unknown): string => {
  try {
    let s = String(value);
    // Decode percent-encoding safely (catch malformed sequences)
    try {
      s = decodeURIComponent(s);
    } catch {
      // Keep original if decodeURIComponent fails
    }
    // Replace common HTML entity encodings of single/double quotes
    s = s.replace(/&quot;|&#34;/gi, '"').replace(/&apos;|&#39;/gi, "'");
    // Trim and truncate
    if (s.length > MAX_SCAN_STRING_LENGTH) {
      s = s.slice(0, MAX_SCAN_STRING_LENGTH) + MASKED_VALUE_PLACEHOLDER;
    }
    return s.trim().toLowerCase();
  } catch {
    return "";
  }
};

/**
 * @desc Helper function for SQL injection pattern checking.
 */
const checkForSQLInjection = (value: string): boolean => {
  const normalised = normaliseForScan(value);
  // Quick reject for short safe tokens
  if (!normalised || normalised.length < 3) return false;

  // Require either a keyword match AND a punctuation token to reduce false positives.
  const keywordMatch = /\b(select|insert|update|delete|drop|create|alter|union|exec|execute)\b/i.test(normalised);
  const punctMatch = /(--|;|\/\*|\*\/|#|'|"|`)/.test(normalised);
  if (keywordMatch && punctMatch) return true;

  // Otherwise test general suspicious tokens as fallback
  return suspiciousPatterns.some((p) => p.test(normalised));
};

/**
 * @desc Helper function to recursively scan objects while preventing cycles.
 */
const scanObject = (obj: any, seen = new Set()): boolean => {
  if (obj == null) return false;
  if (seen.has(obj)) return false;
  seen.add(obj);

  if (typeof obj === "string") {
    return checkForSQLInjection(obj);
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return false;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (scanObject(item, seen)) return true;
    }
    return false;
  }

  if (typeof obj === "object") {
    // Iterate own enumerable properties only
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "string") {
        if (checkForSQLInjection(val)) return true;
      } else if (typeof val === "object" && val !== null) {
        if (scanObject(val, seen)) return true;
      }
    }
  }

  return false;
};

/**
 * @desc Helper function for sanitising the logged copy of an object by truncating long strings.
 */
const shallowSanitiseForLog = (obj: any): Record<string, unknown> => {
  const safe: Record<string, unknown> = {};
  if (!obj || typeof obj !== "object") return safe;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string") {
      safe[key] =
        val.length > 200 ? `${val.slice(0, 200)}${MASKED_VALUE_PLACEHOLDER}` : val;
    } else {
      safe[key] = val;
    }
  }
  return safe;
};

/**
 * @desc SQL injection protection middleware.
 * @param req {Request} - The request object.
 * @param res {Response} - The response object.
 * @param next {NextFunction} - The next middleware function.
 * @returns {void}
 */
export const sqlInjectionGuard = (req: Request, res: Response, next: NextFunction): void => {
  // Scan query parameters first and return on detection.
  if (req.query && scanObject(req.query)) {
    logger.warn("Block request: SQL injection detected in query parameters", {
      ip: req.ip,
      url: req.originalUrl,
      query: shallowSanitiseForLog(req.query),
    });
    res.status(400).json({
      success: false,
      error: { message: "Invalid request parameters" },
    });
    return;
  }

  // Scan request body and return on detection.
  if (req.body && scanObject(req.body)) {
    logger.warn("Block request: SQL injection detected in request body", {
      ip: req.ip,
      url: req.originalUrl,
      body: shallowSanitiseForLog(req.body),
    });
    res.status(400).json({
      success: false,
      error: { message: "Invalid request data" },
    });
    return;
  }

  // Allow the request to proceed.
  next();
};
