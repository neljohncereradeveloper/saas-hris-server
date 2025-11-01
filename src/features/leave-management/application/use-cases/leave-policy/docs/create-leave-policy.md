# Create Leave Policy Use Case

## Overview

The `CreateLeavePolicyUseCase` is responsible for creating new leave policy records. This use case handles the creation of leave policies with proper validation, ensuring that referenced leave types exist and maintaining data integrity.

## Purpose

- Create new leave policy records
- Validate leave type existence before creation
- Set initial policy status to 'draft'
- Ensure data integrity through transaction management
- Provide comprehensive logging and error handling

## Command Interface

### CreateLeavePolicyCommand

```typescript
interface CreateLeavePolicyCommand {
  leaveType: string; // Name of the leave type
  annualEntitlement: number; // Annual leave entitlement days
  carryLimit: number; // Maximum days that can be carried over
  description?: string; // Policy description
  effectiveDate?: Date; // When the policy becomes effective
  expiryDate?: Date; // When the policy expires
  // ... other policy fields
}
```

## Dependencies

- `LeavePolicyRepository` - Manages leave policy operations
- `LeaveTypeRepository` - Validates leave type existence
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Validation Phase

```typescript
// Validate leave type existence
const leaveType = await this.leaveTypeRepository.findByName(
  dto.leaveType,
  manager,
);
if (!leaveType) {
  throw new NotFoundException('Leave type not found');
}
```

### 2. Policy Creation

```typescript
// Create the leave policy
const leavePolicy = await this.leavePolicyRepository.create(
  new LeavePolicy({
    ...dto,
    leaveTypeId: leaveType.id!,
    leaveType: leaveType.name,
    status: 'draft' as any, // Will be set to draft initially
  }),
  manager,
);
```

### 3. Return Created Policy

```typescript
return leavePolicy;
```

## Return Value

```typescript
Promise<LeavePolicy>; // Returns the created leave policy object
```

## Error Handling

### Validation Errors

- **NotFoundException**: Thrown when leave type doesn't exist

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Basic Creation

```typescript
const command: CreateLeavePolicyCommand = {
  leaveType: 'Annual Leave',
  annualEntitlement: 25,
  carryLimit: 5,
  description: 'Standard annual leave policy',
  effectiveDate: new Date('2024-01-01'),
  expiryDate: new Date('2024-12-31'),
};

const leavePolicy = await createLeavePolicyUseCase.execute(
  command,
  userId,
  requestInfo,
);
```

### With Request Info

```typescript
const leavePolicy = await createLeavePolicyUseCase.execute(command, userId, {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  sessionId: 'session-123',
  username: 'hr-admin',
});
```

## Business Rules

1. Leave type must exist before creating policy
2. All policy fields are validated during creation
3. Leave type ID and name are automatically resolved from leave type name
4. New policies start with 'draft' status
5. Creation operation is atomic (all or nothing)
6. All operations must be logged for audit purposes

## Policy Creation Fields

The following fields are required/optional:

- `leaveType`: Leave type name (required, validated)
- `annualEntitlement`: Annual leave entitlement days (required)
- `carryLimit`: Maximum days that can be carried over (required)
- `description`: Policy description (optional)
- `effectiveDate`: When the policy becomes effective (optional)
- `expiryDate`: When the policy expires (optional)
- Other policy-specific fields

## Initial Status

All newly created policies start with:

- **Status**: `draft`
- **IsActive**: `true` (typically)
- **CreatedAt**: Current timestamp
- **CreatedBy**: User ID performing the operation

## Logging

The use case logs the following information:

- **Action**: `CREATE_LEAVE_POLICY`
- **Model**: `LEAVE_POLICY`
- **Success Message**: `Created new leave policy for leave type: {leaveType}`
- **Error Message**: `Failed to create leave policy for leave type: {leaveType}`

## Related Use Cases

- `UpdateLeavePolicyUseCase` - Updates created policies
- `ActivatePolicyUseCase` - Activates draft policies
- `RetirePolicyUseCase` - Retires active policies
- `SoftDeleteLeavePolicyUseCase` - Soft deletes policies

## Security Considerations

- Requires authenticated user ID
- Validates all referenced entities exist
- Logs all operations for audit trail
- Uses transaction isolation for data consistency

## Performance Notes

- Single validation query for leave type
- Single insert operation for new policy
- Efficient error handling with early validation
- Transaction overhead for data consistency

## Integration Examples

### Policy Management Interface

```typescript
// Create policy from admin interface
const newPolicy = await createLeavePolicyUseCase.execute(
  {
    leaveType: 'Annual Leave',
    annualEntitlement: 30,
    carryLimit: 10,
    description: 'New annual leave policy',
    effectiveDate: new Date('2024-01-01'),
  },
  adminUserId,
  requestInfo,
);

if (newPolicy) {
  return { success: true, policy: newPolicy };
} else {
  return { success: false, message: 'Policy creation failed' };
}
```

### Bulk Policy Creation

```typescript
// Create multiple policies
const policyCommands = [
  {
    leaveType: 'Annual Leave',
    annualEntitlement: 25,
    carryLimit: 5,
  },
  {
    leaveType: 'Sick Leave',
    annualEntitlement: 10,
    carryLimit: 0,
  },
  {
    leaveType: 'Personal Leave',
    annualEntitlement: 5,
    carryLimit: 0,
  },
];

const results = await Promise.all(
  policyCommands.map((command) =>
    createLeavePolicyUseCase.execute(command, userId, requestInfo),
  ),
);

const successCount = results.filter((r) => r !== null).length;
console.log(
  `Successfully created ${successCount} out of ${policyCommands.length} policies`,
);
```

### Policy Workflow

```typescript
// Complete policy creation workflow
const policy = await createLeavePolicyUseCase.execute(
  command,
  userId,
  requestInfo,
);

// Activate the policy after creation
if (policy) {
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
