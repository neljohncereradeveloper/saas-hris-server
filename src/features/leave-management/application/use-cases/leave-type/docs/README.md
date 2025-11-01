# Leave Type Use Cases Documentation

## Overview

This directory contains comprehensive documentation for all leave type use cases in the Leave Management system. Each use case is documented with detailed explanations, usage examples, and integration patterns.

## Leave Type Management

The Leave Type module handles the creation, management, and retrieval of leave types within the HRIS system. Leave types define the different categories of leave available to employees (e.g., Annual Leave, Sick Leave, Personal Leave).

## Use Cases Index

### 1. [Create Leave Type](./create-leave-type.md)

- **Purpose**: Creates new leave type records
- **Key Features**: Validation, transaction management, audit logging
- **Use Cases**: Initial setup, administrative management, bulk import

### 2. [Update Leave Type](./update-leave-type.md)

- **Purpose**: Updates existing leave type records
- **Key Features**: Existence validation, atomic updates, comprehensive logging
- **Use Cases**: Administrative updates, data correction, policy changes

### 3. [Soft Delete Leave Type](./soft-delete-leave-type.md)

- **Purpose**: Soft deletes leave type records (mark as inactive)
- **Key Features**: Reversible operations, data preservation, audit trails
- **Use Cases**: Temporary deactivation, data correction, compliance

### 4. [Find Leave Type Paginated List](./find-leave-type-paginated-list.md)

- **Purpose**: Retrieves leave types with pagination and search
- **Key Features**: Pagination support, search filtering, efficient data access
- **Use Cases**: Administrative interfaces, reporting, bulk operations

### 5. [Retrieve Leave Type for Combobox](./retrieve-leave-type-for-combobox.md)

- **Purpose**: Retrieves leave types formatted for UI components
- **Key Features**: Value-label structure, UI optimization, simple data format
- **Use Cases**: Form controls, dropdown components, UI integration

## Business Rules and Update Restrictions

### Leave Type Management Rules

1. **Leave Type Creation**:

   - Leave type names must be unique
   - All required fields must be provided
   - Creation is atomic (all or nothing)

2. **Leave Type Updates**:

   - Leave type must exist before updating
   - Name uniqueness must be maintained
   - Updates are atomic operations

3. **Leave Type Deactivation**:

   - Soft delete preserves all data
   - Can be reversed by reactivation
   - Consider impact on related entities (policies, requests)

4. **Leave Type Queries**:
   - Pagination supports large datasets
   - Search functionality for efficient filtering
   - Combobox format optimized for UI components

### Administrative Operations vs. Value Modifications

**Administrative Operations** (Safe to perform):

- Creating new leave types
- Soft deleting leave types (deactivation/reactivation)
- Querying leave types (read-only operations)

**Value Modifications** (Require careful consideration):

- Updating leave type names/descriptions
- Changing leave type properties

**This distinction is important because**:

- Administrative operations don't affect leave calculations
- Value modifications may impact existing leave policies and requests
- Proper validation ensures data integrity

## Data Flow

```
Leave Type Creation → Validation → Database Insert → Audit Log
Leave Type Update → Existence Check → Validation → Database Update → Audit Log
Leave Type Soft Delete → Existence Check → Status Update → Audit Log
Leave Type Query → Database Query → Data Formatting → Return Results
```

## Integration Patterns

### 1. Administrative Interface Integration

```typescript
// Complete leave type management workflow
const manageLeaveTypes = async () => {
  // Create new leave type
  const newLeaveType = await createLeaveTypeUseCase.execute(
    { name: 'Study Leave', description: 'Leave for educational purposes' },
    userId,
    requestInfo,
  );

  // Update leave type
  const updatedLeaveType = await updateLeaveTypeUseCase.execute(
    newLeaveType.id!,
    {
      name: 'Educational Leave',
      description: 'Leave for educational and training purposes',
    },
    userId,
    requestInfo,
  );

  // Query leave types
  const leaveTypes = await findLeaveTypePaginatedListUseCase.execute('', 1, 10);

  // Soft delete if needed
  await softDeleteLeaveTypeUseCase.execute(
    updatedLeaveType.id!,
    false, // deactivate
    userId,
    requestInfo,
  );
};
```

### 2. UI Component Integration

```typescript
// React component integration
const LeaveTypeManager = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);

  useEffect(() => {
    // Load paginated list for management
    loadLeaveTypes();

    // Load combobox options for forms
    loadLeaveTypeOptions();
  }, []);

  const loadLeaveTypes = async () => {
    const result = await findLeaveTypePaginatedListUseCase.execute('', 1, 20);
    setLeaveTypes(result.data);
  };

  const loadLeaveTypeOptions = async () => {
    const options = await retrieveLeaveTypeForComboboxUseCase.execute();
    setLeaveTypeOptions(options);
  };

  const handleCreateLeaveType = async (formData) => {
    const newLeaveType = await createLeaveTypeUseCase.execute(
      formData,
      userId,
      requestInfo,
    );
    if (newLeaveType) {
      await loadLeaveTypes(); // Refresh list
      await loadLeaveTypeOptions(); // Refresh options
    }
  };

  const handleUpdateLeaveType = async (id, formData) => {
    const updatedLeaveType = await updateLeaveTypeUseCase.execute(
      id,
      formData,
      userId,
      requestInfo,
    );
    if (updatedLeaveType) {
      await loadLeaveTypes(); // Refresh list
    }
  };

  const handleSoftDeleteLeaveType = async (id, isActive) => {
    const result = await softDeleteLeaveTypeUseCase.execute(
      id,
      isActive,
      userId,
      requestInfo,
    );
    if (result) {
      await loadLeaveTypes(); // Refresh list
      await loadLeaveTypeOptions(); // Refresh options
    }
  };
};
```

