# Retrieve Leave Type for Combobox Use Case

## Overview

The `RetrieveLeaveTypeForComboboxUseCase` is responsible for retrieving leave type data formatted specifically for dropdown/combobox components. This use case provides a simplified data structure optimized for UI components that require value-label pairs.

## Purpose

- Retrieve leave types formatted for combobox/dropdown components
- Provide standardized value-label data structure
- Support UI component integration
- Enable efficient data access for form controls

## Parameters

- No parameters required - retrieves all available leave types

## Dependencies

- `LeaveTypeRepository` - Manages leave type data access

## Execution Flow

### 1. Data Retrieval

```typescript
const leaveTypes = await this.leaveTypeRepository.retrieveForCombobox();
```

### 2. Data Transformation

```typescript
return leaveTypes.map((val: { name: string }) => ({
  value: val.name || '',
  label: val.name
    ? val.name.charAt(0).toUpperCase() + val.name.slice(1).toLowerCase()
    : '',
}));
```

## Return Value

```typescript
Promise<{ value: string; label: string }[]>;
```

## Data Structure

Each returned object contains:

- `value`: The leave type name (used as the value in forms)
- `label`: Formatted leave type name (displayed in UI)

## Usage Examples

### Basic Usage

```typescript
const leaveTypeOptions = await retrieveLeaveTypeForComboboxUseCase.execute();

console.log(leaveTypeOptions);
// Output: [
//   { value: 'annual leave', label: 'Annual leave' },
//   { value: 'sick leave', label: 'Sick leave' },
//   { value: 'personal leave', label: 'Personal leave' }
// ]
```

### React Component Integration

```typescript
// React component example
const LeaveTypeSelector = () => {
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    const loadLeaveTypes = async () => {
      const options = await retrieveLeaveTypeForComboboxUseCase.execute();
      setLeaveTypeOptions(options);
    };
    loadLeaveTypes();
  }, []);

  return (
    <select
      value={selectedValue}
      onChange={(e) => setSelectedValue(e.target.value)}
    >
      <option value="">Select Leave Type</option>
      {leaveTypeOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
```

### Angular Component Integration

```typescript
// Angular component example
@Component({
  selector: 'app-leave-type-selector',
  template: `
    <select [(ngModel)]="selectedValue">
      <option value="">Select Leave Type</option>
      <option *ngFor="let option of leaveTypeOptions" [value]="option.value">
        {{ option.label }}
      </option>
    </select>
  `,
})
export class LeaveTypeSelectorComponent {
  leaveTypeOptions: { value: string; label: string }[] = [];
  selectedValue: string = '';

  ngOnInit() {
    this.loadLeaveTypes();
  }

  async loadLeaveTypes() {
    this.leaveTypeOptions =
      await this.retrieveLeaveTypeForComboboxUseCase.execute();
  }
}
```

### Vue Component Integration

```typescript
// Vue component example
<template>
  <select v-model="selectedValue">
    <option value="">Select Leave Type</option>
    <option
      v-for="option in leaveTypeOptions"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script>
export default {
  data() {
    return {
      leaveTypeOptions: [],
      selectedValue: ''
    };
  },
  async mounted() {
    this.leaveTypeOptions = await this.retrieveLeaveTypeForComboboxUseCase.execute();
  }
};
</script>
```

## Business Rules

1. Returns all available leave types
2. Formats names with proper capitalization (first letter uppercase, rest lowercase)
3. Handles empty/null names gracefully
4. Provides consistent value-label structure
5. No filtering or pagination (all types returned)

## Data Formatting

The use case applies the following formatting rules:

- **Value**: Uses the raw leave type name
- **Label**: Capitalizes first letter, lowercases the rest
- **Empty Handling**: Returns empty string for null/undefined names

## Performance Notes

- Single database query operation
- No transaction overhead (read-only)
- Minimal processing overhead
- Efficient for small to medium datasets
- Consider caching for frequently accessed data

## Error Handling

- Repository-level error handling
- No additional validation at use case level
- Simple error propagation to caller
- Graceful handling of empty results

## Related Use Cases

- `CreateLeaveTypeUseCase` - Creates leave types that can be retrieved
- `UpdateLeaveTypeUseCase` - Updates leave types that can be retrieved
- `SoftDeleteLeaveTypeUseCase` - Soft deletes leave types (affects visibility)
- `FindLeaveTypePaginatedListUseCase` - Provides detailed leave type data

## Use Cases

- **Form Controls**: Populate dropdown/select components
- **UI Components**: Provide data for combobox widgets
- **Data Binding**: Support two-way data binding in forms
- **Integration**: Provide data for external UI frameworks
- **Quick Selection**: Enable fast leave type selection

## Security Considerations

- Read-only operation (no data modification)
- No additional authorization checks at use case level
- Repository layer handles data access permissions
- Consider implementing role-based access controls

## Integration Examples

### Form Integration

```typescript
// Leave request form
const LeaveRequestForm = () => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);

  useEffect(() => {
    const loadLeaveTypes = async () => {
      const options = await retrieveLeaveTypeForComboboxUseCase.execute();
      setLeaveTypeOptions(options);
    };
    loadLeaveTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit form with selected leave type
    console.log('Selected leave type:', formData.leaveType);
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={formData.leaveType}
        onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
        required
      >
        <option value="">Select Leave Type</option>
        {leaveTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Other form fields */}
    </form>
  );
};
```

### Multi-Select Integration

```typescript
// Multi-select leave types
const MultiSelectLeaveTypes = () => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);

  useEffect(() => {
    const loadLeaveTypes = async () => {
      const options = await retrieveLeaveTypeForComboboxUseCase.execute();
      setLeaveTypeOptions(options);
    };
    loadLeaveTypes();
  }, []);

  const handleTypeToggle = (value) => {
    setSelectedTypes(prev =>
      prev.includes(value)
        ? prev.filter(type => type !== value)
        : [...prev, value]
    );
  };

  return (
    <div>
      {leaveTypeOptions.map((option) => (
        <label key={option.value}>
          <input
            type="checkbox"
            checked={selectedTypes.includes(option.value)}
            onChange={() => handleTypeToggle(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};
```

### Search Integration

```typescript
// Searchable combobox
const SearchableLeaveTypeCombo = () => {
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadLeaveTypes = async () => {
      const options = await retrieveLeaveTypeForComboboxUseCase.execute();
      setLeaveTypeOptions(options);
      setFilteredOptions(options);
    };
    loadLeaveTypes();
  }, []);

  useEffect(() => {
    const filtered = leaveTypeOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, leaveTypeOptions]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search leave types..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select>
        <option value="">Select Leave Type</option>
        {filteredOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
```

## Caching Considerations

For frequently accessed data, consider implementing caching:

```typescript
// Cached version example
class CachedRetrieveLeaveTypeForComboboxUseCase {
  private cache: { value: string; label: string }[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async execute(): Promise<{ value: string; label: string }[]> {
    const now = Date.now();

    if (this.cache && now < this.cacheExpiry) {
      return this.cache;
    }

    const result = await this.retrieveLeaveTypeForComboboxUseCase.execute();
    this.cache = result;
    this.cacheExpiry = now + this.CACHE_DURATION;

    return result;
  }
}
```

## Best Practices

1. Use this use case for UI components that need simple value-label pairs
2. Consider caching for frequently accessed data
3. Handle loading states in UI components
4. Implement proper error handling in consuming components
5. Use for form controls and dropdown components
6. Consider implementing search/filter functionality in UI layer
