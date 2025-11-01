# Update Leave Type Use Case

## Overview

The `UpdateLeaveTypeUseCase` is responsible for updating existing leave type records. This use case handles the modification of leave type details while ensuring data integrity through validation and transaction management.

## Purpose

- Update existing leave type records
- Validate leave type existence before updating
- Maintain data integrity through transaction management
- Provide comprehensive logging and error handling

## Parameters

- `id: number` - The ID of the leave type to update
- `dto: UpdateLeaveTypeCommand` - The update data transfer object
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
const leaveTypeResult = await this.leaveTypeRepository.findById(id, manager);
if (!leaveTypeResult) {
  throw new NotFoundException('Leave type not found');
}
```

### 2. Update Operation

```typescript
// Update the leave type
const updateSuccessfull = await this.leaveTypeRepository.update(
  id,
  dto,
  manager,
);
if (!updateSuccessfull) {
  throw new SomethinWentWrongException('Leave type update failed');
}
```

### 3. Return Updated Leave Type

```typescript
// Retrieve the updated leave type
const leaveType = await this.leaveTypeRepository.findById(id, manager);
return leaveType!;
```

## Return Value

```typescript
Promise<LeaveType | null>; // Returns the updated leave type object
```

## Error Handling

### Validation Errors

- **NotFoundException**: Thrown when leave type with given ID doesn't exist
- **SomethinWentWrongException**: Thrown when update operation fails

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Basic Update

```typescript
const updateCommand: UpdateLeaveTypeCommand = {
  name: 'Annual Leave',
  description: 'Standard annual leave for employees',
  // ... other leave type fields
};

const updatedLeaveType = await updateLeaveTypeUseCase.execute(
  123, // leave type ID
  updateCommand,
  userId,
  requestInfo,
);
```

### With Request Info

```typescript
const updatedLeaveType = await updateLeaveTypeUseCase.execute(
  leaveTypeId,
  updateCommand,
  userId,
  {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    sessionId: 'session-123',
    username: 'hr-admin',
  },
);
```

## Business Rules

1. Leave type must exist before updating
2. All leave type fields are validated during update
3. Update operation is atomic (all or nothing)
4. All operations must be logged for audit purposes
5. Updated leave type is returned after successful update

## Leave Type Update Fields

The following fields can be updated:

- `name`: Leave type name
- `description`: Leave type description
- Other leave type-specific fields

## Logging

The use case logs the following information:

- **Action**: `UPDATE_LEAVE_TYPE`
- **Model**: `LEAVE_TYPE`
- **Success Message**: `Updated leave type: {name}`
- **Error Message**: `Failed to update leave type with ID: {id}`

## Related Use Cases

- `CreateLeaveTypeUseCase` - Creates leave types that can be updated
- `SoftDeleteLeaveTypeUseCase` - Soft deletes leave types
- `FindLeaveTypePaginatedListUseCase` - Queries updated leave types
- `RetrieveLeaveTypeForComboboxUseCase` - Retrieves updated leave types

## Security Considerations

- Requires authenticated user ID
- Validates all referenced entities exist
- Logs all operations for audit trail
- Uses transaction isolation for data consistency

## Performance Notes

- Single validation query for leave type existence
- Single update operation for leave type
- Single retrieval operation for updated leave type
- Efficient error handling with early validation
- Transaction overhead for data consistency

## Integration Examples

### Leave Type Management Interface

```typescript
// Update leave type from admin interface
const updatedLeaveType = await updateLeaveTypeUseCase.execute(
  leaveTypeId,
  {
    name: 'Annual Leave',
    description: 'Updated annual leave policy for employees',
  },
  adminUserId,
  requestInfo,
);

if (updatedLeaveType) {
  return { success: true, leaveType: updatedLeaveType };
} else {
  return { success: false, message: 'Leave type update failed' };
}
```

### Bulk Leave Type Updates

```typescript
// Update multiple leave types
const leaveTypeUpdates = [
  { id: 1, dto: updateCommand1 },
  { id: 2, dto: updateCommand2 },
  { id: 3, dto: updateCommand3 },
];

const results = await Promise.all(
  leaveTypeUpdates.map(({ id, dto }) =>
    updateLeaveTypeUseCase.execute(id, dto, userId, requestInfo),
  ),
);

