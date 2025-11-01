# Generate Annual Leave Balances Use Case

## Overview

The `GenerateAnnualLeaveBalancesUseCase` is responsible for automatically generating leave balance records for all active employees based on active leave policies for a specific year. This use case handles the bulk creation of leave balances, including carry-over calculations from previous years.

## Purpose

- Automatically generate leave balance records for all active employees
- Apply leave policies to determine annual entitlements
- Calculate carry-over days from previous year balances
- Support force regeneration of existing balances
- Provide comprehensive logging and error handling

## Command Interface

### GenerateAnnualLeaveBalancesCommand

```typescript
interface GenerateAnnualLeaveBalancesCommand {
  year: number; // Target year for balance generation
  forceRegenerate?: boolean; // Optional flag to regenerate existing balances
}
```

## Dependencies

- `LeavePolicyRepository` - Retrieves active leave policies
- `LeaveBalanceRepository` - Manages leave balance operations
- `EmployeeRepository` - Retrieves active employees
- `TransactionPort` - Handles database transactions
- `ErrorHandlerPort` - Provides error handling and logging

## Execution Flow

### 1. Validation Phase

- Validates that active leave policies exist
- Validates that active employees exist
- Throws appropriate errors if prerequisites are not met

### 2. Balance Generation Process

For each active employee and each active leave policy:

1. **Check Existing Balance**

   - Queries for existing balance for the employee, leave type, and year
   - Skips generation if balance exists and `forceRegenerate` is false
   - Increments skipped count for tracking

2. **Calculate Carry-Over Days**

   - Retrieves previous year balance for the same employee and leave type
   - Applies policy carry-over rules to determine eligible days
   - Uses `Math.min(remainingDays, policy.carryLimit)` to respect limits

3. **Create New Balance Record**
   - Calculates beginning balance: `earnedDays + carryOverDays`
   - Sets initial values: earned, used (0), carriedOver, encashed (0)
   - Calculates remaining balance: `earnedDays + carryOverDays`
   - Sets status to `OPEN`
   - Records creation timestamp

### 3. Carry-Over Calculation Logic

```typescript
private calculateCarryOverDays(
  previousBalance: LeaveBalance | null,
  policy: LeavePolicy,
): number {
  if (!previousBalance) return 0;

  const remainingDays = previousBalance.remaining;
  const carryOverDays = Math.min(remainingDays, policy.carryLimit);

  return Math.max(0, carryOverDays);
}
```

## Return Value

```typescript
{
  generatedCount: number; // Number of new balances created
  skippedCount: number; // Number of existing balances skipped
}
```

## Error Handling

- **No Active Policies**: Throws error if no active leave policies found
- **No Active Employees**: Throws error if no active employees found
- **Transaction Rollback**: All operations are wrapped in database transactions
- **Comprehensive Logging**: All operations are logged with success/failure details

## Usage Examples

### Basic Generation

```typescript
const result = await generateAnnualLeaveBalancesUseCase.execute(
  { year: 2024 },
  userId,
  requestInfo,
);
// Generates balances for 2024, skipping existing ones
```

### Force Regeneration

```typescript
const result = await generateAnnualLeaveBalancesUseCase.execute(
  { year: 2024, forceRegenerate: true },
  userId,
  requestInfo,
);
// Regenerates all balances for 2024, overwriting existing ones
```

## Business Rules

1. Only active employees receive leave balances
2. Only active leave policies are applied
3. Carry-over days are limited by policy `carryLimit`
4. Beginning balance = annual entitlement + carry-over days
5. All balances start with `OPEN` status
6. Previous year balances must exist for carry-over calculation
7. **Manual balance updates are NOT allowed** - balances can only be updated through:
   - Leave Request approval/cancellation
   - Encashment approval
   - Year-end reset operations
   - Policy carry-over calculations

## Performance Considerations

- Uses database transactions for consistency
- Processes employees and policies in nested loops
- Includes skip logic to avoid unnecessary database operations
- Provides count tracking for monitoring bulk operations

## Related Use Cases

- `CreateLeaveBalanceUseCase` - For individual balance creation
- `ResetLeaveBalancesForYearUseCase` - For clearing existing balances
- `CloseLeaveBalanceUseCase` - For closing individual balances
