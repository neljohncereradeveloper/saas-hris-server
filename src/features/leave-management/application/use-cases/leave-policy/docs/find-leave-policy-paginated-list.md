# Find Leave Policy Paginated List Use Case

## Overview

The `FindLeavePolicyPaginatedListUseCase` is responsible for retrieving leave policy records with pagination support. This use case provides efficient access to policy data for administrative interfaces, reporting, and bulk operations.

## Purpose

- Retrieve leave policies with pagination
- Support search functionality with term filtering
- Provide efficient data access for large datasets
- Enable administrative policy management interfaces

## Parameters

- `term: string` - Search term for filtering policies
- `page: number` - Page number (1-based)
- `limit: number` - Number of records per page

## Dependencies

- `LeavePolicyRepository` - Manages leave policy data access

## Execution Flow

### 1. Query Execution

```typescript
const result = await this.leavePolicyRepository.findPaginatedList(
  term,
  page,
  limit,
);
```

### 2. Return Paginated Result

```typescript
return result;
```

## Return Value

```typescript
Promise<{
  data: LeavePolicy[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}>;
```

## Usage Examples

### Basic Pagination

```typescript
const result = await findLeavePolicyPaginatedListUseCase.execute(
  '', // empty term to get all policies
  1, // first page
  10, // 10 records per page
);

console.log(`Found ${result.meta.totalRecords} policies`);
console.log(`Page ${result.meta.page} of ${result.meta.totalPages}`);
result.data.forEach((policy) => {
  console.log(`${policy.leaveType}: ${policy.annualEntitlement} days`);
});
```

### Search with Term

```typescript
const result = await findLeavePolicyPaginatedListUseCase.execute(
  'Annual', // search term
  1, // first page
  20, // 20 records per page
);

const annualPolicies = result.data.filter((policy) =>
  policy.leaveType.toLowerCase().includes('annual'),
);
```

### Pagination Navigation

```typescript
const getPoliciesPage = async (page: number, searchTerm: string = '') => {
  const result = await findLeavePolicyPaginatedListUseCase.execute(
    searchTerm,
    page,
    15, // 15 records per page
  );

  return {
    policies: result.data,
    pagination: {
      currentPage: result.meta.page,
      totalPages: result.meta.totalPages,
      totalRecords: result.meta.totalRecords,
      hasNextPage: result.meta.nextPage !== null,
      hasPreviousPage: result.meta.previousPage !== null,
      nextPage: result.meta.nextPage,
      previousPage: result.meta.previousPage,
    },
  };
};
```

## Business Rules

1. Returns paginated list of leave policies
2. Supports search term filtering (typically on policy name, description, leave type)
3. Page numbers are 1-based
4. Limit controls the number of records per page
5. Meta information provides pagination context

## Data Structure

### Policies Array

Each `LeavePolicy` object in the data array contains:

- `id`: Policy identifier
- `leaveTypeId`: Leave type identifier
- `leaveType`: Leave type name
- `annualEntitlement`: Annual leave entitlement days
- `carryLimit`: Maximum days that can be carried over
- `description`: Policy description
- `effectiveDate`: When the policy becomes effective
- `expiryDate`: When the policy expires
- `status`: Policy status (draft, active, retired)
- `isActive`: Active status flag
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Meta Information

The meta object provides:

- `page`: Current page number
- `limit`: Records per page
- `totalRecords`: Total number of records matching the search
- `totalPages`: Total number of pages
- `nextPage`: Next page number (null if no next page)
- `previousPage`: Previous page number (null if no previous page)

## Performance Notes

- Single database query with pagination
- No transaction overhead (read-only)
- Efficient repository-level querying with LIMIT/OFFSET
- Search term filtering at database level
- Minimal processing overhead

## Error Handling

- Repository-level error handling
- No additional validation at use case level
- Simple error propagation to caller
- Empty result for no matches

## Related Use Cases

