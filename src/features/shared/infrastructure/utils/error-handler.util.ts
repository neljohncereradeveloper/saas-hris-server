import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

/**
 * Utility function to create standardized error handler options for use cases
 */
export function createUseCaseErrorHandlerOptions(
  errorHandler: ErrorHandlerPort,
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
) {
  return errorHandler.createOptions(
    action,
    entity,
    userId,
    operationData,
    requestInfo,
    successDescription,
    failureDescription,
  );
}

/**
 * Common error handler options for CRUD operations
 */
export const COMMON_ERROR_HANDLER_OPTIONS = {
  CREATE_BARANGAY: {
    action: CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
    entity: CONSTANTS_DATABASE_MODELS.BARANGAY,
  },
  UPDATE_BARANGAY: {
    action: CONSTANTS_LOG_ACTION.UPDATE_BARANGAY,
    entity: CONSTANTS_DATABASE_MODELS.BARANGAY,
  },
  DELETE_BARANGAY: {
    action: CONSTANTS_LOG_ACTION.SOFT_DELETE_BARANGAY,
    entity: CONSTANTS_DATABASE_MODELS.BARANGAY,
  },
  // Add more common operations as needed
} as const;
