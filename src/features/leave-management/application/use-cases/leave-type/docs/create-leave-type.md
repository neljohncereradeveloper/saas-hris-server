# Create Leave Type Use Case

## Overview

The `CreateLeaveTypeUseCase` is responsible for creating new leave type records. This use case handles the creation of leave types with proper validation, ensuring data integrity through transaction management.

## Purpose

- Create new leave type records
- Ensure data integrity through transaction management
- Provide comprehensive logging and error handling
- Support leave type management workflows

## Command Interface

### CreateLeaveTypeCommand

```typescript
interface CreateLeaveTypeCommand {
  name: string; // Name of the leave type
  description?: string; // Leave type description
  // ... other leave type fields
}
```

## Dependencies

- `LeaveTypeRepository` - Manages leave type operations
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Leave Type Creation

```typescript
// Create the leave type
const leaveType = await this.leaveTypeRepository.create(
  new LeaveType(dto),
  manager,
);
```

### 2. Return Created Leave Type

```typescript
return leaveType;
```

## Return Value

```typescript
Promise<LeaveType>; // Returns the created leave type object
```

## Error Handling

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Basic Creation

```typescript
const command: CreateLeaveTypeCommand = {
  name: 'Annual Leave',
  description: 'Standard annual leave for employees',
};

const leaveType = await createLeaveTypeUseCase.execute(
  command,
  userId,
  requestInfo,
);
```

### With Request Info

```typescript
const leaveType = await createLeaveTypeUseCase.execute(command, userId, {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  sessionId: 'session-123',
  username: 'hr-admin',
});
```

## Business Rules

1. All leave type fields are validated during creation
2. Creation operation is atomic (all or nothing)
3. All operations must be logged for audit purposes
4. Leave type name must be unique
5. Created leave type is returned after successful creation

## Leave Type Creation Fields

The following fields are required/optional:

- `name`: Leave type name (required)
- `description`: Leave type description (optional)
- Other leave type-specific fields

## Initial Status

All newly created leave types start with:

- **IsActive**: `true` (typically)
- **CreatedAt**: Current timestamp
- **CreatedBy**: User ID performing the operation

## Logging

The use case logs the following information:

- **Action**: `CREATE_LEAVE_TYPE`
- **Model**: `LEAVE_TYPE`
- **Success Message**: `Created new leave type: {name}`
- **Error Message**: `Failed to create leave type: {name}`

## Related Use Cases

- `UpdateLeaveTypeUseCase` - Updates created leave types
- `SoftDeleteLeaveTypeUseCase` - Soft deletes leave types
- `FindLeaveTypePaginatedListUseCase` - Queries created leave types
- `RetrieveLeaveTypeForComboboxUseCase` - Retrieves created leave types

## Security Considerations

- Requires authenticated user ID
- Logs all operations for audit trail
- Uses transaction isolation for data consistency

## Performance Notes

- Single insert operation for new leave type
- Efficient error handling
- Transaction overhead for data consistency

## Integration Examples

### Leave Type Management Interface

```typescript
// Create leave type from admin interface
const newLeaveType = await createLeaveTypeUseCase.execute(
  {
    name: 'Sick Leave',
    description: 'Leave for illness or medical appointments',
  },
  adminUserId,
  requestInfo,
);

if (newLeaveType) {
  return { success: true, leaveType: newLeaveType };
} else {
  return { success: false, message: 'Leave type creation failed' };
}
```

### Bulk Leave Type Creation

```typescript
// Create multiple leave types
const leaveTypeCommands = [
  {
    name: 'Annual Leave',
    description: 'Standard annual leave',
  },
  {
    name: 'Sick Leave',
    description: 'Leave for illness',
  },
  {
    name: 'Personal Leave',
    description: 'Personal time off',
  },
];

const results = await Promise.all(
  leaveTypeCommands.map((command) =>
    createLeaveTypeUseCase.execute(command, userId, requestInfo),
  ),
);

const successCount = results.filter((r) => r !== null).length;
console.log(
  `Successfully created ${successCount} out of ${leaveTypeCommands.length} leave types`,
);
```

### React Component Integration

```typescript
// React component for leave type creation
const CreateLeaveTypeForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newLeaveType = await createLeaveTypeUseCase.execute(
        formData,
        currentUserId,
        requestInfo,
      );

      if (newLeaveType) {
        onSave(newLeaveType);
        showNotification('Leave type created successfully');
        setFormData({ name: '', description: '' }); // Reset form
      }
    } catch (error) {
      console.error('Failed to create leave type:', error);
      showNotification('Failed to create leave type', 'error');
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
        {loading ? 'Creating...' : 'Create Leave Type'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
};
```

### Validation Before Creation

```typescript
// Validate leave type before creation
const validateLeaveTypeCreation = async (dto: CreateLeaveTypeCommand) => {
  const validationErrors = [];

  // Check if name is provided
  if (!dto.name || dto.name.trim() === '') {
    validationErrors.push('Leave type name is required');
  }

  // Check if name is unique
  if (dto.name) {
    const existingLeaveType = await findLeaveTypeByNameUseCase.execute(
      dto.name,
    );
    if (existingLeaveType) {
      validationErrors.push('Leave type name already exists');
    }
  }

  // Check name length
  if (dto.name && dto.name.length > 100) {
    validationErrors.push('Leave type name must be less than 100 characters');
  }

  // Check description length
  if (dto.description && dto.description.length > 500) {
    validationErrors.push(
      'Leave type description must be less than 500 characters',
    );
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
  };
};
```

