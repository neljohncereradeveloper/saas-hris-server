# Update Leave Policy Use Case

## Overview

The `UpdateLeavePolicyUseCase` is responsible for updating existing leave policy records. This use case handles the modification of leave policy details while ensuring data integrity through validation and transaction management.

## Purpose

- Update existing leave policy records
- Validate leave type existence before updating
- Maintain data integrity through transaction management
- Provide comprehensive logging and error handling

## Parameters

- `id: number` - The ID of the leave policy to update
- `dto: UpdateLeavePolicyCommand` - The update data transfer object
- `userId: string` - ID of the user performing the operation
- `requestInfo?: object` - Optional request metadata (IP, user agent, session, username)

## Dependencies

- `LeavePolicyRepository` - Manages leave policy operations
- `LeaveTypeRepository` - Validates leave type existence
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

// Validate leave type existence
const leaveType = await this.leaveTypeRepository.findByName(
  dto.leaveType!,
  manager,
);
if (!leaveType) {
  throw new NotFoundException('Leave type not found');
}
```

### 2. Update Operation

```typescript
// Update the leave policy
const updateSuccessfull = await this.leavePolicyRepository.update(
  id,
  {
    ...dto,
    leaveTypeId: leaveType.id!,
    leaveType: leaveType.name,
  },
  manager,
);
```

### 3. Return Updated Policy

```typescript
// Retrieve the updated leave policy
const leavePolicy = await this.leavePolicyRepository.findById(id, manager);
return leavePolicy!;
```

## Return Value

```typescript
Promise<LeavePolicy | null>; // Returns the updated leave policy object
```

## Error Handling

### Validation Errors

- **NotFoundException**: Thrown when leave policy with given ID doesn't exist
- **NotFoundException**: Thrown when leave type doesn't exist
- **SomethinWentWrongException**: Thrown when update operation fails

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Basic Update

```typescript
const updateCommand: UpdateLeavePolicyCommand = {
  leaveType: 'Annual Leave',
  annualEntitlement: 25,
  carryLimit: 5,
  // ... other policy fields
};

const updatedPolicy = await updateLeavePolicyUseCase.execute(
  123, // policy ID
  updateCommand,
  userId,
  requestInfo,
);
```

### With Request Info

```typescript
const updatedPolicy = await updateLeavePolicyUseCase.execute(
  policyId,
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

1. Leave policy must exist before updating
2. Leave type must exist and be valid
3. All policy fields are validated during update
4. Leave type ID and name are automatically resolved from leave type name
5. Update operation is atomic (all or nothing)
6. All operations must be logged for audit purposes

## Policy Update Fields

The following fields can be updated:

- `leaveType`: Leave type name (validated against existing types)
- `annualEntitlement`: Annual leave entitlement days
- `carryLimit`: Maximum days that can be carried over
- `description`: Policy description
- `effectiveDate`: When the policy becomes effective
- `expiryDate`: When the policy expires
- Other policy-specific fields

## Logging

The use case logs the following information:

- **Action**: `UPDATE_LEAVE_POLICY`
- **Model**: `LEAVE_POLICY`
- **Success Message**: `Updated leave policy with ID: {id}`
- **Error Message**: `Failed to update leave policy with ID: {id}`

## Related Use Cases

- `CreateLeavePolicyUseCase` - Creates policies that can be updated
- `ActivatePolicyUseCase` - Activates updated policies
- `RetirePolicyUseCase` - Retires policies
- `SoftDeleteLeavePolicyUseCase` - Soft deletes policies

## Security Considerations

- Requires authenticated user ID
- Validates all referenced entities exist
- Logs all operations for audit trail
- Uses transaction isolation for data consistency

## Performance Notes

- Multiple validation queries (policy existence, leave type)
- Single update operation
- Single retrieval operation for updated policy
- Efficient error handling with early validation
- Transaction overhead for data consistency

## Integration Examples

### Policy Management Interface

```typescript
// Update policy from admin interface
const updatedPolicy = await updateLeavePolicyUseCase.execute(
  policyId,
  {
    leaveType: 'Annual Leave',
    annualEntitlement: 30,
    carryLimit: 10,
    description: 'Updated annual leave policy',
  },
  adminUserId,
  requestInfo,
);

if (updatedPolicy) {
  return { success: true, policy: updatedPolicy };
} else {
  return { success: false, message: 'Policy update failed' };
}
```

### Bulk Policy Updates

```typescript
// Update multiple policies
const policyUpdates = [
  { id: 1, dto: updateCommand1 },
  { id: 2, dto: updateCommand2 },
  { id: 3, dto: updateCommand3 },
];

const results = await Promise.all(
  policyUpdates.map(({ id, dto }) =>
    updateLeavePolicyUseCase.execute(id, dto, userId, requestInfo),
  ),
);

const successCount = results.filter((r) => r !== null).length;
console.log(
  `Successfully updated ${successCount} out of ${policyUpdates.length} policies`,
);
```
