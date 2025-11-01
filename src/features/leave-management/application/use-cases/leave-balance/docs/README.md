# Leave Balance Use Cases Documentation

## Overview

This documentation covers all use cases in the Leave Balance module of the HRIS system. The Leave Balance module manages employee leave entitlements, tracking earned days, used days, carry-over amounts, and remaining balances for different leave types.

## Module Structure

```
leave-balance/
├── docs/
│   ├── README.md (this file)
│   ├── generate-annual-leave-balances.md
│   ├── close-leave-balance.md
│   ├── create-leave-balance.md
│   ├── reset-leave-balances-for-year.md
│   ├── find-leave-balance-by-employee-year.md
│   ├── find-leave-balance-by-leave-type.md
│   └── soft-delete-leave-balance.md
├── generate-annual-leave-balances.use-case.ts
├── close-leave-balance.use-case.ts
├── create-leave-balance.use-case.ts
├── reset-leave-balances-for-year.use-case.ts
├── find-leave-balance-by-employee-year.use-case.ts
├── find-leave-balance-by-leave-type.use-case.ts
└── soft-delete-leave-balance.use-case.ts
```

## Use Cases Overview

### 1. Generate Annual Leave Balances

**File**: `generate-annual-leave-balances.use-case.ts`  
**Purpose**: Bulk generation of leave balances for all active employees based on active leave policies  
**Key Features**:

- Processes all active employees and policies
- Calculates carry-over days from previous year
- Supports force regeneration of existing balances
- Returns generation statistics

**Use Cases**:

- Year-end balance generation
- Bulk balance creation for new employees
- Policy change recalculation

### 2. Create Leave Balance

**File**: `create-leave-balance.use-case.ts`  
**Purpose**: Individual creation of leave balance records for specific employees  
**Key Features**:

- Validates employee, leave type, and policy existence
- Calculates carry-over from previous year
- Applies policy rules for annual entitlements
- Creates balance with OPEN status

**Use Cases**:

- Manual balance creation for specific employees
- Corrective balance creation
- New employee onboarding

### 3. Close Leave Balance

**File**: `close-leave-balance.use-case.ts`  
**Purpose**: Close individual leave balance records to prevent further modifications  
**Key Features**:

- Changes status from OPEN to CLOSED
- Validates balance existence and current status
- Prevents modification of closed balances
- Comprehensive error handling

**Use Cases**:

- Year-end balance closure
- Final balance settlement
- Administrative balance closure

### 4. Reset Leave Balances For Year

**File**: `reset-leave-balances-for-year.use-case.ts`  
**Purpose**: Reset all leave balances for a specific year  
**Key Features**:

- Clears all balances for specified year
- Irreversible operation
- Bulk processing capability
- Transaction safety

**Use Cases**:

- Year-end data cleanup
- Bulk correction scenarios
- System migration preparation

### 5. Find Leave Balance By Employee Year

**File**: `find-leave-balance-by-employee-year.use-case.ts`  
**Purpose**: Retrieve all leave balances for a specific employee and year  
**Key Features**:

- Returns array of all balances for employee/year
- Read-only operation
- No filtering by status
- Simple repository pass-through

**Use Cases**:

- Employee dashboard display
- Leave request validation
- Employee reporting
- Audit reviews

### 6. Find Leave Balance By Leave Type

**File**: `find-leave-balance-by-leave-type.use-case.ts`  
**Purpose**: Retrieve specific leave balance for employee, leave type, and year  
**Key Features**:

- Returns single balance or null
- Targeted query by leave type
- Read-only operation
- Specific balance validation

**Use Cases**:

- Leave request processing
- Specific leave type validation
- Balance display for specific leave types
- Policy application checks

### 7. Soft Delete Leave Balance

**File**: `soft-delete-leave-balance.use-case.ts`  
**Purpose**: Soft delete leave balance records by changing active status  
**Key Features**:

- Marks balances as inactive (not physically deleted)
- Reversible operation
- Preserves audit trail
- Validates balance existence

**Use Cases**:

- Data correction
- Policy change impacts
- Employee status changes
- Reversible deletions

## Use Case Categories

### Creation Operations

- **Generate Annual Leave Balances**: Bulk creation for all employees
- **Create Leave Balance**: Individual creation for specific employees

### Modification Operations

- **Close Leave Balance**: Change status to CLOSED
- **Soft Delete Leave Balance**: Change active status
- **Reset Leave Balances For Year**: Clear all balances for a year

### Query Operations

- **Find Leave Balance By Employee Year**: Get all balances for employee/year
- **Find Leave Balance By Leave Type**: Get specific balance by leave type

