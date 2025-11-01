# Find Leave Type Paginated List Use Case

## Overview

The `FindLeaveTypePaginatedListUseCase` is responsible for retrieving leave type records with pagination support. This use case provides efficient access to leave type data for administrative interfaces, reporting, and bulk operations.

## Purpose

- Retrieve leave types with pagination
- Support search functionality with term filtering
- Provide efficient data access for large datasets
- Enable administrative leave type management interfaces

## Parameters

- `term: string` - Search term for filtering leave types
- `page: number` - Page number (1-based)
- `limit: number` - Number of records per page

## Dependencies

- `LeaveTypeRepository` - Manages leave type data access

## Execution Flow

### 1. Query Execution

```typescript
const result = await this.leaveTypeRepository.findPaginatedList(
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
  data: LeaveType[];
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
const result = await findLeaveTypePaginatedListUseCase.execute(
  '', // empty term to get all leave types
  1, // first page
  10, // 10 records per page
);

console.log(`Found ${result.meta.totalRecords} leave types`);
console.log(`Page ${result.meta.page} of ${result.meta.totalPages}`);
result.data.forEach((leaveType) => {
  console.log(`${leaveType.name}: ${leaveType.description}`);
});
```

### Search with Term

```typescript
const result = await findLeaveTypePaginatedListUseCase.execute(
  'Annual', // search term
  1, // first page
  20, // 20 records per page
);

const annualLeaveTypes = result.data.filter((leaveType) =>
  leaveType.name.toLowerCase().includes('annual'),
);
```

### Pagination Navigation

```typescript
const getLeaveTypesPage = async (page: number, searchTerm: string = '') => {
  const result = await findLeaveTypePaginatedListUseCase.execute(
    searchTerm,
    page,
    15, // 15 records per page
  );

  return {
    leaveTypes: result.data,
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

1. Returns paginated list of leave types
2. Supports search term filtering (typically on leave type name, description)
3. Page numbers are 1-based
4. Limit controls the number of records per page
5. Meta information provides pagination context

## Data Structure

### Leave Types Array

Each `LeaveType` object in the data array contains:

- `id`: Leave type identifier
- `name`: Leave type name
- `description`: Leave type description
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

- `CreateLeaveTypeUseCase` - Creates leave types that can be queried
- `UpdateLeaveTypeUseCase` - Updates leave types that can be queried
- `SoftDeleteLeaveTypeUseCase` - Soft deletes leave types (affects visibility)
- `RetrieveLeaveTypeForComboboxUseCase` - Provides simplified data for UI components

## Use Cases

- **Administrative Interface**: Display leave types in management UI
- **Leave Type Search**: Find leave types by name or description
- **Reporting**: Generate leave type reports with pagination
- **Bulk Operations**: Process leave types in batches
- **Integration**: Provide leave type data for external systems

## Security Considerations

- Read-only operation (no data modification)
- No additional authorization checks at use case level
- Repository layer handles data access permissions
- Consider implementing leave type-specific access controls

## Integration Examples

### Administrative Dashboard

```typescript
// Get leave types for admin dashboard
const getLeaveTypesForDashboard = async (page: number = 1) => {
  const result = await findLeaveTypePaginatedListUseCase.execute(
    '', // all leave types
    page,
    20, // 20 per page
  );

  return {
    leaveTypes: result.data.map((leaveType) => ({
      id: leaveType.id,
      name: leaveType.name,
      description: leaveType.description,
      isActive: leaveType.isActive,
      createdAt: leaveType.createdAt,
    })),
    pagination: result.meta,
  };
};
```

### Leave Type Search Interface

```typescript
// Search leave types with real-time filtering
const searchLeaveTypes = async (searchTerm: string, page: number = 1) => {
  const result = await findLeaveTypePaginatedListUseCase.execute(
    searchTerm,
    page,
    15, // 15 per page
  );

  return {
    leaveTypes: result.data,
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

### Bulk Leave Type Operations

```typescript
// Process all leave types in batches
const processAllLeaveTypes = async (
  processor: (leaveTypes: LeaveType[]) => Promise<void>,
) => {
  let page = 1;
  const limit = 100; // Process 100 at a time

  while (true) {
    const result = await findLeaveTypePaginatedListUseCase.execute(
      '', // all leave types
      page,
      limit,
    );

    if (result.data.length === 0) {
      break; // No more leave types
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

// Example usage: Update all leave types
await processAllLeaveTypes(async (leaveTypes) => {
  for (const leaveType of leaveTypes) {
    // Perform some operation on each leave type
    console.log(`Processing leave type: ${leaveType.name}`);
  }
});
```

### Leave Type Export

```typescript
// Export all leave types to CSV
const exportLeaveTypesToCSV = async () => {
  const allLeaveTypes = [];
  let page = 1;
  const limit = 1000; // Large batches for export

  while (true) {
    const result = await findLeaveTypePaginatedListUseCase.execute(
      '', // all leave types
      page,
      limit,
    );

    if (result.data.length === 0) {
      break;
    }

    allLeaveTypes.push(...result.data);

    if (result.meta.nextPage === null) {
      break;
    }

    page = result.meta.nextPage;
  }

  // Convert to CSV format
  const csvHeaders = ['ID', 'Name', 'Description', 'Is Active', 'Created At'];
  const csvRows = allLeaveTypes.map((leaveType) => [
    leaveType.id,
    leaveType.name,
    leaveType.description,
    leaveType.isActive,
    leaveType.createdAt?.toISOString().split('T')[0] || '',
  ]);

  return [csvHeaders, ...csvRows];
};
```

### React Component Integration

```typescript
// React component for leave type management
const LeaveTypeManagement = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadLeaveTypes = async (page = 1, term = '') => {
    setLoading(true);
    try {
      const result = await findLeaveTypePaginatedListUseCase.execute(
        term,
        page,
        10, // 10 per page
      );

      setLeaveTypes(result.data);
      setPagination(result.meta);
    } catch (error) {
      console.error('Failed to load leave types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveTypes(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search leave types..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map(leaveType => (
                <tr key={leaveType.id}>
                  <td>{leaveType.name}</td>
                  <td>{leaveType.description}</td>
                  <td>{leaveType.isActive ? 'Active' : 'Inactive'}</td>
                  <td>{new Date(leaveType.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.previousPage}
            >
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.nextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Search Functionality

The search term typically filters on:

- Leave type name
- Leave type description
- Other searchable fields

The exact search implementation depends on the repository implementation and may include:

- Case-insensitive matching
- Partial string matching
- Multiple field searching
- Advanced search operators

## Performance Optimization

### Database Indexing

Ensure proper database indexes for:

- Leave type name (for search)
- Leave type description (for search)
- Active status (for filtering)
- Created date (for sorting)

### Caching Strategy

```typescript
// Cached pagination example
class CachedFindLeaveTypePaginatedListUseCase {
  private cache = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async execute(term: string, page: number, limit: number) {
    const cacheKey = `${term}-${page}-${limit}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const result = await this.findLeaveTypePaginatedListUseCase.execute(
      term,
      page,
      limit,
    );

    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  }
}
```

## Best Practices

1. Use appropriate page sizes based on UI requirements
2. Implement proper loading states in UI components
3. Consider implementing search debouncing for better UX
4. Use caching for frequently accessed data
5. Implement proper error handling in consuming components
6. Consider implementing virtual scrolling for large datasets
7. Use proper database indexing for search performance
