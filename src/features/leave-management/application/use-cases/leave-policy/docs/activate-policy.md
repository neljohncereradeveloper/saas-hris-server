# Activate Policy Use Case

## Overview

The `ActivatePolicyUseCase` is responsible for activating leave policy records. This operation changes the policy status to active, making it available for use in leave balance calculations and new leave requests.

## Purpose

- Activate leave policy records
- Make policies available for leave balance calculations
- Enable policies for new leave requests
- Maintain data integrity through validation and transaction management

## Parameters

- `id: number` - The ID of the leave policy to activate
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

### 2. Activate Operation

```typescript
// Activate the leave policy
const activateSuccessfull = await this.leavePolicyRepository.activatePolicy(
  id,
  manager,
);
if (!activateSuccessfull) {
  throw new SomethinWentWrongException('Leave policy activation failed');
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
- **SomethinWentWrongException**: Thrown when activation operation fails

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Basic Activation

```typescript
const result = await activatePolicyUseCase.execute(
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
const result = await activatePolicyUseCase.execute(
  123, // policy ID
  userId,
);
```

## Business Rules

1. Only existing leave policies can be activated
2. Activation makes the policy available for new calculations
3. Only one policy per leave type should typically be active at a time
4. Historical data using the policy remains intact
5. All operations must be logged for audit purposes

## Policy Status Transitions

- `draft` → `active` (most common transition)
- `retired` → `active` (reactivating retired policy)
- `active` → `active` (may throw error or be idempotent)

## Logging

The use case logs the following information:

- **Action**: `ACTIVATE_LEAVE_POLICY`
- **Model**: `LEAVE_POLICY`
- **Success Message**: `Activated leave policy with ID: {id}`
- **Error Message**: `Failed to activate leave policy with ID: {id}`

## Use Cases

- **Policy Lifecycle Management**: Activate new policies
- **Policy Updates**: Activate updated policies
- **Policy Reactivation**: Reactivate previously retired policies
- **New Policy Deployment**: Activate policies for new leave types

## Related Use Cases

- `CreateLeavePolicyUseCase` - Creates policies that can be activated
- `RetirePolicyUseCase` - Retires policies (opposite of activate)
- `UpdateLeavePolicyUseCase` - Updates policies before activation
- `SoftDeleteLeavePolicyUseCase` - Soft deletes policies (different from activate)

## Security Considerations

- Requires authenticated user ID
- Logs all operations for audit trail
- Validates policy existence before operation
- Uses transaction isolation for data consistency

## Performance Notes

- Single database query to find policy
- Single update operation to activate policy
- Minimal overhead with transaction management
- Efficient error handling with early validation

## Integration Examples

### Policy Management Interface

```typescript
// Activate policy from admin interface
const result = await activatePolicyUseCase.execute(policyId, adminUserId, {
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  sessionId: request.sessionId,
  username: adminUser.username,
});

if (result) {
  return { success: true, message: 'Policy activated successfully' };
} else {
  return { success: false, message: 'Failed to activate policy' };
}
```

### Policy Creation Workflow

```typescript
// Complete policy creation and activation workflow
const policyCommand = {
  leaveType: 'Annual Leave',
  annualEntitlement: 25,
  carryLimit: 5,
  description: 'New annual leave policy',
};

// Create policy
const policy = await createLeavePolicyUseCase.execute(
  policyCommand,
  userId,
  requestInfo,
);

if (policy) {
  // Activate the policy
  const activated = await activatePolicyUseCase.execute(
    policy.id!,
    userId,
    requestInfo,
  );

  if (activated) {
    console.log('Policy created and activated successfully');
  }
}
```

### Policy Replacement Workflow

```typescript
// Replace old policy with new one
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

### Bulk Policy Activation

```typescript
// Activate multiple policies
const policyIds = [123, 124, 125];
const results = await Promise.all(
  policyIds.map((id) => activatePolicyUseCase.execute(id, userId, requestInfo)),
);

const successCount = results.filter((r) => r === true).length;
console.log(
  `Successfully activated ${successCount} out of ${policyIds.length} policies`,
);
```

## Impact on Leave Balances

When a policy is activated:

- New leave balance calculations will use the activated policy
- Existing leave balances remain unchanged
- The policy becomes available for new leave requests
- Policy rules (annual entitlement, carry limit) apply to new calculations

## Policy Conflicts

Consider implementing business logic to handle:

- Multiple active policies for the same leave type
- Policy effective date validation
- Policy expiry date handling
- Automatic deactivation of conflicting policies
