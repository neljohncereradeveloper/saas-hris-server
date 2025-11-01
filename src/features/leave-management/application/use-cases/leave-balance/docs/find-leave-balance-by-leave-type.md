# Find Leave Balance By Leave Type Use Case

## Overview

The `FindLeaveBalanceByLeaveTypeUseCase` is responsible for retrieving a specific leave balance record for an employee based on leave type and year. This use case provides targeted access to individual leave balance data for specific leave types.

## Purpose

- Retrieve specific leave balance for employee, leave type, and year
- Support targeted leave balance queries
- Enable validation of specific leave type balances
- Provide data for leave request processing

## Parameters

- `employeeId: number` - The ID of the employee
- `leaveTypeId: number` - The ID of the leave type
- `year: number` - The year for which to retrieve the balance

## Dependencies

- `LeaveBalanceRepository` - Manages leave balance data access

## Execution Flow

### 1. Query Execution

```typescript
const leaveBalance = await this.leaveBalanceRepository.findByLeaveType(
  employeeId,
  leaveTypeId,
  year,
  null, // No transaction manager needed for read operations
);
```

### 2. Return Result

- Returns single leave balance object or null
- No additional processing or validation required
- Simple pass-through to repository layer

## Return Value

```typescript
Promise<LeaveBalance | null>; // Returns leave balance object or null if not found
```

## Usage Examples

### Basic Query

```typescript
const balance = await findLeaveBalanceByLeaveTypeUseCase.execute(
  123, // employeeId
  456, // leaveTypeId
  2024, // year
);

if (balance) {
  console.log(`Annual Leave balance: ${balance.remaining} days remaining`);
} else {
  console.log('No Annual Leave balance found for this employee and year');
}
```

### Leave Request Validation

```typescript
const annualLeaveBalance = await findLeaveBalanceByLeaveTypeUseCase.execute(
  employeeId,
  annualLeaveTypeId,
  currentYear,
);

if (!annualLeaveBalance) {
  throw new Error('No Annual Leave balance found for this employee');
}

if (annualLeaveBalance.remaining < requestedDays) {
  throw new Error('Insufficient Annual Leave balance');
}

if (annualLeaveBalance.status !== 'OPEN') {
  throw new Error('Annual Leave balance is closed');
}
```

### With Error Handling

```typescript
try {
  const balance = await findLeaveBalanceByLeaveTypeUseCase.execute(
    employeeId,
    leaveTypeId,
    year,
  );

  if (balance) {
    return {
      available: balance.remaining,
      used: balance.used,
      earned: balance.earned,
      carriedOver: balance.carriedOver,
      status: balance.status,
    };
  } else {
    return null;
  }
} catch (error) {
  console.error('Error retrieving leave balance:', error);
  throw error;
}
```

## Business Rules

1. Returns specific leave balance for employee, leave type, and year combination
2. Returns null if no matching balance found
3. No filtering by status or active flag at use case level
4. Repository handles the exact matching logic
5. **Manual balance updates are NOT allowed** - balances can only be updated through:
   - Leave Request approval/cancellation
   - Encashment approval
   - Year-end reset operations
   - Policy carry-over calculations

## Data Structure

The returned `LeaveBalance` object contains:

- `employeeId`: Employee identifier
- `leaveTypeId`: Leave type identifier
- `leaveType`: Leave type name
- `policyId`: Applied policy identifier
- `year`: Balance year
- `beginningBalance`: Starting balance
- `earned`: Days earned from policy
- `used`: Days used
- `carriedOver`: Days carried from previous year
- `encashed`: Days encashed
- `remaining`: Days remaining
- `status`: Balance status (OPEN/CLOSED)
- `lastTransactionDate`: Last modification date
- `remarks`: Additional notes
- `isActive`: Active status flag

## Performance Notes

- Single database query operation
- No transaction overhead (read-only)
- Efficient repository-level querying with specific criteria
- Minimal processing overhead

## Error Handling

- Repository-level error handling
- No additional validation at use case level
- Simple error propagation to caller
- Null return for not found cases

## Related Use Cases

- `FindLeaveBalanceByEmployeeYearUseCase` - Find all balances for employee/year
- `CreateLeaveBalanceUseCase` - Create balances that can be queried
- `GenerateAnnualLeaveBalancesUseCase` - Creates balances that can be queried
- `CloseLeaveBalanceUseCase` - Modifies balances that can be queried

## Use Cases

- **Leave Request Processing**: Validate available balance for specific leave type
- **Balance Display**: Show specific leave type balance in UI
- **Policy Application**: Check balance before applying policy rules
- **Audit**: Review specific leave type usage
- **Integration**: Provide targeted data for external systems

## Security Considerations

- Read-only operation (no data modification)
- No additional authorization checks at use case level
- Repository layer handles data access permissions
- Consider implementing employee-specific access controls

## Integration Examples

### Leave Request Service Integration

```typescript
// Validate leave request against specific balance
const balance = await findLeaveBalanceByLeaveTypeUseCase.execute(
  request.employeeId,
  request.leaveTypeId,
  request.year,
);

if (!balance) {
  throw new LeaveBalanceNotFoundError('No balance found for this leave type');
}

if (balance.remaining < request.days) {
  throw new InsufficientBalanceError('Insufficient leave balance');
}
```

### Dashboard Integration

```typescript
// Get specific leave type balance for dashboard
const annualLeaveBalance = await findLeaveBalanceByLeaveTypeUseCase.execute(
  employeeId,
  annualLeaveTypeId,
  currentYear,
);

const sickLeaveBalance = await findLeaveBalanceByLeaveTypeUseCase.execute(
  employeeId,
  sickLeaveTypeId,
  currentYear,
);

const dashboardData = {
  annualLeave: annualLeaveBalance?.remaining || 0,
  sickLeave: sickLeaveBalance?.remaining || 0,
};
```

### Policy Validation

```typescript
// Check balance before applying policy changes
const currentBalance = await findLeaveBalanceByLeaveTypeUseCase.execute(
  employeeId,
  leaveTypeId,
  year,
);

if (currentBalance && currentBalance.status === 'CLOSED') {
  throw new Error('Cannot modify closed leave balance');
}
```