- `CreateLeavePolicyUseCase` - Creates policies that can be queried
- `UpdateLeavePolicyUseCase` - Updates policies that can be queried
- `ActivatePolicyUseCase` - Activates policies that can be queried
- `RetirePolicyUseCase` - Retires policies that can be queried
- `SoftDeleteLeavePolicyUseCase` - Soft deletes policies (affects visibility)

## Use Cases

- **Administrative Interface**: Display policies in management UI
- **Policy Search**: Find policies by name or description
- **Reporting**: Generate policy reports with pagination
- **Bulk Operations**: Process policies in batches
- **Integration**: Provide policy data for external systems

## Security Considerations

- Read-only operation (no data modification)
- No additional authorization checks at use case level
- Repository layer handles data access permissions
- Consider implementing policy-specific access controls

## Integration Examples

### Administrative Dashboard

```typescript
// Get policies for admin dashboard
const getPoliciesForDashboard = async (page: number = 1) => {
  const result = await findLeavePolicyPaginatedListUseCase.execute(
    '', // all policies
    page,
    20, // 20 per page
  );

  return {
    policies: result.data.map((policy) => ({
      id: policy.id,
      leaveType: policy.leaveType,
      annualEntitlement: policy.annualEntitlement,
      carryLimit: policy.carryLimit,
      status: policy.status,
      isActive: policy.isActive,
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
    })),
    pagination: result.meta,
  };
};
```

### Policy Search Interface

```typescript
// Search policies with real-time filtering
const searchPolicies = async (searchTerm: string, page: number = 1) => {
  const result = await findLeavePolicyPaginatedListUseCase.execute(
    searchTerm,
    page,
    15, // 15 per page
  );

  return {
    policies: result.data,
    searchTerm,
    pagination: {
      currentPage: result.meta.page,
      totalPages: result.meta.totalPages,
      totalRecords: result.meta.totalRecords,
      hasNextPage: result.meta.nextPage !== null,
      hasPreviousPage: result.meta.previousPage !== null,
    },
  };
};
```

### Bulk Policy Operations

```typescript
// Process all policies in batches
const processAllPolicies = async (
  processor: (policies: LeavePolicy[]) => Promise<void>,
) => {
  let page = 1;
  const limit = 100; // Process 100 at a time

  while (true) {
    const result = await findLeavePolicyPaginatedListUseCase.execute(
      '', // all policies
      page,
      limit,
    );

    if (result.data.length === 0) {
      break; // No more policies
    }

    // Process current batch
    await processor(result.data);

    // Check if there are more pages
    if (result.meta.nextPage === null) {
      break;
    }

    page = result.meta.nextPage;
  }
};

// Example usage: Update all policies
await processAllPolicies(async (policies) => {
  for (const policy of policies) {
    // Perform some operation on each policy
    console.log(`Processing policy: ${policy.leaveType}`);
  }
});
```

### Policy Export

```typescript
// Export all policies to CSV
const exportPoliciesToCSV = async () => {
  const allPolicies = [];
  let page = 1;
  const limit = 1000; // Large batches for export

  while (true) {
    const result = await findLeavePolicyPaginatedListUseCase.execute(
      '', // all policies
      page,
      limit,
    );

    if (result.data.length === 0) {
      break;
    }

    allPolicies.push(...result.data);

    if (result.meta.nextPage === null) {
      break;
    }

    page = result.meta.nextPage;
  }

  // Convert to CSV format
  const csvHeaders = [
    'ID',
    'Leave Type',
    'Annual Entitlement',
    'Carry Limit',
    'Status',
    'Effective Date',
  ];
  const csvRows = allPolicies.map((policy) => [
    policy.id,
    policy.leaveType,
    policy.annualEntitlement,
    policy.carryLimit,
    policy.status,
    policy.effectiveDate?.toISOString().split('T')[0] || '',
  ]);

  return [csvHeaders, ...csvRows];
};
```

## Search Functionality

The search term typically filters on:

- Policy description
- Leave type name
- Policy status
- Other searchable fields

The exact search implementation depends on the repository implementation and may include:

- Case-insensitive matching
- Partial string matching
- Multiple field searching
- Advanced search operators
