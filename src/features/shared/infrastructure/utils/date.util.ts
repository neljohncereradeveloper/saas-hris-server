import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom date validation decorator that accepts YYYY-MM-DD format
 * This decorator validates that the input is a valid date string in YYYY-MM-DD format
 */
export function IsDateStringCustom(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateStringCustom',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Handle Date objects (from @Transform)
          if (value instanceof Date) {
            return !isNaN(value.getTime());
          }

          // Handle string inputs
          if (typeof value === 'string') {
            // Check if the string matches YYYY-MM-DD format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(value)) {
              return false;
            }

            // Check if it's a valid date
            const date = new Date(value);
            return (
              !isNaN(date.getTime()) &&
              date.toISOString().split('T')[0] === value
            );
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date`;
        },
      },
    });
  };
}

/**
 * Date transformation utility that converts YYYY-MM-DD string to Date object
 * This can be used with @Transform decorator
 */
export function transformDateString(value: any): Date | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    // Handle YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(value)) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    // Handle ISO 8601 format
    const isoDate = new Date(value);
    return isNaN(isoDate.getTime()) ? null : isoDate;
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

/**
 * Format date to YYYY-MM-DD string for display
 * Uses local date methods to avoid timezone issues
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