## Common Patterns

### Transaction Management

All modification operations use database transactions for consistency:

- `TransactionPort` handles transaction lifecycle
- Automatic rollback on failure
- Commit on success

### Error Handling

All operations include comprehensive error handling:

- `ErrorHandlerPort` provides standardized error handling
- Detailed logging with context
- Proper exception types

### Validation

Operations include appropriate validation:

- Entity existence checks
- Business rule validation
- Status validation

### Logging

All operations are logged with:

- Action type
- Model affected
- Success/failure messages
- User context

## Business Rules and Update Restrictions

### Leave Balance Update Policy

**Important**: Manual updates to leave balance **values** (earned, used, remaining, encashed) are **NOT ALLOWED**. Leave balance values can only be updated through the following authorized processes:

1. **Leave Request Approval/Cancellation**

   - When a leave request is approved, the `used` days are incremented
   - When a leave request is cancelled, the `used` days are decremented
   - The `remaining` balance is automatically recalculated

2. **Encashment Approval**

   - When leave encashment is approved, the `encashed` days are incremented
   - The `remaining` balance is automatically recalculated

3. **Year-End Reset Operations**

   - Annual reset clears all balances for a specific year
   - Used by `ResetLeaveBalancesForYearUseCase`

4. **Policy Carry-Over Calculations**
   - Automatic carry-over from previous year balances
   - Applied during balance creation and annual generation
   - Limited by policy `carryLimit` settings

### Prohibited Operations

- Direct modification of balance **values** through repository methods
- Manual adjustment of earned, used, remaining, or encashed days
- Bypassing the authorized update processes
- Direct database updates to balance value fields

### Authorized Operations

- **Administrative Operations** (allowed):
  - Creating new balances (with proper calculations)
  - Closing balances (status change: OPEN → CLOSED)
  - Soft deleting balances (active status change)
  - Resetting balances for year (administrative cleanup)
- **Query Operations** (read-only):
  - Finding balances by employee/year
  - Finding balances by leave type

## Data Flow

### Balance Creation Flow

1. **Generate Annual Leave Balances** → Creates balances for all employees
2. **Create Leave Balance** → Creates individual balances
3. Both calculate carry-over from previous year
4. Both apply policy rules for entitlements

### Balance Management Flow

1. **Find operations** → Query existing balances
2. **Close Leave Balance** → Finalize balances
3. **Soft Delete Leave Balance** → Mark as inactive
4. **Reset Leave Balances For Year** → Clear for new year

## Integration Points

### Dependencies

- `LeavePolicyRepository`: Policy management
- `LeaveBalanceRepository`: Balance operations
- `EmployeeRepository`: Employee management
- `LeaveTypeRepository`: Leave type validation
- `TransactionPort`: Transaction management
- `ErrorHandlerPort`: Error handling

### Related Modules

- Leave Management (parent module)
- Employee Management
- Policy Management
- Leave Type Management

## Security Considerations

### Authentication

- All operations require authenticated user ID
- User context logged for audit

### Authorization

- Repository layer handles data access permissions
- Consider implementing additional authorization checks

### Audit Trail

- All operations logged with full context
- User, timestamp, and operation details recorded

## Performance Considerations

### Bulk Operations

- `Generate Annual Leave Balances`: Processes all employees/policies
- `Reset Leave Balances For Year`: Affects all balances for a year
- Consider system impact during execution

### Query Operations

- `Find` operations are read-only and efficient
- Single database queries
- No transaction overhead

### Transaction Overhead

- Modification operations use transactions
- Balance between consistency and performance

## Best Practices

### Usage Guidelines

1. Use `Generate Annual Leave Balances` for bulk operations
2. Use `Create Leave Balance` for individual corrections
3. Use `Close Leave Balance` for final settlements
4. Use `Soft Delete Leave Balance` for reversible operations
5. Use `Reset Leave Balances For Year` with caution (irreversible)

### Error Handling

1. Always handle exceptions from use cases
2. Check return values for success/failure
3. Implement proper logging in calling code
4. Consider retry logic for transient failures

### Testing

1. Test with various employee/policy combinations
2. Test error scenarios (missing entities, invalid data)
3. Test transaction rollback scenarios
4. Test performance with large datasets

## Future Enhancements

### Potential Improvements

- Batch processing for large datasets
- Async processing for bulk operations
- Additional validation rules
- Enhanced reporting capabilities
- Integration with external systems

### Extension Points

- Custom carry-over calculation rules
- Additional balance statuses
- Enhanced audit capabilities
- Performance optimizations
