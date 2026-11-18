import { HttpErrorResponse } from '@angular/common/http';

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  errorMessages?: string[];
  result: T | null;
}

/**
 * Generic Backend Error Payload.
 * TResult: Type of the 'result' property (e.g. backend GlobalException or null)
 * TErrorCode: Specific string literal union for custom business codes
 */
export interface ApiErrorPayload<TResult = unknown, TErrorCode extends string = string> {
  statusCode: number;
  success: boolean;
  errorMessages?: string[];
  errorCode?: TErrorCode;
  message?: string;
  result?: TResult | null;
}

/**
 * Strongly-typed HttpErrorResponse with generic error payload
 */
export type TypedHttpError<TErrorCode extends string = string, TResult = unknown> =
  HttpErrorResponse & {
    readonly error: ApiErrorPayload<TResult, TErrorCode> | null;
  };

/**
 * Extracts a user-facing error message from an unknown or strongly-typed HTTP error.
 */
export function getBackendErrorMessage<TCode extends string = string>(
  err: TypedHttpError<TCode> | unknown,
  fallback = 'An unexpected error occurred'
): string {
  if (!(err instanceof HttpErrorResponse)) {
    return err instanceof Error ? err.message : fallback;
  }

  const payload = err.error as ApiErrorPayload<unknown, TCode> | null;

  if (Array.isArray(payload?.errorMessages) && payload.errorMessages.length > 0) {
    return payload.errorMessages.join(', ');
  }

  if (typeof payload?.errorMessages === 'string' && (payload.errorMessages as string).trim().length > 0) {
    return payload.errorMessages;
  }

  if (typeof payload?.message === 'string' && payload.message.trim().length > 0) {
    return payload.message;
  }

  return fallback;
}