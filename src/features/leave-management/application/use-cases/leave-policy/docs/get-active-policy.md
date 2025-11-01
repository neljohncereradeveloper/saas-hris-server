# Get Active Policy Use Case

## Overview

The `GetActivePolicyUseCase` is responsible for retrieving the active leave policy for a specific leave type and date. This use case provides read-only access to policy data for leave balance calculations and validation purposes.

## Purpose

- Retrieve active leave policy for specific leave type and date
- Support leave balance calculations
- Enable policy validation for leave requests
- Provide data for reporting and compliance

## Parameters

- `leaveTypeId: number` - The ID of the leave type
- `date: Date` - The date for which to retrieve the active policy

## Dependencies

- `LeavePolicyRepository` - Manages leave policy data access

## Execution Flow

### 1. Query Execution

```typescript
const activePolicy = await this.leavePolicyRepository.getActivePolicy(
  leaveTypeId,
  date,
  null, // No transaction manager needed for read operations
);
```

### 2. Return Result

```typescript
return activePolicy;
```

## Return Value

```typescript
Promise<LeavePolicy | null>; // Returns active policy object or null if not found
```

## Usage Examples

### Basic Query

```typescript
const activePolicy = await getActivePolicyUseCase.execute(
  123, // leaveTypeId
  new Date('2024-01-15'), // date
);

if (activePolicy) {
  console.log(`Active policy: ${activePolicy.description}`);
  console.log(`Annual entitlement: ${activePolicy.annualEntitlement} days`);
  console.log(`Carry limit: ${activePolicy.carryLimit} days`);
} else {
  console.log('No active policy found for this leave type and date');
}
```

### Leave Balance Calculation

```typescript
// Get active policy for leave balance calculation
const activePolicy = await getActivePolicyUseCase.execute(
  leaveTypeId,
  calculationDate,
);

if (!activePolicy) {
  throw new Error('No active policy found for leave type');
}

// Use policy for calculations
const annualEntitlement = activePolicy.annualEntitlement;
const carryLimit = activePolicy.carryLimit;
const effectiveDate = activePolicy.effectiveDate;
const expiryDate = activePolicy.expiryDate;
```

### Leave Request Validation

```typescript
// Validate leave request against active policy
const activePolicy = await getActivePolicyUseCase.execute(
  request.leaveTypeId,
  request.startDate,
);

if (!activePolicy) {
  throw new Error('No active policy found for this leave type');
}

// Check if request date is within policy effective period
if (request.startDate < activePolicy.effectiveDate) {
  throw new Error('Leave request date is before policy effective date');
}

if (activePolicy.expiryDate && request.startDate > activePolicy.expiryDate) {
  throw new Error('Leave request date is after policy expiry date');
}
```

## Business Rules

1. Returns active policy for specific leave type and date combination
2. Returns null if no active policy found for the criteria
3. Policy must be active and within effective date range
4. Only one policy per leave type should typically be active at a time
5. Date-based policy selection (considers effective/expiry dates)

## Data Structure

The returned `LeavePolicy` object contains:

- `id`: Policy identifier
- `leaveTypeId`: Leave type identifier
- `leaveType`: Leave type name
- `annualEntitlement`: Annual leave entitlement days
- `carryLimit`: Maximum days that can be carried over
- `description`: Policy description
- `effectiveDate`: When the policy becomes effective
- `expiryDate`: When the policy expires
- `status`: Policy status (active)
- `isActive`: Active status flag
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

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

- `CreateLeavePolicyUseCase` - Creates policies that can be queried
- `ActivatePolicyUseCase` - Activates policies that can be queried
- `RetirePolicyUseCase` - Retires policies (affects active status)
- `UpdateLeavePolicyUseCase` - Updates policies that can be queried

## Use Cases

- **Leave Balance Calculations**: Get policy for balance generation
- **Leave Request Processing**: Validate requests against active policy
- **Policy Compliance**: Check active policy rules
- **Reporting**: Generate reports based on active policies
- **Integration**: Provide policy data for external systems

## Security Considerations

- Read-only operation (no data modification)
- No additional authorization checks at use case level
- Repository layer handles data access permissions
- Consider implementing policy-specific access controls

## Integration Examples

### Leave Balance Generation

```typescript
// Get active policy for balance generation
const activePolicy = await getActivePolicyUseCase.execute(
  leaveTypeId,
  new Date(), // Current date
);

if (activePolicy) {
  // Use policy for balance calculations
  const earnedDays = activePolicy.annualEntitlement;
  const carryOverDays = Math.min(
    previousYearRemaining,
    activePolicy.carryLimit,
  );
  const beginningBalance = earnedDays + carryOverDays;

  // Create leave balance with policy data
  const leaveBalance = new LeaveBalance({
    // ... other fields
    policyId: activePolicy.id!,
    earned: earnedDays,
    carriedOver: carryOverDays,
    beginningBalance: beginningBalance,
  });
}
```

### Policy Validation Service

```typescript
// Validate policy for specific date range
const validatePolicyForDateRange = async (
  leaveTypeId: number,
  startDate: Date,
  endDate: Date,
) => {
  const activePolicy = await getActivePolicyUseCase.execute(
    leaveTypeId,
    startDate,
  );

  if (!activePolicy) {
    return { valid: false, reason: 'No active policy found' };
  }

  // Check if entire date range is covered by policy
  if (endDate > activePolicy.expiryDate) {
    return { valid: false, reason: 'Date range extends beyond policy expiry' };
  }

  return { valid: true, policy: activePolicy };
};
```

### Dashboard Integration

```typescript
// Get active policies for dashboard display
const leaveTypes = [1, 2, 3]; // Annual Leave, Sick Leave, Personal Leave
const currentDate = new Date();

const activePolicies = await Promise.all(
  leaveTypes.map(async (leaveTypeId) => {
    const policy = await getActivePolicyUseCase.execute(
      leaveTypeId,
      currentDate,
    );
    return {
      leaveTypeId,
      policy: policy
        ? {
            id: policy.id,
            annualEntitlement: policy.annualEntitlement,
            carryLimit: policy.carryLimit,
            effectiveDate: policy.effectiveDate,
          }
        : null,
    };
  }),
);

const dashboardData = activePolicies.filter((item) => item.policy !== null);
```

## Policy Selection Logic

The repository method `getActivePolicy` typically implements:

1. Filter by leave type ID
2. Filter by active status
3. Filter by effective date (policy.effectiveDate <= date)
4. Filter by expiry date (policy.expiryDate >= date OR expiryDate IS NULL)
5. Return the most recent active policy (if multiple exist)
6. Return null if no matching policy found
