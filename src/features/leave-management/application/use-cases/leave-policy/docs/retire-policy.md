# Retire Policy Use Case

## Overview

The `RetirePolicyUseCase` is responsible for retiring active leave policy records. This operation changes the policy status to retired, preventing it from being used for new leave balance calculations while preserving historical data.

## Purpose

- Retire active leave policy records
- Prevent policies from being used for new calculations
- Preserve historical policy data for audit purposes
- Maintain data integrity through validation and transaction management

## Parameters

- `id: number` - The ID of the leave policy to retire
- `userId: string` - ID of the user performing the operation
- `requestInfo?: object` - Optional request metadata (IP, user agent, session, username)

## Dependencies

- `LeavePolicyRepository` - Manages leave policy operations
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Validation Phase

```typescript
// Validate leave policy existence
const leavePolicyResult = await this.leavePolicyRepository.findById(
  id,
  manager,
);
if (!leavePolicyResult) {
  throw new NotFoundException('Leave policy not found');
}
```

### 2. Retire Operation

```typescript
// Retire the leave policy
const retireSuccessfull = await this.leavePolicyRepository.retirePolicy(
  id,
  manager,
);
if (!retireSuccessfull) {
  throw new SomethinWentWrongException('Leave policy retirement failed');
}
```

### 3. Return Success

```typescript
return true;
```

## Return Value

```typescript
Promise<boolean>; // Returns true if operation successful
```

## Error Handling

### Validation Errors

- **NotFoundException**: Thrown when leave policy with given ID doesn't exist
- **SomethinWentWrongException**: Thrown when retirement operation fails

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Basic Retirement

```typescript
const result = await retirePolicyUseCase.execute(
  123, // policy ID
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
const result = await retirePolicyUseCase.execute(
  123, // policy ID
  userId,
);
```

## Business Rules

1. Only existing leave policies can be retired
2. Retirement preserves all policy data (no physical deletion)
3. Retired policies cannot be used for new leave balance calculations
4. Historical data using the policy remains intact
5. All operations must be logged for audit purposes

## Policy Status Transitions

- `active` → `retired` (only valid transition for retirement)
- `draft` → `retired` (may be allowed depending on business rules)
- `retired` → `retired` (may throw error or be idempotent)

## Logging

The use case logs the following information:

- **Action**: `RETIRE_LEAVE_POLICY`
- **Model**: `LEAVE_POLICY`
- **Success Message**: `Retired leave policy with ID: {id}`
- **Error Message**: `Failed to retire leave policy with ID: {id}`

## Use Cases

- **Policy Lifecycle Management**: Retire outdated policies
- **Policy Updates**: Retire old policy before creating new one
- **Compliance**: Retire policies that no longer meet regulations
- **Audit Requirements**: Preserve policy history while removing from active use

## Related Use Cases

- `CreateLeavePolicyUseCase` - Creates policies that can be retired
- `ActivatePolicyUseCase` - Activates policies (opposite of retire)
- `UpdateLeavePolicyUseCase` - Updates policies before retirement
- `SoftDeleteLeavePolicyUseCase` - Soft deletes policies (different from retire)

## Security Considerations

- Requires authenticated user ID
- Logs all operations for audit trail
- Validates policy existence before operation
- Uses transaction isolation for data consistency

## Performance Notes

- Single database query to find policy
- Single update operation to retire policy
- Minimal overhead with transaction management
- Efficient error handling with early validation

## Integration Examples

### Policy Management Interface

```typescript
// Retire policy from admin interface
const result = await retirePolicyUseCase.execute(policyId, adminUserId, {
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  sessionId: request.sessionId,
  username: adminUser.username,
});

if (result) {
  return { success: true, message: 'Policy retired successfully' };
} else {
  return { success: false, message: 'Failed to retire policy' };
}
```

### Policy Replacement Workflow

```typescript
// Retire old policy and create new one
const oldPolicyId = 123;
const newPolicyCommand = {
  leaveType: 'Annual Leave',
  annualEntitlement: 30,
  carryLimit: 10,
};

// Retire old policy
const retired = await retirePolicyUseCase.execute(
  oldPolicyId,
  userId,
  requestInfo,
);

if (retired) {
  // Create new policy
  const newPolicy = await createLeavePolicyUseCase.execute(
    newPolicyCommand,
    userId,
    requestInfo,
  );

  if (newPolicy) {
    // Activate new policy
    const activated = await activatePolicyUseCase.execute(
      newPolicy.id!,
      userId,
      requestInfo,
    );

    console.log('Policy replacement completed successfully');
  }
}
```

### Bulk Policy Retirement

```typescript
// Retire multiple policies
const policyIds = [123, 124, 125];
const results = await Promise.all(
  policyIds.map((id) => retirePolicyUseCase.execute(id, userId, requestInfo)),
);

const successCount = results.filter((r) => r === true).length;
console.log(
  `Successfully retired ${successCount} out of ${policyIds.length} policies`,
);
```

## Difference from Other Operations

- **vs ActivatePolicyUseCase**: Retire deactivates policy, activate makes it active
- **vs SoftDeleteLeavePolicyUseCase**: Retire changes status to retired, soft delete changes active flag
- **vs Hard Delete**: Retire preserves data, hard delete removes data permanently

## Impact on Leave Balances

When a policy is retired:

- Existing leave balances using the policy remain unchanged
- New leave balance calculations will not use the retired policy
- Historical reports can still reference the retired policy
- Policy remains available for audit and compliance purposes