### 3. Bulk Operations Integration

```typescript
// Bulk leave type operations
const bulkLeaveTypeOperations = async () => {
  // Bulk creation
  const templates = [
    { name: 'Annual Leave', description: 'Standard annual leave' },
    { name: 'Sick Leave', description: 'Leave for illness' },
    { name: 'Personal Leave', description: 'Personal time off' },
  ];

  const createdLeaveTypes = await Promise.all(
    templates.map((template) =>
      createLeaveTypeUseCase.execute(template, userId, requestInfo),
    ),
  );

  // Bulk updates
  const updates = createdLeaveTypes.map((leaveType) => ({
    id: leaveType.id!,
    dto: { description: `${leaveType.description} - Updated` },
  }));

  const updatedLeaveTypes = await Promise.all(
    updates.map(({ id, dto }) =>
      updateLeaveTypeUseCase.execute(id, dto, userId, requestInfo),
    ),
  );

  // Bulk soft delete
  const deactivationResults = await Promise.all(
    updatedLeaveTypes.map((leaveType) =>
      softDeleteLeaveTypeUseCase.execute(
        leaveType.id!,
        false,
        userId,
        requestInfo,
      ),
    ),
  );
};
```

## Error Handling

All use cases implement comprehensive error handling:

- **Validation Errors**: Input validation with clear error messages
- **Business Logic Errors**: Business rule violations
- **Database Errors**: Transaction failures and data integrity issues
- **System Errors**: Unexpected system failures

## Security Considerations

- **Authentication**: All operations require authenticated user ID
- **Authorization**: Role-based access control for leave type management
- **Audit Logging**: All operations are logged for compliance
- **Data Validation**: Input validation prevents malicious data
- **Transaction Safety**: Database transactions ensure data consistency

## Performance Considerations

- **Pagination**: Efficient handling of large datasets
- **Caching**: Consider caching for frequently accessed data
- **Batch Operations**: Optimized bulk operations
- **Database Indexing**: Proper indexing for search operations
- **Query Optimization**: Efficient database queries

## Testing Strategies

### Unit Testing

```typescript
// Example unit test
describe('CreateLeaveTypeUseCase', () => {
  it('should create leave type successfully', async () => {
    const command = { name: 'Test Leave', description: 'Test description' };
    const result = await createLeaveTypeUseCase.execute(
      command,
      userId,
      requestInfo,
    );

    expect(result).toBeDefined();
    expect(result.name).toBe(command.name);
    expect(result.description).toBe(command.description);
  });

  it('should handle validation errors', async () => {
    const command = { name: '', description: 'Test description' };

    await expect(
      createLeaveTypeUseCase.execute(command, userId, requestInfo),
    ).rejects.toThrow('Validation failed');
  });
});
```

### Integration Testing

```typescript
// Example integration test
describe('Leave Type Management Integration', () => {
  it('should complete full leave type lifecycle', async () => {
    // Create
    const created = await createLeaveTypeUseCase.execute(
      command,
      userId,
      requestInfo,
    );
    expect(created).toBeDefined();

    // Update
    const updated = await updateLeaveTypeUseCase.execute(
      created.id!,
      updateCommand,
      userId,
      requestInfo,
    );
    expect(updated.name).toBe(updateCommand.name);

    // Query
    const queried = await findLeaveTypePaginatedListUseCase.execute('', 1, 10);
    expect(queried.data).toContainEqual(
      expect.objectContaining({ id: created.id }),
    );

    // Soft delete
    const softDeleted = await softDeleteLeaveTypeUseCase.execute(
      created.id!,
      false,
      userId,
      requestInfo,
    );
    expect(softDeleted).toBe(true);
  });
});
```

## Monitoring and Logging

### Logging Levels

- **INFO**: Successful operations
- **WARN**: Validation failures, business rule violations
- **ERROR**: System errors, transaction failures
- **DEBUG**: Detailed operation flow

### Metrics to Monitor

- Leave type creation rate
- Leave type update frequency
- Query performance
- Error rates
- Transaction success rates

## Future Enhancements

### Planned Features

1. **Leave Type Templates**: Predefined leave type templates
2. **Bulk Import/Export**: CSV import/export functionality
3. **Leave Type Categories**: Grouping leave types by categories
4. **Advanced Search**: Full-text search capabilities
5. **Leave Type Dependencies**: Dependency management between leave types

### Performance Improvements

1. **Caching Layer**: Redis caching for frequently accessed data
2. **Database Optimization**: Query optimization and indexing
3. **Async Processing**: Background processing for bulk operations
4. **API Rate Limiting**: Rate limiting for API endpoints

## Related Documentation

- [Leave Balance Use Cases](../leave-balance/docs/README.md)
- [Leave Policy Use Cases](../leave-policy/docs/README.md)
- [Leave Management Domain Models](../../domain/models/README.md)
- [Leave Management Repositories](../../domain/repositories/README.md)

## Support and Maintenance

### Common Issues

1. **Duplicate Leave Type Names**: Ensure unique naming conventions
2. **Transaction Failures**: Check database connectivity and constraints
3. **Performance Issues**: Monitor query performance and implement caching
4. **Validation Errors**: Review input validation rules

### Troubleshooting

1. Check application logs for detailed error information
2. Verify database constraints and indexes
3. Review transaction isolation levels
4. Monitor system resources and performance metrics

### Maintenance Tasks

1. **Regular Cleanup**: Remove old soft-deleted leave types
2. **Performance Monitoring**: Monitor query performance
3. **Log Rotation**: Manage log file sizes
4. **Database Maintenance**: Regular database optimization
