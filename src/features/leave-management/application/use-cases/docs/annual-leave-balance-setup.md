# Annual Leave Balance Setup Guide

## Overview

The initial setup for leave management begins with generating annual leave balances for all active employees. This process creates the foundation for all leave-related operations throughout the year.

## Initial Setup Process

### Step 1: Generate Annual Leave Balances

The primary use case for initial setup is `GenerateAnnualLeaveBalancesUseCase`. This process:

1. **Retrieves all active leave policies** from the system
2. **Finds all active employees**
3. **Creates leave balance records** for each employee-policy combination
4. **Calculates carry-over days** from previous year balances (if any)
5. **Sets initial balance values** based on policy entitlements

### Implementation Example

```typescript
import { GenerateAnnualLeaveBalancesUseCase } from './leave-balance/generate-annual-leave-balances.use-case';

const generateAnnualLeaveBalancesUseCase =
  new GenerateAnnualLeaveBalancesUseCase();
// ... dependencies

const currentYear = new Date().getFullYear();

const result = await generateAnnualLeaveBalancesUseCase.execute(
  {
    year: currentYear,
    forceRegenerate: false, // Set to true to regenerate existing balances
  },
  userId,
  requestInfo,
);

console.log(`Generated ${result.generatedCount} new balances`);
console.log(`Skipped ${result.skippedCount} existing balances`);
```

### When to Use Initial Setup

- **System initialization**: When setting up leave management for the first time
- **New year preparation**: At the beginning of each calendar year
- **Bulk employee onboarding**: When adding many new employees
- **Policy changes**: When new leave policies are activated

### Business Rules

- **Manual balance updates are NOT allowed** - balances can only be updated through:

  - Leave Request approval/cancellation
  - Encashment approval
  - Year-end reset operations
  - Policy carry-over calculations

- **Carry-over logic**: Previous year's remaining days are carried forward up to the policy's carry limit
- **Duplicate prevention**: Existing balances are skipped unless `forceRegenerate` is true
- **Transaction safety**: All operations are wrapped in database transactions

### Prerequisites

Before running the initial setup, ensure:

1. **Active leave policies exist** in the system
2. **Active employees are registered**
3. **Leave types are configured**
4. **Database connection is available**

### Error Handling

The process includes comprehensive error handling:

- **Validation errors**: Missing policies or employees
- **Database errors**: Transaction rollback on failures
- **Audit logging**: All operations are logged for compliance
- **Graceful degradation**: Partial failures don't corrupt existing data

## Next Steps After Initial Setup

Once annual leave balances are generated:

1. **Leave requests** can be submitted and processed
2. **Balance updates** happen automatically through approved leave requests
3. **Mid-year adjustments** can be made through administrative operations
4. **Year-end closure** processes can be executed
5. **New year reset** can be performed for the following year

## Monitoring and Validation

After initial setup, verify:

- All active employees have balance records
- Balance values match policy entitlements
- Carry-over calculations are correct
- All records have proper audit trails
- System is ready for leave request processing
