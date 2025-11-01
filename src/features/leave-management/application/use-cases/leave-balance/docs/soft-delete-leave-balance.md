# Soft Delete Leave Balance Use Case

## Overview

The `SoftDeleteLeaveBalanceUseCase` is responsible for soft deleting leave balance records by setting their active status. This operation marks balances as inactive without physically removing them from the database, preserving data integrity and audit trails.

## Purpose

- Soft delete leave balance records (mark as inactive)
- Preserve data for audit and historical purposes
- Support reversible deletion operations
- Maintain referential integrity in the system

## Parameters

- `id: number` - The ID of the leave balance to soft delete
- `isActive: boolean` - The active status to set (true = activate, false = deactivate)
- `userId: string` - ID of the user performing the operation
- `requestInfo?: object` - Optional request metadata (IP, user agent, session, username)

## Dependencies

- `LeaveBalanceRepository` - Manages leave balance operations
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Validation Phase

```typescript
// Check if leave balance exists
const existingBalance = await this.leaveBalanceRepository.findById(id, manager);
if (!existingBalance) {
  throw new Error('Leave balance not found');
}
```

### 2. Soft Delete Operation

```typescript
// Soft delete the leave balance
const result = await this.leaveBalanceRepository.softDelete(
  id,
  isActive,
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

### Validation Errors

- **Error**: Thrown when leave balance with given ID doesn't exist

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Soft Delete (Deactivate)

```typescript
const result = await softDeleteLeaveBalanceUseCase.execute(
  123, // balance ID
  false, // isActive = false (deactivate)
  userId,
  {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    sessionId: 'session-123',
    username: 'admin',
  },
);
```

### Reactivate Balance

```typescript
const result = await softDeleteLeaveBalanceUseCase.execute(
  123, // balance ID
  true, // isActive = true (reactivate)
  userId,
  requestInfo,
);
```

### Minimal Usage

```typescript
const result = await softDeleteLeaveBalanceUseCase.execute(
  123, // balance ID
  false, // deactivate
  userId,
);
```

## Business Rules

1. Only existing leave balances can be soft deleted
2. Soft delete preserves all data (no physical deletion)
3. Can be reversed by setting `isActive` to true
4. Soft deleted balances are typically excluded from active queries
5. All operations must be logged for audit purposes
6. **Manual balance VALUE updates are NOT allowed** - balance values (earned, used, remaining, encashed) can only be updated through:
   - Leave Request approval/cancellation
   - Encashment approval
   - Policy carry-over calculations
7. **This use case is SAFE** - it only changes the active status (administrative operation)

## Active Status Transitions

- `isActive: true` → `isActive: false` (soft delete/deactivate)
- `isActive: false` → `isActive: true` (reactivate/restore)

## Logging

The use case logs the following information:

- **Action**: `SOFT_DELETE_LEAVE_BALANCE`
- **Model**: `LEAVE_BALANCE`
- **Success Message**: `Soft deleted leave balance with ID: {id}`
- **Error Message**: `Failed to soft delete leave balance with ID: {id}`

## Use Cases

- **Data Correction**: Soft delete incorrect balances
- **Policy Changes**: Deactivate balances affected by policy changes
- **Employee Status Changes**: Deactivate balances for inactive employees
- **Audit Requirements**: Preserve data while removing from active use
- **Reversible Operations**: Allow restoration of accidentally deleted data

## Related Use Cases

- `CreateLeaveBalanceUseCase` - Creates balances that can be soft deleted
- `CloseLeaveBalanceUseCase` - Closes balances (different from soft delete)
- `ResetLeaveBalancesForYearUseCase` - Hard reset (different from soft delete)
- `FindLeaveBalanceByEmployeeYearUseCase` - May exclude soft deleted balances

## Security Considerations

- Requires authenticated user ID
- Logs all operations for audit trail
- Validates balance existence before operation
- Uses transaction isolation for data consistency

## Performance Notes

- Single database query to find balance
- Single update operation to change active status
- Minimal overhead with transaction management
- Efficient error handling with early validation

## Integration Examples

### Administrative Interface

```typescript
// Soft delete balance from admin interface
const result = await softDeleteLeaveBalanceUseCase.execute(
  balanceId,
  false, // deactivate
  adminUserId,
  {
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
    sessionId: request.sessionId,
    username: adminUser.username,
  },
);

if (result) {
  return { success: true, message: 'Leave balance deactivated successfully' };
} else {
  return { success: false, message: 'Failed to deactivate leave balance' };
}
```

### Bulk Operations

```typescript
// Soft delete multiple balances
const balanceIds = [123, 124, 125];
const results = await Promise.all(
  balanceIds.map((id) =>
    softDeleteLeaveBalanceUseCase.execute(id, false, userId, requestInfo),
  ),
);

const successCount = results.filter((r) => r === true).length;
console.log(
  `Successfully soft deleted ${successCount} out of ${balanceIds.length} balances`,
);
```

### Reactivation Process

```typescript
// Reactivate previously soft deleted balance
const result = await softDeleteLeaveBalanceUseCase.execute(
  balanceId,
  true, // reactivate
  userId,
  requestInfo,
);

if (result) {
  // Balance has been reactivated
  console.log('Leave balance reactivated successfully');
}
```

## Difference from Other Operations

- **vs CloseLeaveBalanceUseCase**: Soft delete changes `isActive` flag, close changes `status` to CLOSED
- **vs ResetLeaveBalancesForYearUseCase**: Soft delete affects individual balance, reset affects all balances for a year
- **vs Hard Delete**: Soft delete preserves data, hard delete removes data permanently
