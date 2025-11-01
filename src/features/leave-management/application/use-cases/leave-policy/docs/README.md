# Leave Policy Use Cases Documentation

## Overview

This documentation covers all use cases in the Leave Policy module of the HRIS system. The Leave Policy module manages leave policy definitions, including annual entitlements, carry-over limits, effective dates, and policy lifecycle management.

## Module Structure

```
leave-policy/
├── docs/
│   ├── README.md (this file)
│   ├── update-leave-policy.md
│   ├── create-leave-policy.md
│   ├── retire-policy.md
│   ├── activate-policy.md
│   ├── get-active-policy.md
│   ├── soft-delete-leave-policy.md
│   └── find-leave-policy-paginated-list.md
├── update-leave-policy.use-case.ts
├── create-leave-policy.use-case.ts
├── retire-policy.use-case.ts
├── activate-policy.use-case.ts
├── get-active-policy.use-case.ts
├── soft-delete-leave-policy.use-case.ts
└── find-leave-policy-paginated-list.use-case.ts
```

## Use Cases Overview

### 1. Create Leave Policy

**File**: `create-leave-policy.use-case.ts`  
**Purpose**: Create new leave policy records with proper validation  
**Key Features**:

- Validates leave type existence
- Sets initial status to 'draft'
- Creates policy with proper leave type mapping
- Comprehensive error handling

**Use Cases**:

- New policy creation
- Policy setup for new leave types
- Policy template creation

### 2. Update Leave Policy

**File**: `update-leave-policy.use-case.ts`  
**Purpose**: Update existing leave policy records  
**Key Features**:

- Validates policy and leave type existence
- Updates policy fields with validation
- Returns updated policy object
- Transaction safety

**Use Cases**:

- Policy modifications
- Policy corrections
- Policy updates for compliance

### 3. Activate Policy

**File**: `activate-policy.use-case.ts`  
**Purpose**: Activate leave policy records for use  
**Key Features**:

- Changes policy status to active
- Makes policy available for calculations
- Validates policy existence
- Transaction management

**Use Cases**:

- Policy activation after creation
- Policy reactivation
- Policy deployment

### 4. Retire Policy

**File**: `retire-policy.use-case.ts`  
**Purpose**: Retire active leave policy records  
**Key Features**:

- Changes policy status to retired
- Prevents policy from new calculations
- Preserves historical data
- Transaction safety

**Use Cases**:

- Policy lifecycle management
- Policy replacement
- Policy deprecation

### 5. Get Active Policy

**File**: `get-active-policy.use-case.ts`  
**Purpose**: Retrieve active policy for specific leave type and date  
**Key Features**:

- Date-based policy selection
- Leave type filtering
- Read-only operation
- Efficient querying

**Use Cases**:

- Leave balance calculations
- Leave request validation
- Policy compliance checks

### 6. Soft Delete Leave Policy

**File**: `soft-delete-leave-policy.use-case.ts`  
**Purpose**: Soft delete policy records by changing active status  
**Key Features**:

- Marks policies as inactive
- Reversible operation
- Preserves audit trail
- Transaction management

**Use Cases**:

- Temporary policy deactivation
- Policy cleanup
- Reversible deletions

### 7. Find Leave Policy Paginated List

**File**: `find-leave-policy-paginated-list.use-case.ts`  
**Purpose**: Retrieve policies with pagination and search support  
**Key Features**:

- Pagination support
- Search term filtering
- Efficient data access
- Meta information

**Use Cases**:

- Administrative interfaces
- Policy search
- Bulk operations
- Reporting

## Use Case Categories

### Creation Operations

- **Create Leave Policy**: Create new policy records

### Modification Operations

- **Update Leave Policy**: Modify existing policy details
- **Activate Policy**: Change status to active
- **Retire Policy**: Change status to retired
- **Soft Delete Leave Policy**: Change active status

### Query Operations

- **Get Active Policy**: Get specific active policy
- **Find Leave Policy Paginated List**: Get paginated policy list

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
- Data integrity validation

### Logging

All operations are logged with:

- Action type
- Model affected
- Success/failure messages
- User context

## Policy Lifecycle

### Policy States

1. **Draft**: Newly created policy (not yet active)
2. **Active**: Policy in use for calculations
3. **Retired**: Policy no longer used for new calculations

### State Transitions

- `Draft` → `Active` (via ActivatePolicyUseCase)
- `Active` → `Retired` (via RetirePolicyUseCase)
- `Retired` → `Active` (via ActivatePolicyUseCase)

### Active Status

- `isActive: true` - Policy is available for queries
- `isActive: false` - Policy is soft deleted (hidden from queries)

## Data Flow

### Policy Creation Flow

1. **Create Leave Policy** → Creates policy with 'draft' status
2. **Update Leave Policy** → Modifies policy details
3. **Activate Policy** → Makes policy active for use

### Policy Management Flow

1. **Find operations** → Query existing policies
2. **Activate Policy** → Make policy active
3. **Retire Policy** → Retire policy
4. **Soft Delete Leave Policy** → Mark as inactive

### Policy Usage Flow

1. **Get Active Policy** → Retrieve policy for calculations
2. **Leave Balance Generation** → Uses active policies
3. **Leave Request Processing** → Validates against active policies

## Integration Points

### Dependencies

- `LeavePolicyRepository`: Policy management
- `LeaveTypeRepository`: Leave type validation
- `TransactionPort`: Transaction management
- `ErrorHandlerPort`: Error handling

### Related Modules

- Leave Management (parent module)
- Leave Balance Management
- Leave Type Management
- Leave Request Processing

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

### Query Operations

- `Get Active Policy`: Single query with date filtering
- `Find Paginated List`: Efficient pagination with search

### Modification Operations

- All use transactions for consistency
- Single database operations per use case
- Efficient error handling

### Bulk Operations

- `Find Paginated List`: Supports large datasets
- Consider batch processing for bulk updates

## Best Practices

### Usage Guidelines

1. Use `Create Leave Policy` for new policies
2. Use `Update Leave Policy` for modifications
3. Use `Activate Policy` to make policies available
4. Use `Retire Policy` for policy lifecycle management
5. Use `Get Active Policy` for calculations
6. Use `Find Paginated List` for administrative interfaces

### Error Handling

1. Always handle exceptions from use cases
2. Check return values for success/failure
3. Implement proper logging in calling code
4. Consider retry logic for transient failures

### Testing

1. Test with various policy configurations
2. Test error scenarios (missing entities, invalid data)
3. Test transaction rollback scenarios
4. Test performance with large datasets

## Policy Business Rules

### Policy Creation

1. Leave type must exist
2. Policy starts with 'draft' status
3. All required fields must be provided
4. Leave type ID is automatically resolved

### Policy Activation

1. Policy must exist
2. Only one active policy per leave type (typically)
3. Policy becomes available for calculations
4. Historical data remains unchanged

### Policy Retirement

1. Policy must exist
2. Policy is removed from active calculations
3. Historical data is preserved
4. Policy remains available for audit

### Policy Updates

1. Policy must exist
2. Leave type must exist (if changing)
3. All fields are validated
4. Update is atomic

## Future Enhancements

### Potential Improvements

- Policy versioning
- Policy templates
- Automated policy activation/deactivation
- Policy conflict resolution
- Enhanced search capabilities

### Extension Points

- Custom policy validation rules
- Additional policy statuses
- Policy approval workflows
- Policy impact analysis
- Integration with external policy systems
