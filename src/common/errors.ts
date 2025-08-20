/**
 * Aistack-specific error codes to identify the type of error.
 */
export type AistackErrorCode =
  | 'MODEL_DOWNLOAD_FAILED'
  | 'MODEL_LOAD_FAILED'
  | 'INFERENCE_FAILED'
  | 'INVALID_OPTIONS'
  | 'INVALID_INPUT'
  | 'UNKNOWN'
  | 'INITIALIZATION_ERROR'
  | 'NOT_INITIALIZED'
  | 'PLATFORM_NOT_SUPPORTED'
  | 'RUNTIME_ERROR';

/**
 * Custom error class for all errors thrown by the Aistack library.
 */
export class AistackError extends Error {
  public readonly code: AistackErrorCode;
  public readonly underlyingError?: Error;

  constructor(
    message: string,
    code: AistackErrorCode,
    underlyingError?: Error
  ) {
    super(message);
    this.name = 'AistackError';
    this.code = code;
    this.underlyingError = underlyingError;
  }
}