### Create with Validation

```typescript
// Create with comprehensive validation
const createLeaveTypeWithValidation = async (
  dto: CreateLeaveTypeCommand,
  userId: string,
  requestInfo?: object,
) => {
  // Validate before creation
  const validation = await validateLeaveTypeCreation(dto);

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Proceed with creation
  return await createLeaveTypeUseCase.execute(dto, userId, requestInfo);
};
```

### Leave Type Template Creation

```typescript
// Create leave types from templates
const createLeaveTypesFromTemplates = async (
  userId: string,
  requestInfo?: object,
) => {
  const templates = [
    {
      name: 'Annual Leave',
      description: 'Standard annual leave for employees',
    },
    {
      name: 'Sick Leave',
      description: 'Leave for illness or medical appointments',
    },
    {
      name: 'Personal Leave',
      description: 'Personal time off for various reasons',
    },
    {
      name: 'Maternity Leave',
      description: 'Leave for maternity purposes',
    },
    {
      name: 'Paternity Leave',
      description: 'Leave for paternity purposes',
    },
    {
      name: 'Study Leave',
      description: 'Leave for educational purposes',
    },
  ];

  const results = await Promise.all(
    templates.map(async (template) => {
      try {
        return await createLeaveTypeUseCase.execute(
          template,
          userId,
          requestInfo,
        );
      } catch (error) {
        console.error(`Failed to create leave type ${template.name}:`, error);
        return null;
      }
    }),
  );

  const successCount = results.filter((r) => r !== null).length;
  console.log(
    `Successfully created ${successCount} out of ${templates.length} leave types from templates`,
  );

  return results;
};
```

### Audit Trail Integration

```typescript
// Enhanced creation with audit trail
const createLeaveTypeWithAudit = async (
  dto: CreateLeaveTypeCommand,
  userId: string,
  requestInfo?: object,
) => {
  // Perform creation
  const newLeaveType = await createLeaveTypeUseCase.execute(
    dto,
    userId,
    requestInfo,
  );

  if (newLeaveType) {
    // Create audit record
    await createAuditRecordUseCase.execute({
      entityType: 'LEAVE_TYPE',
      entityId: newLeaveType.id!,
      action: 'CREATE',
      userId,
      changes: {
        after: newLeaveType,
      },
      requestInfo,
    });
  }

  return newLeaveType;
};
```

### Error Recovery

```typescript
// Error recovery for failed creation
const recoverFromCreationFailure = async (
  dto: CreateLeaveTypeCommand,
  userId: string,
  requestInfo?: object,
) => {
  try {
    return await createLeaveTypeUseCase.execute(dto, userId, requestInfo);
  } catch (error) {
    console.error('Creation failed, attempting recovery:', error);

    // Check if leave type was actually created (race condition)
    const existingLeaveType = await findLeaveTypeByNameUseCase.execute(
      dto.name,
    );
    if (existingLeaveType) {
      console.log('Leave type already exists, returning existing record');
      return existingLeaveType;
    }

    // Attempt creation with modified data
    const modifiedDto = {
      ...dto,
      name: `${dto.name}_${Date.now()}`, // Add timestamp to make unique
    };

    return await createLeaveTypeUseCase.execute(
      modifiedDto,
      userId,
      requestInfo,
    );
  }
};
```

### Performance Optimization

### Batch Creation

```typescript
// Batch create multiple leave types
const batchCreateLeaveTypes = async (
  commands: CreateLeaveTypeCommand[],
  userId: string,
  requestInfo?: object,
) => {
  const results = [];

  // Process in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < commands.length; i += batchSize) {
    const batch = commands.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map((command) =>
        createLeaveTypeUseCase.execute(command, userId, requestInfo),
      ),
    );

    results.push(...batchResults);
  }

  return results;
};
```

### Duplicate Prevention

```typescript
// Create with duplicate prevention
const createLeaveTypeWithDuplicatePrevention = async (
  dto: CreateLeaveTypeCommand,
  userId: string,
  requestInfo?: object,
) => {
  // Check for existing leave type with same name
  const existingLeaveType = await findLeaveTypeByNameUseCase.execute(dto.name);

  if (existingLeaveType) {
    if (existingLeaveType.isActive) {
      throw new Error('Leave type with this name already exists');
    } else {
      // Reactivate existing inactive leave type
      await softDeleteLeaveTypeUseCase.execute(
        existingLeaveType.id!,
        true, // activate
        userId,
        requestInfo,
      );
      return existingLeaveType;
    }
  }

  // Create new leave type
  return await createLeaveTypeUseCase.execute(dto, userId, requestInfo);
};
```

## Best Practices

1. Always validate leave type data before creation
2. Check for duplicate names before creating
3. Implement proper error handling and user feedback
4. Use transactions for data consistency
5. Maintain audit trail for all creations
6. Consider implementing leave type templates
7. Implement proper authorization checks
8. Use appropriate validation rules
9. Consider performance implications for bulk creation
10. Implement proper rollback strategies

## Common Use Cases

- **Initial Setup**: Create standard leave types during system setup
- **Administrative Management**: Create new leave types through admin interface
- **Bulk Import**: Create multiple leave types from external data
- **Template Creation**: Create leave types from predefined templates
- **Custom Leave Types**: Create organization-specific leave types
- **Integration**: Create leave types from external HR systems
