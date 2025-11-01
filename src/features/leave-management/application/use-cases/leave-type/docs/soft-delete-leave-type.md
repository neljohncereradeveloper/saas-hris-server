# Soft Delete Leave Type Use Case

## Overview

The `SoftDeleteLeaveTypeUseCase` is responsible for soft deleting leave type records by setting their active status. This operation marks leave types as inactive without physically removing them from the database, preserving data integrity and audit trails.

## Purpose

- Soft delete leave type records (mark as inactive)
- Preserve data for audit and historical purposes
- Support reversible deletion operations
- Maintain referential integrity in the system

## Parameters

- `id: number` - The ID of the leave type to soft delete
- `isActive: boolean` - The active status to set (true = activate, false = deactivate)
- `userId: string` - ID of the user performing the operation
- `requestInfo?: object` - Optional request metadata (IP, user agent, session, username)

## Dependencies

- `LeaveTypeRepository` - Manages leave type operations
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Validation Phase

```typescript
// Validate leave type existence
const leaveType = await this.leaveTypeRepository.findById(id, manager);
if (!leaveType) {
  throw new NotFoundException('Leave type not found');
}
```

### 2. Soft Delete Operation

```typescript
// Soft delete the leave type
const softDeleteSuccessfull = await this.leaveTypeRepository.softDelete(
  id,
  isActive,
  manager,
);
if (!softDeleteSuccessfull) {
  throw new SomethinWentWrongException('Leave type soft delete failed');
}
```

### 3. Return Result

```typescript
return softDeleteSuccessfull;
```

## Return Value

```typescript
Promise<boolean>; // Returns true if operation successful
```

## Error Handling

### Validation Errors

- **NotFoundException**: Thrown when leave type with given ID doesn't exist
- **SomethinWentWrongException**: Thrown when soft delete operation fails

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Soft Delete (Deactivate)

```typescript
const result = await softDeleteLeaveTypeUseCase.execute(
  123, // leave type ID
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

### Reactivate Leave Type

```typescript
const result = await softDeleteLeaveTypeUseCase.execute(
  123, // leave type ID
  true, // isActive = true (reactivate)
  userId,
  requestInfo,
);
```

### Minimal Usage

```typescript
const result = await softDeleteLeaveTypeUseCase.execute(
  123, // leave type ID
  false, // deactivate
  userId,
);
```

## Business Rules

1. Only existing leave types can be soft deleted
2. Soft delete preserves all data (no physical deletion)
3. Can be reversed by setting `isActive` to true
4. Soft deleted leave types are typically excluded from active queries
5. All operations must be logged for audit purposes

## Active Status Transitions

- `isActive: true` → `isActive: false` (soft delete/deactivate)
- `isActive: false` → `isActive: true` (reactivate/restore)

## Logging

The use case logs the following information:

- **Action**: `SOFT_DELETE_LEAVE_TYPE`
- **Model**: `LEAVE_TYPE`
- **Success Message**: `Leave type has been {action}d` (activate/deactivate)
- **Error Message**: `Failed to {action} leave type with ID: {id}`

## Use Cases

- **Data Correction**: Soft delete incorrect leave types
- **Leave Type Management**: Deactivate leave types temporarily
- **Compliance**: Preserve data while removing from active use
- **Reversible Operations**: Allow restoration of accidentally deleted leave types

## Related Use Cases

- `CreateLeaveTypeUseCase` - Creates leave types that can be soft deleted
- `UpdateLeaveTypeUseCase` - Updates leave types that can be soft deleted
- `FindLeaveTypePaginatedListUseCase` - Queries leave types (affected by soft delete)
- `RetrieveLeaveTypeForComboboxUseCase` - Retrieves leave types (affected by soft delete)

## Security Considerations

- Requires authenticated user ID
- Logs all operations for audit trail
- Validates leave type existence before operation
- Uses transaction isolation for data consistency

## Performance Notes

- Single database query to find leave type
- Single update operation to change active status
- Minimal overhead with transaction management
- Efficient error handling with early validation

## Integration Examples

### Administrative Interface

```typescript
// Soft delete leave type from admin interface
const result = await softDeleteLeaveTypeUseCase.execute(
  leaveTypeId,
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
  return { success: true, message: 'Leave type deactivated successfully' };
} else {
  return { success: false, message: 'Failed to deactivate leave type' };
}
```

### Bulk Operations

```typescript
// Soft delete multiple leave types
const leaveTypeIds = [123, 124, 125];
const results = await Promise.all(
  leaveTypeIds.map((id) =>
    softDeleteLeaveTypeUseCase.execute(id, false, userId, requestInfo),
  ),
);

const successCount = results.filter((r) => r === true).length;
console.log(
  `Successfully soft deleted ${successCount} out of ${leaveTypeIds.length} leave types`,
);
```

### Leave Type Management Workflow

```typescript
// Complete leave type management workflow
const leaveTypeId = 123;

// First, soft delete the leave type
const deactivated = await softDeleteLeaveTypeUseCase.execute(
  leaveTypeId,
  false, // deactivate
  userId,
  requestInfo,
);

