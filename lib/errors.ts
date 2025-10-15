/**
 * Custom error classes and error handling utilities
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ZoomInfoError extends APIError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, 'ZOOMINFO_ERROR');
    this.name = 'ZoomInfoError';
  }
}

export class HubSpotError extends APIError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, 'HUBSPOT_ERROR');
    this.name = 'HubSpotError';
  }
}

export class ClaudeError extends APIError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, 'CLAUDE_ERROR');
    this.name = 'ClaudeError';
  }
}

export class DatabaseError extends APIError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Retry on network errors, rate limits, and temporary server errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  if (error instanceof APIError) {
    // Retry on rate limits (429) and server errors (500-599)
    return error.statusCode === 429 || (error.statusCode >= 500 && error.statusCode < 600);
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Handle API errors and return appropriate response
 */
export function handleAPIError(error: any) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: error.message,
        code: error.code,
      }),
    };
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }),
  };
}
