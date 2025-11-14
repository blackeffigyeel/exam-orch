interface AdditionalData {
  retryAfter?: number; // Optional retry-after time in seconds
  details?: string;    // Optional additional info message
  [key: string]: any;  // Allow additional properties
}

/**
 * Base HTTP error class
 */
class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly additionalData?: AdditionalData;
  public readonly retryAfter?: number;
  public readonly details?: string;  

  constructor(
    message: string,
    statusCode: number,
    additionalData?: AdditionalData
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.additionalData = additionalData;

    // Add any additional properties
    if (additionalData) {
      Object.assign(this, additionalData);
    }

    // Set the prototype explicitly to fix instanceof
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

class NotFoundError extends HttpError {
  constructor(message: string = 'Resource not found', additionalData?: AdditionalData) {
    super(message, 404, additionalData);
  }
}

class BadRequestError extends HttpError {
  constructor(message: string = 'Bad request', additionalData?: AdditionalData) {
    super(message, 400, additionalData);
  }
}

class UnauthorisedError extends HttpError {
  constructor(message: string = 'Unauthorised', additionalData?: AdditionalData) {
    super(message, 401, additionalData);
  }
}

class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden', additionalData?: AdditionalData) {
    super(message, 403, additionalData);
  }
}

class InternalServerError extends HttpError {
  constructor(message: string = 'Internal server error', additionalData?: AdditionalData) {
    super(message, 500, additionalData);
  }
}

class TooManyRequestsError extends HttpError {
  constructor(message: string = 'Too many requests', additionalData?: AdditionalData) {
    super(message, 429, additionalData);
  }
}

// Usage example:
// try {
//   throw new NotFoundError('User not found', { 
//     retryAfter: 60, 
//     details: 'User ID does not exist in the database' 
//   });
// } catch (error) {
//   if (error instanceof HttpError) {
//     console.log(error.statusCode); // 404
//     console.log(error.message);    // 'User not found'
//     console.log(error.retryAfter); // 60
//   }
// }

export {
  HttpError,
  NotFoundError,
  BadRequestError,
  UnauthorisedError,
  ForbiddenError,
  InternalServerError,
  TooManyRequestsError,
  type AdditionalData
};