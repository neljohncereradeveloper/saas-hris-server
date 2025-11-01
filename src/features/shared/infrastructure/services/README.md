# Centralized Error Handler

This module provides a centralized error handling solution for use cases in the HRIS application. It standardizes error logging, activity tracking, and provides consistent error handling patterns across all use cases.

## Features

- **Centralized Error Logging**: All errors are logged consistently with proper context
- **Activity Tracking**: Automatic creation of activity logs for both successful and failed operations
- **Standardized Error Handling**: Consistent error handling patterns across use cases
- **Transaction Support**: Works seamlessly with database transactions
- **Flexible Configuration**: Customizable error messages and logging details

## Components

### 1. ErrorHandlerPort Interface

Defines the contract for error handling operations.

### 2. ErrorHandlerService Implementation

Implements the error handling logic with:

- Error logging with proper context
- Activity log creation for success/failure
- HTTP status code determination
- Duration tracking

### 3. ErrorHandlerModule

NestJS module that provides dependency injection for the error handler service.

## Usage

### Basic Usage (Recommended)

```typescript
@Injectable()
export class CreateBarangayUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BARANGAY)
    private readonly barangayRepository: BarangayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateBarangayCommand,
    userId: string,
    requestInfo?: any,
  ): Promise<Barangay> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
          CONSTANTS_DATABASE_MODELS.BARANGAY,
          userId,
          dto,
          requestInfo,
          `Created new barangay: ${dto.desc1}`,
          `Failed to create barangay: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            const barangay = await this.barangayRepository.create(
              new Barangay(dto),
              manager,
            );
            return barangay;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
```

### Manual Error Handling

For cases where you need more control:

```typescript
async execute(dto: any, userId: string, requestInfo?: any): Promise<any> {
  const startTime = Date.now();

  return this.transactionHelper.executeTransaction(
    CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
    async (manager) => {
      try {
        const result = await this.repository.create(new Entity(dto), manager);

        await this.errorHandler.logSuccess(result, {
          action: CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
          entity: CONSTANTS_DATABASE_MODELS.BARANGAY,
          userId,
          requestInfo,
          operationData: dto,
          successDescription: `Successfully created ${dto.name}`,
          startTime,
        }, manager);

        return result;
      } catch (error) {
        await this.errorHandler.handleError(error as Error, {
          action: CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
          entity: CONSTANTS_DATABASE_MODELS.BARANGAY,
          userId,
          requestInfo,
          operationData: dto,
          failureDescription: `Failed to create ${dto.name}`,
          startTime,
        }, manager);

        throw error;
      }
    },
  );
}
```

## Migration Guide

### Before (Old Pattern)

```typescript
async execute(dto: any, userId: string, requestInfo?: any): Promise<any> {
  const startTime = Date.now();

  return this.transactionHelper.executeTransaction(
    CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
    async (manager) => {
      try {
        const result = await this.repository.create(new Entity(dto), manager);

        const duration = Date.now() - startTime;
        await this.activityLogRepository.create(
          new ActivityLog(
            CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
            CONSTANTS_DATABASE_MODELS.BARANGAY,
            userId,
            {
              details: JSON.stringify(result),
              description: `Created new entity: ${result.name}`,
              ipAddress: requestInfo?.ipAddress,
              userAgent: requestInfo?.userAgent,
              sessionId: requestInfo?.sessionId,
              username: requestInfo?.username,
              isSuccess: true,
              statusCode: 201,
              duration,
              createdBy: userId,
            },
          ),
          manager,
        );

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        await this.activityLogRepository.create(
          new ActivityLog(
            CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
            CONSTANTS_DATABASE_MODELS.BARANGAY,
            userId,
            {
              details: JSON.stringify({ dto }),
              description: `Failed to create entity: ${dto.name}`,
              ipAddress: requestInfo?.ipAddress,
              userAgent: requestInfo?.userAgent,
              sessionId: requestInfo?.sessionId,
              username: requestInfo?.username,
              isSuccess: false,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              statusCode: 500,
              duration,
              createdBy: userId,
            },
          ),
          manager,
        );

        throw error;
      }
    },
  );
}
```

### After (New Pattern)

```typescript
async execute(dto: any, userId: string, requestInfo?: any): Promise<any> {
  return this.transactionHelper.executeTransaction(
    CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
    async (manager) => {
      const errorHandlerOptions = this.errorHandler.createOptions(
        CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
        CONSTANTS_DATABASE_MODELS.BARANGAY,
        userId,
        dto,
        requestInfo,
        `Created new entity: ${dto.name}`,
        `Failed to create entity: ${dto.name}`,
      );

      return this.errorHandler.executeWithErrorHandling(
        async () => {
          return await this.repository.create(new Entity(dto), manager);
        },
        errorHandlerOptions,
        manager,
      );
    },
  );
}
```

## Benefits

1. **Reduced Code Duplication**: Eliminates repetitive error handling code
2. **Consistency**: Ensures all use cases handle errors the same way
3. **Maintainability**: Centralized error handling logic is easier to maintain
4. **Testing**: Easier to test error scenarios with centralized logic
5. **Monitoring**: Consistent error logging makes monitoring easier

## Configuration

The error handler automatically determines HTTP status codes based on error types:

- `DomainException`: Uses the exception's status code
- Other errors: Defaults to 500

## Dependencies

- `@nestjs/common`
- `typeorm`
- Activity Log Repository
- Transaction Port

## Integration

To use the centralized error handler in your module:

1. Import the `ErrorHandlerModule` in your feature module
2. Inject `CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER` in your use cases
3. Replace manual error handling with the centralized service

```typescript
@Module({
  imports: [ErrorHandlerModule],
  // ... other module configuration
})
export class YourFeatureModule {}
```