const successCount = results.filter((r) => r !== null).length;
console.log(
  `Successfully updated ${successCount} out of ${leaveTypeUpdates.length} leave types`,
);
```

### React Component Integration

```typescript
// React component for leave type editing
const LeaveTypeEditForm = ({ leaveTypeId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing leave type data
    loadLeaveTypeData();
  }, [leaveTypeId]);

  const loadLeaveTypeData = async () => {
    // Implementation to load existing data
    // This would typically use a find use case
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedLeaveType = await updateLeaveTypeUseCase.execute(
        leaveTypeId,
        formData,
        currentUserId,
        requestInfo,
      );

      if (updatedLeaveType) {
        onSave(updatedLeaveType);
        showNotification('Leave type updated successfully');
      }
    } catch (error) {
      console.error('Failed to update leave type:', error);
      showNotification('Failed to update leave type', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Leave Type'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
};
```

### Validation Before Update

```typescript
// Validate leave type before update
const validateLeaveTypeUpdate = async (
  id: number,
  dto: UpdateLeaveTypeCommand,
) => {
  const validationErrors = [];

  // Check if leave type exists
  const existingLeaveType = await findLeaveTypeByIdUseCase.execute(id);
  if (!existingLeaveType) {
    validationErrors.push('Leave type not found');
  }

  // Check if name is unique (if name is being updated)
  if (dto.name && dto.name !== existingLeaveType?.name) {
    const existingWithName = await findLeaveTypeByNameUseCase.execute(dto.name);
    if (existingWithName) {
      validationErrors.push('Leave type name already exists');
    }
  }

  // Check if leave type is in use by active policies
  if (existingLeaveType) {
    const activePolicies = await findLeavePolicyPaginatedListUseCase.execute(
      '',
      1,
      1000,
    );
    const policiesUsingLeaveType = activePolicies.data.filter(
      (policy) => policy.leaveTypeId === id,
    );

    if (policiesUsingLeaveType.length > 0) {
      validationErrors.push(
        `Cannot update leave type. ${policiesUsingLeaveType.length} active policies are using this leave type.`,
      );
    }
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
  };
};
```

### Update with Validation

```typescript
// Update with comprehensive validation
const updateLeaveTypeWithValidation = async (
  id: number,
  dto: UpdateLeaveTypeCommand,
  userId: string,
  requestInfo?: object,
) => {
  // Validate before update
  const validation = await validateLeaveTypeUpdate(id, dto);

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Proceed with update
  return await updateLeaveTypeUseCase.execute(id, dto, userId, requestInfo);
};
```

### Audit Trail Integration

```typescript
// Enhanced update with audit trail
const updateLeaveTypeWithAudit = async (
  id: number,
  dto: UpdateLeaveTypeCommand,
  userId: string,
  requestInfo?: object,
) => {
  // Get original data for audit
  const originalLeaveType = await findLeaveTypeByIdUseCase.execute(id);

  if (!originalLeaveType) {
    throw new Error('Leave type not found');
  }

  // Perform update
  const updatedLeaveType = await updateLeaveTypeUseCase.execute(
    id,
    dto,
    userId,
    requestInfo,
  );

  if (updatedLeaveType) {
    // Create audit record
    await createAuditRecordUseCase.execute({
      entityType: 'LEAVE_TYPE',
      entityId: id,
      action: 'UPDATE',
      userId,
      changes: {
        before: originalLeaveType,
        after: updatedLeaveType,
      },
      requestInfo,
    });
  }

  return updatedLeaveType;
};
```

## Error Recovery

```typescript
// Error recovery for failed updates
const recoverFromUpdateFailure = async (
  id: number,
  dto: UpdateLeaveTypeCommand,
  userId: string,
  requestInfo?: object,
) => {
  try {
    return await updateLeaveTypeUseCase.execute(id, dto, userId, requestInfo);
  } catch (error) {
    console.error('Update failed, attempting recovery:', error);

    // Check if leave type still exists
    const leaveType = await findLeaveTypeByIdUseCase.execute(id);
    if (!leaveType) {
      throw new Error('Leave type no longer exists');
    }

    // Attempt partial update
    const partialUpdate = {
      ...dto,
      // Remove problematic fields
      name: dto.name || leaveType.name,
    };

    return await updateLeaveTypeUseCase.execute(
      id,
      partialUpdate,
      userId,
      requestInfo,
    );
  }
};
```

## Performance Optimization

### Batch Updates

```typescript
// Batch update multiple leave types
const batchUpdateLeaveTypes = async (
  updates: Array<{ id: number; dto: UpdateLeaveTypeCommand }>,
  userId: string,
  requestInfo?: object,
) => {
  const results = [];

  // Process in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(({ id, dto }) =>
        updateLeaveTypeUseCase.execute(id, dto, userId, requestInfo),
      ),
    );

    results.push(...batchResults);
  }

  return results;
};
```

## Best Practices

1. Always validate leave type existence before updating
2. Check for dependencies (active policies) before updating
3. Implement proper error handling and user feedback
4. Use transactions for data consistency
5. Maintain audit trail for all updates
6. Consider impact on related entities
7. Implement proper authorization checks
8. Use appropriate validation rules
9. Consider performance implications for bulk updates
10. Implement proper rollback strategies
