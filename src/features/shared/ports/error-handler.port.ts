import { EntityManager } from 'typeorm';

export interface ErrorHandlerOptions {
  action: string;
  entity: string;
  userId: string;
  requestInfo?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    username?: string;
  };
  operationData?: any;
  successDescription?: string;
  failureDescription?: string;
  startTime: number;
}

export interface ErrorHandlerResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
}

export interface ErrorHandlerPort {
  /**
   * Handles errors and creates activity logs for failed operations
   */
  handleError(
    error: Error,
    options: ErrorHandlerOptions,
    manager: EntityManager,
  ): Promise<void>;

  /**
   * Creates activity log for successful operations
   */
  logSuccess<T>(
    data: T,
    options: ErrorHandlerOptions,
    manager: EntityManager,
  ): Promise<void>;

  /**
   * Wraps a use case operation with centralized error handling
   */
  executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions,
    manager: EntityManager,
  ): Promise<T>;

  /**
   * Creates standardized error handler options
   */
  createOptions(
    action: string,
    entity: string,
    userId: string,
    operationData?: any,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
    successDescription?: string,
    failureDescription?: string,
  ): ErrorHandlerOptions;
}
