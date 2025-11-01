# Close Leave Balance Use Case

## Overview

The `CloseLeaveBalanceUseCase` is responsible for closing an existing leave balance record. This operation changes the status of a leave balance from `OPEN` to `CLOSED`, preventing further modifications to the balance.

## Purpose

- Close individual leave balance records
- Prevent further transactions on closed balances
- Maintain data integrity through status validation
- Provide comprehensive logging and error handling

## Parameters

- `id: number` - The ID of the leave balance to close
- `userId: string` - ID of the user performing the operation
- `requestInfo?: object` - Optional request metadata (IP, user agent, session, username)

## Dependencies

- `LeaveBalanceRepository` - Manages leave balance operations
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Validation Phase

- Retrieves the leave balance by ID
- Validates that the balance exists
- Checks that the balance is not already closed

### 2. Business Logic Validation

```typescript
// Check if leave balance exists
const existingBalance = await this.leaveBalanceRepository.findById(id, manager);
if (!existingBalance) {
  throw new NotFoundException('Leave balance not found');
}

// Check if already closed
if (existingBalance.status === EnumLeaveBalanceStatus.CLOSED) {
  throw new BadRequestException('Leave balance is already closed');
}
```

### 3. Close Operation

- Calls repository method to close the balance
- Updates the balance status to `CLOSED`
- Records the operation timestamp

## Return Value

```typescript
Promise<boolean>; // Returns true if operation successful
```

## Error Handling

### Validation Errors

- **NotFoundException**: Thrown when leave balance with given ID doesn't exist
- **BadRequestException**: Thrown when balance is already closed

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging

## Usage Examples

### Basic Close Operation

```typescript
const result = await closeLeaveBalanceUseCase.execute(
  123, // balance ID
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
const result = await closeLeaveBalanceUseCase.execute(
  123, // balance ID
  userId,
);
```

## Business Rules

1. Only existing leave balances can be closed
2. Already closed balances cannot be closed again
3. Closing a balance prevents further modifications
4. All operations must be logged for audit purposes
5. **Manual balance VALUE updates are NOT allowed** - balance values (earned, used, remaining, encashed) can only be updated through:
   - Leave Request approval/cancellation
   - Encashment approval
   - Policy carry-over calculations
6. **This use case is SAFE** - it only changes the status from OPEN to CLOSED (administrative operation)

## Status Transitions

- `OPEN` → `CLOSED` (only valid transition)
- `CLOSED` → `CLOSED` (throws error)

## Logging

The use case logs the following information:

- **Action**: `CLOSE_LEAVE_BALANCE`
- **Model**: `LEAVE_BALANCE`
- **Success Message**: `Closed leave balance with ID: {id}`
- **Error Message**: `Failed to close leave balance with ID: {id}`

## Related Use Cases

- `CreateLeaveBalanceUseCase` - Creates new balances (status: OPEN)
- `SoftDeleteLeaveBalanceUseCase` - Soft deletes balances
- `GenerateAnnualLeaveBalancesUseCase` - Creates multiple balances with OPEN status

## Security Considerations

- Requires authenticated user ID
- Logs all operations for audit trail
- Validates permissions through repository layer
- Uses transaction isolation for data consistency

## Performance Notes

- Single database query to find balance
- Single update operation to close balance
- Minimal overhead with transaction management
- Efficient error handling with early validation
