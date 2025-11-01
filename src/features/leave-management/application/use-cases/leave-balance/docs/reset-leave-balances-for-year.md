# Reset Leave Balances For Year Use Case

## Overview

The `ResetLeaveBalancesForYearUseCase` is responsible for resetting all leave balance records for a specific year. This operation clears existing balances and is typically used during year-end processes or when bulk corrections are needed.

## Purpose

- Reset all leave balances for a specific year
- Clear existing balance data for year-end processing
- Support bulk correction scenarios
- Provide comprehensive logging and error handling

## Parameters

- `year: number` - The year for which to reset leave balances
- `userId: string` - ID of the user performing the operation
- `requestInfo?: object` - Optional request metadata (IP, user agent, session, username)

## Dependencies

- `LeaveBalanceRepository` - Manages leave balance operations
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Transaction Setup

- Initiates database transaction for data consistency
- Sets up error handling with proper logging context

### 2. Reset Operation

```typescript
// Reset balances for the specified year
const result = await this.leaveBalanceRepository.resetBalancesForYear(
  year,
  manager,
);
```

### 3. Return Result

- Returns boolean indicating success/failure
- Transaction commits automatically on success
- Transaction rolls back automatically on failure

## Return Value

```typescript
Promise<boolean>; // Returns true if operation successful
```

## Error Handling

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

### Logging Context

- **Action**: `RESET_LEAVE_BALANCES_FOR_YEAR`
- **Model**: `LEAVE_BALANCE`
- **Success Message**: `Reset leave balances for year: {year}`
- **Error Message**: `Failed to reset leave balances for year: {year}`

## Usage Examples

### Basic Reset Operation

```typescript
const result = await resetLeaveBalancesForYearUseCase.execute(
  2024, // year
  userId,
  {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    sessionId: 'session-123',
    username: 'admin',
  },
);
```

### Minimal Usage

```typescript
const result = await resetLeaveBalancesForYearUseCase.execute(
  2024, // year
  userId,
);
```

## Business Rules

1. Resets ALL leave balances for the specified year
2. Operation is irreversible (consider backup before execution)
3. Should be used with caution in production environments
4. Typically used during year-end processing or bulk corrections
5. **Manual balance VALUE updates are NOT allowed** - balance values (earned, used, remaining, encashed) can only be updated through:
   - Leave Request approval/cancellation
   - Encashment approval
   - Policy carry-over calculations
6. **This use case is SAFE** - it performs administrative cleanup/reset operations (not value modifications)

## Use Cases

- **Year-End Processing**: Clear balances before generating new year balances
- **Bulk Corrections**: Reset balances when policy changes require recalculation
- **Data Migration**: Clear existing data during system migrations
- **Testing**: Reset test data for clean test environments

## Security Considerations

- Requires authenticated user ID
- Logs all operations for audit trail
- Should be restricted to administrative users
- Consider implementing additional authorization checks

## Performance Notes

- Bulk operation affecting potentially many records
- Single database operation through repository
- Transaction overhead for data consistency
- Consider impact on system performance during execution

## Related Use Cases

- `GenerateAnnualLeaveBalancesUseCase` - Often used after reset to create new balances
- `SoftDeleteLeaveBalanceUseCase` - Alternative for individual balance management
- `CloseLeaveBalanceUseCase` - For closing individual balances instead of resetting

## Warning Considerations

⚠️ **Important**: This operation is destructive and irreversible. Consider:

- Taking database backups before execution
- Implementing additional confirmation steps
- Restricting access to authorized personnel only
- Testing in non-production environments first

## Integration Notes

This use case is typically used in sequence with other operations:

1. `ResetLeaveBalancesForYearUseCase` - Clear existing balances
2. `GenerateAnnualLeaveBalancesUseCase` - Create new balances
3. Individual balance management operations as needed
