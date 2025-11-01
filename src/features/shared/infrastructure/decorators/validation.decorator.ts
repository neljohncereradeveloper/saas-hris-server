import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  Max,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Custom validator for decimal places
function IsDecimalPlaces(
  decimalPlaces: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string | symbol) {
    registerDecorator({
      name: 'isDecimalPlaces',
      target: object.constructor,
      propertyName: propertyName as string,
      constraints: [decimalPlaces],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const maxDecimalPlaces = args.constraints[0];

          if (value === null || value === undefined) {
            return true; // Let other validators handle null/undefined
          }

          const numValue =
            typeof value === 'number' ? value : parseFloat(value);

          if (isNaN(numValue)) {
            return false;
          }

          // Convert to string and check decimal places
          const str = numValue.toString();
          const parts = str.split('.');

          if (parts.length === 1) {
            // No decimal places, whole number
            return true;
          }

          // Check decimal places
          return parts[1].length <= maxDecimalPlaces;
        },
        defaultMessage(args: ValidationArguments) {
          const maxDecimalPlaces = args.constraints[0];
          if (maxDecimalPlaces === 0) {
            return `${args.property} must be a whole number`;
          }
          return `${args.property} must be a whole number or have at most ${maxDecimalPlaces} decimal places`;
        },
      },
    });
  };
}

export interface RequiredStringValidationOptions {
  fieldName?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  allowEmpty?: boolean;
  sanitize?: boolean;
}

/**
 * Reusable validation decorator for required strings with pattern matching
 *
 * @param options - Validation options
 * @param options.fieldName - Name of the field for error messages (default: 'Field')
 * @param options.minLength - Minimum length (default: 1)
 * @param options.maxLength - Maximum length (default: 255)
 * @param options.pattern - Regex pattern for validation (default: alphanumeric + basic punctuation)
 * @param options.patternMessage - Custom message for pattern validation
 * @param options.allowEmpty - Whether to allow empty strings (default: false)
 * @param options.sanitize - Whether to sanitize the string by trimming (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @RequiredStringValidation({ fieldName: 'Job title' })
 *   jobTitle: string;
 *
 *   @RequiredStringValidation({
 *     fieldName: 'Description',
 *     maxLength: 500,
 *     pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
 *     patternMessage: 'Description can only contain letters, numbers, spaces, and basic punctuation'
 *   })
 *   description: string;
 * }
 * ```
 */
export function RequiredStringValidation(
  options: RequiredStringValidationOptions = {},
) {
  const {
    fieldName = 'Field',
    minLength = 1,
    maxLength = 255,
    pattern = /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage = `${fieldName} can only contain letters, numbers, spaces, and basic punctuation`,
    allowEmpty = false,
    sanitize = true,
  } = options;

  const decorators = [];

  // Add sanitization transformation if enabled
  if (sanitize) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return allowEmpty ? null : '';
        }

        // Trim, convert to lowercase, and return
        const trimmed = String(value).trim();
        const lowercased = trimmed.toLowerCase();
        return lowercased === '' ? (allowEmpty ? null : '') : lowercased;
      }),
    );
  }

  // Add IsNotEmpty only if empty strings are not allowed
  if (!allowEmpty) {
    decorators.push(IsNotEmpty({ message: `${fieldName} is required` }));
  }

  // Add string validation
  decorators.push(IsString({ message: `${fieldName} must be a string` }));

  // Add length validation
  decorators.push(
    Length(minLength, maxLength, {
      message: `${fieldName} must be between ${minLength} and ${maxLength} characters`,
    }),
  );

  // Add pattern validation
  decorators.push(Matches(pattern, { message: patternMessage }));

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for optional strings with pattern matching
 *
 * @param options - Validation options
 * @param options.fieldName - Name of the field for error messages (default: 'Field')
 * @param options.minLength - Minimum length (default: 1)
 * @param options.maxLength - Maximum length (default: 255)
 * @param options.pattern - Regex pattern for validation (default: alphanumeric + basic punctuation)
 * @param options.patternMessage - Custom message for pattern validation
 * @param options.sanitize - Whether to sanitize the string by trimming (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @OptionalStringValidation({ fieldName: 'Description' })
 *   description?: string;
 *
 *   @OptionalStringValidation({
 *     fieldName: 'Notes',
 *     maxLength: 1000,
 *     pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
 *     patternMessage: 'Notes can only contain letters, numbers, spaces, and basic punctuation'
 *   })
 *   notes?: string;
 * }
 * ```
 */
export function OptionalStringValidation(
  options: Omit<RequiredStringValidationOptions, 'allowEmpty'> = {},
) {
  const {
    fieldName = 'Field',
    minLength = 1,
    maxLength = 255,
    pattern = /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage = `${fieldName} can only contain letters, numbers, spaces, and basic punctuation`,
    sanitize = true,
  } = options;

  const decorators = [];

  // Add sanitization transformation if enabled
  if (sanitize) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return null;
        }

        // Trim, convert to lowercase, and return
        const trimmed = String(value).trim();
        const lowercased = trimmed.toLowerCase();
        return lowercased === '' ? null : lowercased;
      }),
    );
  }

  // Add optional validation
  decorators.push(IsOptional());

  // Add string validation (optional fields can be undefined)
  decorators.push(IsString({ message: `${fieldName} must be a string` }));

  // Add length validation (only if string is provided)
  decorators.push(
    Length(minLength, maxLength, {
      message: `${fieldName} must be between ${minLength} and ${maxLength} characters`,
    }),
  );

  // Add pattern validation (only if string is provided)
  decorators.push(Matches(pattern, { message: patternMessage }));

  return applyDecorators(...decorators);
}

export interface RequiredNumberValidationOptions {
  fieldName?: string;
  min?: number;
  max?: number;
  allowZero?: boolean;
  allowNegative?: boolean;
  transform?: boolean;
}

export interface RequiredDecimalValidationOptions {
  fieldName?: string;
  min?: number;
  max?: number;
  allowZero?: boolean;
  allowNegative?: boolean;
  transform?: boolean;
  decimalPlaces?: number;
}

/**
 * Reusable validation decorator for required numbers with range validation
 *
 * @param options - Validation options
 * @param options.fieldName - Name of the field for error messages (default: 'Field')
 * @param options.min - Minimum value (default: 0)
 * @param options.max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @param options.allowZero - Whether to allow zero values (default: true)
 * @param options.allowNegative - Whether to allow negative values (default: false)
 * @param options.transform - Whether to transform string values to numbers (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @RequiredNumberValidation({ fieldName: 'Age' })
 *   age: number;
 *
 *   @RequiredNumberValidation({
 *     fieldName: 'Salary',
 *     min: 1000,
 *     max: 1000000,
 *     allowZero: false,
 *     allowNegative: false
 *   })
 *   salary: number;
 * }
 * ```
 */
