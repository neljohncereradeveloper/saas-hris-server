# Find Leave Balance By Employee Year Use Case

## Overview

The `FindLeaveBalanceByEmployeeYearUseCase` is responsible for retrieving all leave balance records for a specific employee and year. This use case provides read-only access to leave balance data for reporting, display, and validation purposes.

## Purpose

- Retrieve all leave balances for a specific employee and year
- Support employee leave balance queries
- Provide data for reporting and dashboard displays
- Enable validation of existing balances

## Parameters

- `employeeId: number` - The ID of the employee
- `year: number` - The year for which to retrieve balances

## Dependencies

- `LeaveBalanceRepository` - Manages leave balance data access

## Execution Flow

### 1. Query Execution

```typescript
const leaveBalances = await this.leaveBalanceRepository.findByEmployeeYear(
  employeeId,
  year,
  null, // No transaction manager needed for read operations
);
```

### 2. Return Results

- Returns array of leave balance objects
- No additional processing or validation required
- Simple pass-through to repository layer

## Return Value

```typescript
Promise<LeaveBalance[]>; // Returns array of leave balance objects
```

## Usage Examples

### Basic Query

```typescript
const balances = await findLeaveBalanceByEmployeeYearUseCase.execute(
  123, // employeeId
  2024, // year
);

console.log(`Found ${balances.length} leave balances for employee 123 in 2024`);
```

### With Error Handling

```typescript
try {
  const balances = await findLeaveBalanceByEmployeeYearUseCase.execute(
    employeeId,
    year,
  );

  if (balances.length === 0) {
    console.log('No leave balances found for this employee and year');
  } else {
    balances.forEach((balance) => {
      console.log(`${balance.leaveType}: ${balance.remaining} days remaining`);
    });
  }
} catch (error) {
  console.error('Error retrieving leave balances:', error);
}
```

## Business Rules

1. Returns all leave balances for the specified employee and year
2. Includes balances regardless of status (OPEN, CLOSED)
3. Includes both active and inactive balances
4. No filtering or business logic applied at use case level
5. **Manual balance updates are NOT allowed** - balances can only be updated through:
   - Leave Request approval/cancellation
   - Encashment approval
   - Year-end reset operations
   - Policy carry-over calculations

## Data Structure

Each returned `LeaveBalance` object contains:

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
- Efficient repository-level querying
- Minimal processing overhead

## Error Handling

- Repository-level error handling
- No additional validation at use case level
- Simple error propagation to caller

## Related Use Cases

- `FindLeaveBalanceByLeaveTypeUseCase` - Find specific leave type balance
- `CreateLeaveBalanceUseCase` - Create balances that can be queried
- `GenerateAnnualLeaveBalancesUseCase` - Creates balances that can be queried
- `CloseLeaveBalanceUseCase` - Modifies balances that can be queried

## Use Cases

- **Employee Dashboard**: Display all leave balances for an employee
- **Leave Request Validation**: Check available balances before processing requests
- **Reporting**: Generate employee-specific leave reports
- **Audit**: Review employee leave balance history
- **Integration**: Provide data for external systems

## Security Considerations

- Read-only operation (no data modification)
- No additional authorization checks at use case level
- Repository layer handles data access permissions
- Consider implementing employee-specific access controls

## Integration Examples

### Dashboard Integration

```typescript
// Get employee balances for dashboard display
const balances = await findLeaveBalanceByEmployeeYearUseCase.execute(
  currentEmployeeId,
  currentYear,
);

const dashboardData = balances.map((balance) => ({
  leaveType: balance.leaveType,
  remaining: balance.remaining,
  used: balance.used,
  status: balance.status,
}));
```

### Leave Request Validation

```typescript
// Check if employee has sufficient balance for leave request
const balances = await findLeaveBalanceByEmployeeYearUseCase.execute(
  employeeId,
  year,
);

const annualLeaveBalance = balances.find((b) => b.leaveType === 'Annual Leave');
if (!annualLeaveBalance || annualLeaveBalance.remaining < requestedDays) {
  throw new Error('Insufficient leave balance');
}
```
