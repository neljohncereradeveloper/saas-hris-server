# Create Leave Balance Use Case

## Overview

The `CreateLeaveBalanceUseCase` is responsible for creating individual leave balance records for specific employees. This use case handles the creation of new leave balances with proper validation, carry-over calculations, and policy application.

## Purpose

- Create individual leave balance records
- Validate employee, leave type, and policy existence
- Calculate carry-over days from previous year
- Apply leave policy rules for annual entitlements
- Ensure data integrity through comprehensive validation

## Command Interface

### CreateLeaveBalanceCommand

```typescript
interface CreateLeaveBalanceCommand {
  employeeId: number; // ID of the employee
  leaveType: string; // Name of the leave type
  policyId: number; // ID of the leave policy to apply
  year: number; // Year for the leave balance
}
```

## Dependencies

- `LeaveBalanceRepository` - Manages leave balance operations
- `LeaveTypeRepository` - Validates leave type existence
- `LeavePolicyRepository` - Retrieves and validates policies
- `EmployeeRepository` - Validates employee existence
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Validation Phase

Validates all required entities exist and are active:

```typescript
// Validate employee
const employee = await this.employeeRepository.findById(
  dto.employeeId,
  manager,
);
if (!employee) {
  throw new NotFoundException('Employee not found');
}

// Validate leave type
const leaveType = await this.leaveTypeRepository.findByName(
  dto.leaveType,
  manager,
);
if (!leaveType) {
  throw new NotFoundException('Leave type not found');
}

// Validate policy
const policy = await this.leavePolicyRepository.findById(dto.policyId, manager);
if (!policy || !policy.isActive) {
  throw new NotFoundException('Invalid or inactive policy');
}
```

### 2. Carry-Over Calculation

Retrieves and processes previous year balance:

```typescript
// Get previous year balance
const previousYearBalance = await this.leaveBalanceRepository.findByLeaveType(
  employee.id!,
  policy.leaveTypeId,
  dto.year - 1,
  manager,
);

// Calculate carry-over days
const carryOverDays = this.calculateCarryOverDays(previousYearBalance, policy);
```

### 3. Balance Creation

Creates new leave balance with calculated values:

```typescript
const leaveBalance = new LeaveBalance({
  employeeId: employee.id!,
  leaveTypeId: policy.leaveTypeId,
  leaveType: dto.leaveType,
  policyId: policy.id!,
  year: dto.year,
  beginningBalance: earnedDays + carryOverDays,
  earned: earnedDays,
  used: 0,
  carriedOver: carryOverDays,
  encashed: 0,
  remaining: earnedDays + carryOverDays,
  lastTransactionDate: new Date(),
  status: EnumLeaveBalanceStatus.OPEN,
  remarks: `Created leave balance for employee ${dto.employeeId}, leave type ${dto.leaveType}, year ${dto.year}`,
  isActive: true,
});
```

## Carry-Over Calculation Logic

```typescript
private calculateCarryOverDays(
  previousBalance: LeaveBalance | null,
  policy: LeavePolicy,
): number {
  if (!previousBalance) {
    return 0;  // No previous balance = no carry-over
  }

  // Calculate remaining days from previous year
  const remainingDays = previousBalance.remaining;

  // Apply carry limit from policy
  const carryOverDays = Math.min(remainingDays, policy.carryLimit);

  return Math.max(0, carryOverDays);  // Ensure non-negative
}
```

## Return Value

```typescript
Promise<LeaveBalance>; // Returns the created leave balance object
```

## Error Handling

### Validation Errors

- **NotFoundException**: Thrown when employee, leave type, or policy not found
- **NotFoundException**: Thrown when policy is inactive

### Transaction Management

- All operations wrapped in database transaction
- Automatic rollback on failure
- Comprehensive error logging with context

## Usage Examples

### Basic Creation

```typescript
const command: CreateLeaveBalanceCommand = {
  employeeId: 123,
  leaveType: 'Annual Leave',
  policyId: 456,
  year: 2024,
};

const leaveBalance = await createLeaveBalanceUseCase.execute(
  command,
  userId,
  requestInfo,
);
```

### With Request Info

```typescript
const leaveBalance = await createLeaveBalanceUseCase.execute(command, userId, {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  sessionId: 'session-123',
  username: 'hr-admin',
});
```

## Business Rules

1. Employee must exist and be active
2. Leave type must exist in the system
3. Policy must exist and be active
4. Carry-over days are limited by policy `carryLimit`
5. Beginning balance = annual entitlement + carry-over days
6. All new balances start with `OPEN` status
7. Previous year balance is optional (no carry-over if missing)
8. **Manual balance updates are NOT allowed** - balances can only be updated through:
   - Leave Request approval/cancellation
   - Encashment approval
   - Year-end reset operations
   - Policy carry-over calculations

## Balance Calculation Formula

```
beginningBalance = earnedDays + carryOverDays
earnedDays = policy.annualEntitlement
carryOverDays = min(previousYearRemaining, policy.carryLimit)
remaining = beginningBalance - used - encashed
```

## Logging

The use case logs the following information:

- **Action**: `CREATE_LEAVE_BALANCE`
- **Model**: `LEAVE_BALANCE`
- **Success Message**: `Created new leave balance for employee {employeeId}, leave type {leaveType}, year {year}`
- **Error Message**: `Failed to create leave balance for employee {employeeId}, leave type {leaveType}, year {year}`

## Related Use Cases

- `GenerateAnnualLeaveBalancesUseCase` - Bulk creation of balances
- `CloseLeaveBalanceUseCase` - Closing created balances
- `SoftDeleteLeaveBalanceUseCase` - Soft deleting balances
- `FindLeaveBalanceByEmployeeYearUseCase` - Finding created balances

## Security Considerations

- Requires authenticated user ID
- Validates all referenced entities exist
- Logs all operations for audit trail
- Uses transaction isolation for data consistency

## Performance Notes

- Multiple validation queries (employee, leave type, policy)
- Single query for previous year balance
- Single insert operation for new balance
- Efficient error handling with early validation
- Transaction overhead for data consistency
