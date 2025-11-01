# Soft Delete Leave Policy Use Case

## Overview

The `SoftDeleteLeavePolicyUseCase` is responsible for soft deleting leave policy records by setting their active status. This operation marks policies as inactive without physically removing them from the database, preserving data integrity and audit trails.

## Purpose

- Soft delete leave policy records (mark as inactive)
- Preserve data for audit and historical purposes
- Support reversible deletion operations
- Maintain referential integrity in the system

## Parameters

- `id: number` - The ID of the leave policy to soft delete
- `isActive: boolean` - The active status to set (true = activate, false = deactivate)
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

### 2. Soft Delete Operation

```typescript
// Soft delete the leave policy
const deleteSuccessfull = await this.leavePolicyRepository.softDelete(
  id,
  isActive,
  manager,
);
if (!deleteSuccessfull) {
  throw new SomethinWentWrongException('Leave policy soft delete failed');
}
```

### 3. Return Result

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
- **SomethinWentWrongException**: Thrown when soft delete operation fails

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Soft Delete (Deactivate)

```typescript
const result = await softDeleteLeavePolicyUseCase.execute(
  123, // policy ID
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

### Reactivate Policy

```typescript
const result = await softDeleteLeavePolicyUseCase.execute(
  123, // policy ID
  true, // isActive = true (reactivate)
  userId,
  requestInfo,
);
```

### Minimal Usage

```typescript
const result = await softDeleteLeavePolicyUseCase.execute(
  123, // policy ID
  false, // deactivate
  userId,
);
```

## Business Rules

1. Only existing leave policies can be soft deleted
2. Soft delete preserves all data (no physical deletion)
3. Can be reversed by setting `isActive` to true
4. Soft deleted policies are typically excluded from active queries
5. All operations must be logged for audit purposes

## Active Status Transitions

- `isActive: true` → `isActive: false` (soft delete/deactivate)
- `isActive: false` → `isActive: true` (reactivate/restore)

## Logging

The use case logs the following information:

- **Action**: `SOFT_DELETE_LEAVE_POLICY`
- **Model**: `LEAVE_POLICY`
- **Success Message**: `Soft deleted leave policy with ID: {id}`
- **Error Message**: `Failed to soft delete leave policy with ID: {id}`

## Use Cases

- **Data Correction**: Soft delete incorrect policies
- **Policy Management**: Deactivate policies temporarily
- **Compliance**: Preserve data while removing from active use
- **Reversible Operations**: Allow restoration of accidentally deleted policies

## Related Use Cases

- `CreateLeavePolicyUseCase` - Creates policies that can be soft deleted
- `ActivatePolicyUseCase` - Activates policies (different from soft delete)
- `RetirePolicyUseCase` - Retires policies (different from soft delete)
- `UpdateLeavePolicyUseCase` - Updates policies that can be soft deleted

## Security Considerations

- Requires authenticated user ID
- Logs all operations for audit trail
- Validates policy existence before operation
- Uses transaction isolation for data consistency

## Performance Notes

- Single database query to find policy
- Single update operation to change active status
- Minimal overhead with transaction management
- Efficient error handling with early validation

## Integration Examples

### Administrative Interface

```typescript
// Soft delete policy from admin interface
const result = await softDeleteLeavePolicyUseCase.execute(
  policyId,
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
  return { success: true, message: 'Policy deactivated successfully' };
} else {
  return { success: false, message: 'Failed to deactivate policy' };
}
```

### Bulk Operations

```typescript
// Soft delete multiple policies
const policyIds = [123, 124, 125];
const results = await Promise.all(
  policyIds.map((id) =>
    softDeleteLeavePolicyUseCase.execute(id, false, userId, requestInfo),
  ),
);

const successCount = results.filter((r) => r === true).length;
console.log(
  `Successfully soft deleted ${successCount} out of ${policyIds.length} policies`,
);
```

### Policy Management Workflow

```typescript
// Complete policy management workflow
const policyId = 123;

// First, soft delete the policy
const deactivated = await softDeleteLeavePolicyUseCase.execute(
  policyId,
  false, // deactivate
  userId,
  requestInfo,
);

if (deactivated) {
  // Later, reactivate the policy
  const reactivated = await softDeleteLeavePolicyUseCase.execute(
    policyId,
    true, // reactivate
    userId,
    requestInfo,
  );

  if (reactivated) {
    console.log('Policy deactivation and reactivation completed successfully');
  }
}
```

### Policy Cleanup Process

```typescript
// Cleanup process for old policies
const cleanupOldPolicies = async (cutoffDate: Date) => {
  // Get all policies older than cutoff date
  const oldPolicies = await findLeavePolicyPaginatedListUseCase.execute(
    '', // empty term to get all
    1, // page
    1000, // large limit
  );

  const policiesToDeactivate = oldPolicies.data.filter(
    (policy) => policy.createdAt < cutoffDate,
  );

  // Soft delete old policies
  const results = await Promise.all(
    policiesToDeactivate.map((policy) =>
      softDeleteLeavePolicyUseCase.execute(
        policy.id!,
        false, // deactivate
        systemUserId,
        requestInfo,
      ),
    ),
  );

  const successCount = results.filter((r) => r === true).length;
  console.log(`Deactivated ${successCount} old policies`);
};
```

## Difference from Other Operations

- **vs ActivatePolicyUseCase**: Soft delete changes `isActive` flag, activate changes `status` to active
- **vs RetirePolicyUseCase**: Soft delete changes `isActive` flag, retire changes `status` to retired
- **vs Hard Delete**: Soft delete preserves data, hard delete removes data permanently

## Impact on System

When a policy is soft deleted:

- Policy is excluded from active policy queries
- Existing leave balances using the policy remain unchanged
- Policy remains available for audit and compliance purposes
- Policy can be reactivated if needed
- Historical reports can still reference the policy

## Best Practices

1. Use soft delete for temporary deactivation
2. Use retire for permanent policy lifecycle management
3. Consider implementing automatic cleanup for old soft-deleted policies
4. Implement proper authorization checks for soft delete operations
5. Maintain audit trail for all soft delete operations
