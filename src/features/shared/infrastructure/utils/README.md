# Date Utility

This utility provides consistent date handling across the application, supporting both `YYYY-MM-DD` format and ISO 8601 format.

## Features

- **Custom Date Validation**: `@IsDateStringCustom` decorator that accepts `YYYY-MM-DD` format
- **Date Transformation**: `transformDateString` function for consistent date conversion
- **Date Formatting**: `formatDateToString` function for consistent date output
- **Date Validation**: `isValidDate` function for date validation
- **Date Comparison**: `DateComparison` class with utility methods

## Usage in DTOs

### Basic Date Field

```typescript
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import { Transform } from 'class-transformer';

export class ExampleDto {
  @Transform(({ value }) => transformDateString(value))
  @IsNotEmpty({ message: 'Date is required' })
  @IsDateStringCustom({ message: 'Date must be a valid date' })
  date: Date;
}
```

### Optional Date Field

```typescript
export class ExampleDto {
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'Date must be a valid date' })
  optionalDate?: Date;
}
```

## Supported Date Formats

The utility accepts the following date formats:

1. **YYYY-MM-DD** (e.g., `"2024-01-01"`)
2. **ISO 8601** (e.g., `"2024-01-01T00:00:00.000Z"`)

## API Request Format

When sending requests to the API, use the simple `YYYY-MM-DD` format:

```json
{
  "hireDate": "2024-01-01",
  "birthDate": "1990-05-15",
  "endDate": "2024-12-31"
}
```

## Date Comparison Utilities

```typescript
import { DateComparison } from '@features/shared/infrastructure/utils/date.util';

// Check if date is in the past
const isPast = DateComparison.isPast('2023-01-01');

// Check if date is in the future
const isFuture = DateComparison.isFuture('2025-01-01');

// Compare two dates
const isBefore = DateComparison.isBefore('2023-01-01', '2024-01-01');
```

## Benefits

1. **Consistent Format**: All dates use `YYYY-MM-DD` format in API requests
2. **Flexible Input**: Accepts both simple and ISO formats
3. **Proper Validation**: Validates date format before transformation
4. **Type Safety**: Ensures proper Date object transformation
5. **Reusable**: Can be used across all DTOs in the application

## Migration

To migrate existing DTOs:

1. Replace `@IsDateString()` with `@IsDateStringCustom()`
2. Replace `@Transform(({ value }) => new Date(value))` with `@Transform(({ value }) => transformDateString(value))`
3. Update import statements to include the date utility
4. Update API requests to use `YYYY-MM-DD` format
