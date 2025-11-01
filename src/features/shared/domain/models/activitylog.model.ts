export class ActivityLog {
  id: number;
  action: string; // e.g., 'CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT'
  entity: string; // e.g., 'Client'
  details: string | null; // JSON string containing the details of the activity
  metadata: string | null; // Additional metadata as JSON string
  ipAddress: string | null; // IP address of the user
  userAgent: string | null; // User agent string
  sessionId: string | null; // Session ID
  userId: string; // ID of the user who performed the action
  username: string | null; // Username for display purposes
  description: string | null; // Description of the action
  isSuccess: boolean; // Whether the action was successful
  errorMessage: string | null; // Error message if action failed
  statusCode: number | null; // HTTP status code
  duration: number | null; // Duration of the action in milliseconds
  createdAt: Date; // When the activity was created
  createdBy: string; // Who created this record

  constructor(
    action: string,
    entity: string,
    userId: string,
    options: {
      details?: string;
      metadata?: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
      description?: string;
      isSuccess?: boolean;
      errorMessage?: string;
      statusCode?: number;
      duration?: number;
      createdBy?: string;
    } = {},
  ) {
    this.action = action;
    this.entity = entity;
    this.userId = userId;
    this.details = options.details || null;
    this.metadata = options.metadata || null;
    this.ipAddress = options.ipAddress || null;
    this.userAgent = options.userAgent || null;
    this.sessionId = options.sessionId || null;
    this.username = options.username || null;
    this.description = options.description || null;
    this.isSuccess = options.isSuccess ?? true;
    this.errorMessage = options.errorMessage || null;
    this.statusCode = options.statusCode || null;
    this.duration = options.duration || null;
    this.createdBy = options.createdBy || 'system';
    this.createdAt = new Date();
  }

  // Business logic: Parse details as JSON
  getParsedDetails(): object {
    try {
      return this.details ? JSON.parse(this.details) : {};
    } catch (error) {
      return {};
    }
  }

  // Business logic: Parse metadata as JSON
  getParsedMetadata(): object {
    try {
      return this.metadata ? JSON.parse(this.metadata) : {};
    } catch (error) {
      return {};
    }
  }

  // Business logic: Check if action was successful
  isActionSuccessful(): boolean {
    return this.isSuccess;
  }

  // Business logic: Get formatted duration
  getFormattedDuration(): string {
    if (!this.duration) return 'N/A';

    if (this.duration < 1000) {
      return `${this.duration}ms`;
    } else if (this.duration < 60000) {
      return `${(this.duration / 1000).toFixed(2)}s`;
    } else {
      return `${(this.duration / 60000).toFixed(2)}m`;
    }
  }

  // Business logic: Get status description
  getStatusDescription(): string {
    if (this.isSuccess) {
      return 'Success';
    } else {
      return this.errorMessage || 'Failed';
    }
  }

  // Business logic: Check if it's a security-related action
  isSecurityAction(): boolean {
    const securityActions = [
      'LOGIN_USER',
      'LOGOUT_USER',
      'CHANGE_PASSWORD',
      'RESET_PASSWORD',
    ];
    return securityActions.includes(this.action);
  }

  // Business logic: Check if it's a data modification action
  isDataModificationAction(): boolean {
    return (
      this.action.startsWith('CREATE_') ||
      this.action.startsWith('UPDATE_') ||
      this.action.startsWith('DELETE_')
    );
  }
}
