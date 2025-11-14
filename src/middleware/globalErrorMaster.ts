import type { Request, Response, NextFunction } from 'express';
import { error as logError } from '../utils/logger';

/**
 * @desc Global error handling middleware for Express.
 * Catches all unhandled errors and sends a structured JSON response.
 */
export async function globalErrorMaster(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Determine status code and message
    const status = typeof err?.status === 'number' && err.status >= 400 ? err.status : 500;
    const message = err?.message ?? 'Internal Server Error';

    // Build minimal log payload and redact large or sensitive values
    const logPayload: Record<string, unknown> = {
      statusCode: status,
      path: req.originalUrl ?? req.url,
      method: req.method,
      // Record error name and a trimmed stack if present
      errorName: err?.name ?? 'Error',
      stackTrace: typeof err?.stack === 'string' ? err.stack.split('\n').slice(0, 5).join('\n') : undefined,
      // Include user-identifying fields only if present (do not include headers/body by default)
      ip: req.ip,
      // Include a timestamp for easier correlation
      timestamp: new Date().toISOString(),
    };

    // Log the error. Keep log message short; include payload as meta.
    logError(message, 'GlobalException', logPayload);

    // Prepare response body depending on environment
    const isDev = process.env.NODE_ENV === 'development';

    // Compose response body
    const responseBody: Record<string, unknown> = {
      statusCode: status,
      message,
    };

    // Include extra debug info only in development (behaviour: verbose)
    if (isDev) {
      responseBody.timestamp = logPayload.timestamp;
      responseBody.path = logPayload.path;
      responseBody.method = logPayload.method;
      responseBody.errorName = logPayload.errorName;
      responseBody.stackTrace = err?.stack;
    }

    // Send JSON response and finish
    res.status(status).json(responseBody);
  } catch (handlerError) {
    // If the global handler itself throws, forward to next error handler
    // Do not attempt to log here to avoid recursive failures
    next(handlerError);
  }
}

export default globalErrorMaster;