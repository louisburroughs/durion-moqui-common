/**
 * HTTP Correlation ID Interceptor
 * 
 * This module provides utilities for adding X-Correlation-Id headers to HTTP requests
 * and extracting correlation IDs from responses for distributed tracing.
 * 
 * Pattern follows DECISION-INVENTORY-012 and DECISION-POSITIVITY-014:
 * - X-Correlation-Id is the standard correlation header
 * - W3C Trace Context (traceparent) is preferred when available
 * - Correlation ID is included in error responses for troubleshooting
 */

/**
 * Generate a UUID v4 for correlation ID
 */
export function generateCorrelationId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Add X-Correlation-Id header to fetch request options
 */
export function addCorrelationIdHeader(options: RequestInit = {}): RequestInit {
  const headers = new Headers(options.headers || {});
  
  // Only add if not already present
  if (!headers.has('X-Correlation-Id')) {
    headers.set('X-Correlation-Id', generateCorrelationId());
  }
  
  return {
    ...options,
    headers
  };
}

/**
 * Extract correlation ID from response headers or error body
 */
export function extractCorrelationId(response: Response): string | null {
  // Try to get from response header first
  const headerValue = response.headers.get('X-Correlation-Id');
  if (headerValue) {
    return headerValue;
  }
  
  // Will be extracted from error body by error handler
  return null;
}

/**
 * Fetch wrapper with automatic correlation ID injection
 */
export async function fetchWithCorrelation(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const enhancedOptions = addCorrelationIdHeader(options);
  const response = await fetch(url, enhancedOptions);
  
  // Log correlation ID for debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    const correlationId = extractCorrelationId(response);
    if (correlationId) {
      console.debug(`[HTTP] ${options?.method || 'GET'} ${url} - Correlation-Id: ${correlationId}`);
    }
  }
  
  return response;
}

/**
 * Parse error response and extract correlation ID
 */
export async function parseErrorResponse(response: Response): Promise<{
  errorCode?: string;
  message?: string;
  correlationId?: string;
  fieldErrors?: Record<string, string>;
}> {
  try {
    const body = await response.json();
    return {
      errorCode: body.errorCode,
      message: body.message,
      correlationId: body.correlationId || extractCorrelationId(response),
      fieldErrors: body.fieldErrors
    };
  } catch (e) {
    // If JSON parsing fails, return basic error with correlation from header
    return {
      errorCode: 'UNKNOWN_ERROR',
      message: response.statusText,
      correlationId: extractCorrelationId(response) || undefined
    };
  }
}

/**
 * Format error message with correlation ID for display
 */
export function formatErrorWithCorrelation(
  message: string,
  correlationId?: string
): string {
  if (correlationId) {
    return `${message} (Correlation ID: ${correlationId})`;
  }
  return message;
}

// Export types
export interface CorrelatedError {
  errorCode?: string;
  message: string;
  correlationId?: string;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
}
