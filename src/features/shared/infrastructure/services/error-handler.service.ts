import { Injectable, Logger, Inject } from '@nestjs/common';
import { EntityManager, QueryFailedError } from 'typeorm';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { DomainException } from '@features/shared/exceptions/domain.exception';
import { UniqueConstraintException } from '@features/shared/exceptions/database/unique-constraint.exception';
import {
  ErrorHandlerPort,
  ErrorHandlerOptions,
} from '@features/shared/ports/error-handler.port';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class ErrorHandlerService implements ErrorHandlerPort {
  private readonly logger = new Logger(ErrorHandlerService.name);

  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  /**
   * Handles errors and creates activity logs for failed operations
   */
  async handleError(
    error: Error,
    options: ErrorHandlerOptions,
    manager: EntityManager,
  ): Promise<void> {
    const duration = Date.now() - options.startTime;

    this.logger.error(
      `Error in ${options.action}: ${error.message}`,
      error.stack,
    );

    // Create activity log for failed operation
    // Wrap in try-catch to prevent logging errors from cascading
    try {
      await this.activityLogRepository.create(
        new ActivityLog(
          options.action as any,
          options.entity as any,
          options.userId,
          {
            details: JSON.stringify(options.operationData || {}),
            description:
              options.failureDescription || `Failed ${options.action}`,
            ipAddress: options.requestInfo?.ipAddress,
            userAgent: options.requestInfo?.userAgent,
            sessionId: options.requestInfo?.sessionId,
            username: options.requestInfo?.username,
            isSuccess: false,
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
            statusCode: this.getStatusCodeFromError(error),
            duration,
            createdBy: options.userId,
          },
        ),
        manager,
      );
    } catch (loggingError: any) {
      // Log the logging error but don't let it interfere with the original error handling
      this.logger.error(
        `Failed to create activity log for error: ${error.message}. Logging error: ${loggingError.message}`,
        loggingError.stack,
      );
    }
  }

  /**
   * Creates activity log for successful operations
   */
  async logSuccess<T>(
    data: T,
    options: ErrorHandlerOptions,
    manager: EntityManager,
  ): Promise<void> {
    const duration = Date.now() - options.startTime;
    await this.activityLogRepository.create(
      new ActivityLog(
        options.action as any,
        options.entity as any,
        options.userId,
        {
          details: JSON.stringify(data),
          description:
            options.successDescription ||
            `Successfully completed ${options.action}`,
          ipAddress: options.requestInfo?.ipAddress,
          userAgent: options.requestInfo?.userAgent,
          sessionId: options.requestInfo?.sessionId,
          username: options.requestInfo?.username,
          isSuccess: true,
          statusCode: 200,
          duration,
          createdBy: options.userId,
        },
      ),
      manager,
    );
  }

  /**
   * Wraps a use case operation with centralized error handling
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions,
    manager: EntityManager,
  ): Promise<T> {
    try {
      const result = await operation();

      // Log success
      await this.logSuccess(result, options, manager);

      return result;
    } catch (error) {
      // Convert database errors to appropriate domain exceptions
      const convertedError = this.convertDatabaseError(error as Error);

      // Handle error
      await this.handleError(convertedError, options, manager);

      // Re-throw the converted error
      throw convertedError;
    }
  }

  /**
   * Determines HTTP status code from error type
   */
  private getStatusCodeFromError(error: Error): number {
    if (error instanceof DomainException) {
      return error.statusCode;
    }

    // Default to 500 for unknown errors
    return 500;
  }

  /**
   * Converts database errors to appropriate domain exceptions
   */
  private convertDatabaseError(error: Error): Error {
    if (error instanceof QueryFailedError) {
      // Check for unique constraint violations
      if (this.isUniqueConstraintViolation(error)) {
        const field = this.extractFieldFromConstraint(error);
        return new UniqueConstraintException(
          `A record with this ${field || 'information'} already exists`,
          field,
        );
      }

      // Check for foreign key constraint violations
      if (this.isForeignKeyConstraintViolation(error)) {
        return new DomainException(
          'Referenced record does not exist',
          'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          400,
        );
      }

      // Check for not null constraint violations
      if (this.isNotNullConstraintViolation(error)) {
        return new DomainException(
          'Required field cannot be empty',
          'NOT_NULL_CONSTRAINT_VIOLATION',
          400,
        );
      }
    }

    return error;
  }

  /**
   * Checks if the error is a unique constraint violation
   */
  private isUniqueConstraintViolation(error: QueryFailedError): boolean {
    const message = error.message.toLowerCase();
    const driverError = (error as any).driverError;

    return (
      message.includes('unique constraint') ||
      message.includes('duplicate key') ||
      message.includes('uq_') ||
      (driverError && driverError.code === '23505') // PostgreSQL unique violation error code
    );
  }

  /**
   * Checks if the error is a foreign key constraint violation
   */
  private isForeignKeyConstraintViolation(error: QueryFailedError): boolean {
    const message = error.message.toLowerCase();
    const driverError = (error as any).driverError;

    return (
      message.includes('foreign key constraint') ||
      message.includes('fk_') ||
      (driverError && driverError.code === '23503') // PostgreSQL foreign key violation error code
    );
  }

  /**
   * Checks if the error is a not null constraint violation
   */
  private isNotNullConstraintViolation(error: QueryFailedError): boolean {
    const message = error.message.toLowerCase();
    const driverError = (error as any).driverError;

    return (
      message.includes('not null constraint') ||
      message.includes('null value') ||
      (driverError && driverError.code === '23502') // PostgreSQL not null violation error code
    );
  }

  /**
   * Extracts the field name from constraint error message
   */
  private extractFieldFromConstraint(
    error: QueryFailedError,
  ): string | undefined {
    const message = error.message;

    // Try to extract field name from constraint name (e.g., "UQ_bc11a4f7c969b0c0e17ae268cdb")
    const constraintMatch = message.match(/constraint "([^"]+)"/);
    if (constraintMatch) {
      const constraintName = constraintMatch[1];
      // If it's a UQ_ constraint, try to extract meaningful field name
      if (constraintName.startsWith('UQ_')) {
        // This is a generic approach - you might want to customize based on your naming conventions
        return 'value';
      }
    }

    // Try to extract field name from column reference
    const columnMatch = message.match(/column "([^"]+)"/);
    if (columnMatch) {
      return columnMatch[1];
    }

    return undefined;
  }

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
  ): ErrorHandlerOptions {
    return {
      action,
      entity,
      userId,
      requestInfo,
      operationData,
      successDescription,
      failureDescription,
      startTime: Date.now(),
    };
  }
}