if (deactivated) {
  // Later, reactivate the leave type
  const reactivated = await softDeleteLeaveTypeUseCase.execute(
    leaveTypeId,
    true, // reactivate
    userId,
    requestInfo,
  );

  if (reactivated) {
    console.log(
      'Leave type deactivation and reactivation completed successfully',
    );
  }
}
```

### Leave Type Cleanup Process

```typescript
// Cleanup process for old leave types
const cleanupOldLeaveTypes = async (cutoffDate: Date) => {
  // Get all leave types older than cutoff date
  const oldLeaveTypes = await findLeaveTypePaginatedListUseCase.execute(
    '', // empty term to get all
    1, // page
    1000, // large limit
  );

  const leaveTypesToDeactivate = oldLeaveTypes.data.filter(
    (leaveType) => leaveType.createdAt < cutoffDate,
  );

  // Soft delete old leave types
  const results = await Promise.all(
    leaveTypesToDeactivate.map((leaveType) =>
      softDeleteLeaveTypeUseCase.execute(
        leaveType.id!,
        false, // deactivate
        systemUserId,
        requestInfo,
      ),
    ),
  );

  const successCount = results.filter((r) => r === true).length;
  console.log(`Deactivated ${successCount} old leave types`);
};
```

### React Component Integration

```typescript
// React component for leave type management
const LeaveTypeManagement = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSoftDelete = async (leaveTypeId, isActive) => {
    setLoading(true);
    try {
      const result = await softDeleteLeaveTypeUseCase.execute(
        leaveTypeId,
        isActive,
        currentUserId,
        requestInfo,
      );

      if (result) {
        // Refresh the list
        await loadLeaveTypes();
        showNotification(
          `Leave type ${isActive ? 'activated' : 'deactivated'} successfully`
        );
      }
    } catch (error) {
      console.error('Failed to soft delete leave type:', error);
      showNotification('Failed to update leave type status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {leaveTypes.map(leaveType => (
        <div key={leaveType.id}>
          <h3>{leaveType.name}</h3>
          <p>{leaveType.description}</p>
          <span>Status: {leaveType.isActive ? 'Active' : 'Inactive'}</span>

          <button
            onClick={() => handleSoftDelete(leaveType.id, !leaveType.isActive)}
            disabled={loading}
          >
            {leaveType.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Difference from Other Operations

- **vs Hard Delete**: Soft delete preserves data, hard delete removes data permanently
- **vs Update**: Soft delete changes `isActive` flag, update changes other fields
- **vs Create**: Soft delete modifies existing records, create adds new records

## Impact on System

When a leave type is soft deleted:

- Leave type is excluded from active leave type queries
- Existing leave policies using the leave type remain unchanged
- Leave type remains available for audit and compliance purposes
- Leave type can be reactivated if needed
- Historical reports can still reference the leave type
- Leave requests using the leave type may be affected (depending on business rules)

## Business Impact Considerations

### Leave Policy Impact

```typescript
// Check if leave type can be safely deactivated
const canDeactivateLeaveType = async (leaveTypeId) => {
  // Check if there are active leave policies using this leave type
  const activePolicies = await findLeavePolicyPaginatedListUseCase.execute(
    '', // all policies
    1,
    1000,
  );

  const policiesUsingLeaveType = activePolicies.data.filter(
    (policy) => policy.leaveTypeId === leaveTypeId,
  );

  if (policiesUsingLeaveType.length > 0) {
    return {
      canDeactivate: false,
      reason: `Cannot deactivate leave type. ${policiesUsingLeaveType.length} active policies are using this leave type.`,
      affectedPolicies: policiesUsingLeaveType.length,
    };
  }

  return { canDeactivate: true };
};
```

### Leave Request Impact

```typescript
// Check impact on leave requests
const checkLeaveRequestImpact = async (leaveTypeId) => {
  // This would typically query leave requests using this leave type
  // Implementation depends on your leave request system

  return {
    hasActiveRequests: false,
    pendingRequests: 0,
    canDeactivate: true,
  };
};
```

## Best Practices

1. Use soft delete for temporary deactivation
2. Check for dependencies before deactivating leave types
3. Consider implementing automatic cleanup for old soft-deleted leave types
4. Implement proper authorization checks for soft delete operations
5. Maintain audit trail for all soft delete operations
6. Consider impact on related entities (policies, requests)
7. Implement proper error handling and user feedback

## Validation Rules

Before soft deleting a leave type, consider validating:

1. **Active Policies**: Are there active leave policies using this leave type?
2. **Pending Requests**: Are there pending leave requests using this leave type?
3. **Historical Data**: Will deactivating affect historical reporting?
4. **User Permissions**: Does the user have permission to deactivate leave types?
5. **Business Rules**: Are there business rules preventing deactivation?

## Rollback Strategy

```typescript
// Rollback strategy for accidental deactivation
const rollbackLeaveTypeDeactivation = async (
  leaveTypeId,
  userId,
  requestInfo,
) => {
  try {
    const result = await softDeleteLeaveTypeUseCase.execute(
      leaveTypeId,
      true, // reactivate
      userId,
      requestInfo,
    );

    if (result) {
      console.log(`Successfully reactivated leave type ${leaveTypeId}`);
      return { success: true, message: 'Leave type reactivated successfully' };
    } else {
      return { success: false, message: 'Failed to reactivate leave type' };
    }
  } catch (error) {
    console.error('Rollback failed:', error);
    return { success: false, message: 'Rollback operation failed' };
  }
};
```