export function RequiredNumberValidation(
  options: RequiredNumberValidationOptions = {},
) {
  const {
    fieldName = 'Field',
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    allowZero = true,
    allowNegative = false,
    transform = true,
  } = options;

  const decorators = [];

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return null;
        }

        // Convert string to number
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? null : parsed;
        }

        // Return as-is if already a number
        return typeof value === 'number' ? value : null;
      }),
    );
  }

  // Add IsNotEmpty validation
  decorators.push(IsNotEmpty({ message: `${fieldName} is required` }));

  // Add number validation
  decorators.push(IsNumber({}, { message: `${fieldName} must be a number` }));

  // Add minimum value validation
  if (!allowZero && !allowNegative) {
    decorators.push(Min(1, { message: `${fieldName} must be greater than 0` }));
  } else if (allowZero && !allowNegative) {
    decorators.push(
      Min(0, { message: `${fieldName} must be greater than or equal to 0` }),
    );
  } else if (allowNegative) {
    decorators.push(
      Min(min, {
        message: `${fieldName} must be greater than or equal to ${min}`,
      }),
    );
  }

  // Add maximum value validation
  if (max !== Number.MAX_SAFE_INTEGER) {
    decorators.push(
      Max(max, {
        message: `${fieldName} must be less than or equal to ${max}`,
      }),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for required decimal numbers with range validation
 *
 * @param options - Validation options
 * @param options.fieldName - Name of the field for error messages (default: 'Field')
 * @param options.min - Minimum value (default: 0)
 * @param options.max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @param options.allowZero - Whether to allow zero values (default: true)
 * @param options.allowNegative - Whether to allow negative values (default: false)
 * @param options.transform - Whether to transform string values to numbers (default: true)
 * @param options.decimalPlaces - Number of decimal places allowed (default: 2)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @RequiredDecimalValidation({ fieldName: 'Price' })
 *   price: number;
 *
 *   @RequiredDecimalValidation({
 *     fieldName: 'Salary',
 *     min: 0,
 *     max: 1000000,
 *     allowZero: false,
 *     allowNegative: false,
 *     decimalPlaces: 2
 *   })
 *   salary: number;
 * }
 * ```
 */
export function RequiredDecimalValidation(
  options: RequiredDecimalValidationOptions = {},
) {
  const {
    fieldName = 'Field',
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    allowZero = true,
    allowNegative = false,
    transform = true,
    decimalPlaces = 2,
  } = options;

  const decorators = [];

  // Add decimal places validation using custom validator
  decorators.push(
    IsDecimalPlaces(decimalPlaces, {
      message: `${fieldName} must be a whole number or have at most ${decimalPlaces} decimal places`,
    }),
  );

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return null;
        }

        // Convert string to number
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? null : parsed;
        }

        // Return as-is if already a number
        return typeof value === 'number' ? value : null;
      }),
    );
  }

  // Add IsNotEmpty validation
  decorators.push(IsNotEmpty({ message: `${fieldName} is required` }));

  // Add number validation
  decorators.push(IsNumber({}, { message: `${fieldName} must be a number` }));

  // Add minimum value validation
  if (!allowZero && !allowNegative) {
    decorators.push(
      Min(0.01, { message: `${fieldName} must be greater than 0` }),
    );
  } else if (allowZero && !allowNegative) {
    decorators.push(
      Min(0, { message: `${fieldName} must be greater than or equal to 0` }),
    );
  } else if (allowNegative) {
    decorators.push(
      Min(min, {
        message: `${fieldName} must be greater than or equal to ${min}`,
      }),
    );
  }

  // Add maximum value validation
  if (max !== Number.MAX_SAFE_INTEGER) {
    decorators.push(
      Max(max, {
        message: `${fieldName} must be less than or equal to ${max}`,
      }),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for optional numbers with range validation
 *
 * @param options - Validation options
 * @param options.fieldName - Name of the field for error messages (default: 'Field')
 * @param options.min - Minimum value (default: 0)
 * @param options.max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @param options.allowZero - Whether to allow zero values (default: true)
 * @param options.allowNegative - Whether to allow negative values (default: false)
 * @param options.transform - Whether to transform string values to numbers (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @OptionalNumberValidation({ fieldName: 'Bonus' })
 *   bonus?: number;
 *
 *   @OptionalNumberValidation({
 *     fieldName: 'Commission',
 *     min: 0,
 *     max: 100,
 *     allowZero: true,
 *     allowNegative: false
 *   })
 *   commission?: number;
 * }
 * ```
 */
export function OptionalNumberValidation(
  options: RequiredNumberValidationOptions = {},
) {
  const {
    fieldName = 'Field',
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    allowZero = true,
    allowNegative = false,
    transform = true,
  } = options;

  const decorators = [];

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return null;
        }

        // Convert string to number
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? null : parsed;
        }

        // Return as-is if already a number
        return typeof value === 'number' ? value : null;
      }),
    );
  }

  // Add optional validation
  decorators.push(IsOptional());

  // Add number validation (optional fields can be undefined)
  decorators.push(IsNumber({}, { message: `${fieldName} must be a number` }));

  // Add minimum value validation
  if (!allowZero && !allowNegative) {
    decorators.push(Min(1, { message: `${fieldName} must be greater than 0` }));
  } else if (allowZero && !allowNegative) {
    decorators.push(
      Min(0, { message: `${fieldName} must be greater than or equal to 0` }),
    );
  } else if (allowNegative) {
    decorators.push(
      Min(min, {
        message: `${fieldName} must be greater than or equal to ${min}`,
      }),
    );
  }

  // Add maximum value validation
  if (max !== Number.MAX_SAFE_INTEGER) {
    decorators.push(
      Max(max, {
        message: `${fieldName} must be less than or equal to ${max}`,
      }),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for optional decimal numbers with range validation
 *
 * @param options - Validation options
 * @param options.fieldName - Name of the field for error messages (default: 'Field')
 * @param options.min - Minimum value (default: 0)
 * @param options.max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @param options.allowZero - Whether to allow zero values (default: true)
 * @param options.allowNegative - Whether to allow negative values (default: false)
 * @param options.transform - Whether to transform string values to numbers (default: true)
 * @param options.decimalPlaces - Number of decimal places allowed (default: 2)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @OptionalDecimalValidation({ fieldName: 'Discount' })
 *   discount?: number;
 *
 *   @OptionalDecimalValidation({
 *     fieldName: 'Commission',
 *     min: 0,
 *     max: 100,
 *     allowZero: true,
 *     allowNegative: false,
 *     decimalPlaces: 2
 *   })
 *   commission?: number;
 * }
 * ```
 */
export function OptionalDecimalValidation(
  options: RequiredDecimalValidationOptions = {},
) {
  const {
    fieldName = 'Field',
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    allowZero = true,
    allowNegative = false,
    transform = true,
    decimalPlaces = 2,
  } = options;

  const decorators = [];

  // Add decimal places validation using custom validator
  decorators.push(
    IsDecimalPlaces(decimalPlaces, {
      message: `${fieldName} must be a whole number or have at most ${decimalPlaces} decimal places`,
    }),
  );

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return null;
        }

        // Convert string to number
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? null : parsed;
        }

        // Return as-is if already a number
        return typeof value === 'number' ? value : null;
      }),
    );
  }

  // Add optional validation
  decorators.push(IsOptional());

  // Add number validation (optional fields can be undefined)
  decorators.push(IsNumber({}, { message: `${fieldName} must be a number` }));

  // Add minimum value validation
  if (!allowZero && !allowNegative) {
    decorators.push(
      Min(0.01, { message: `${fieldName} must be greater than 0` }),
    );
  } else if (allowZero && !allowNegative) {
    decorators.push(
      Min(0, { message: `${fieldName} must be greater than or equal to 0` }),
    );
  } else if (allowNegative) {
    decorators.push(
      Min(min, {
        message: `${fieldName} must be greater than or equal to ${min}`,
      }),
    );
  }

  // Add maximum value validation
  if (max !== Number.MAX_SAFE_INTEGER) {
    decorators.push(
      Max(max, {
        message: `${fieldName} must be less than or equal to ${max}`,
      }),
    );
  }

  return applyDecorators(...decorators);
}
