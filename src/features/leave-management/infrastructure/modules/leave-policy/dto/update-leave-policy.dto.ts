import { ApiPropertyOptional } from '@nestjs/swagger';
import { OptionalStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';
import { IsOptional, IsDateString } from 'class-validator';
import { OptionalDecimalValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class UpdateLeavePolicyDto {
  @ApiPropertyOptional({
    description: 'Leave type name',
    example: 'Vacation Leave',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Leave type',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Leave type can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  leaveType?: string;

  @ApiPropertyOptional({
    description: 'Annual entitlement days',
    example: 15,
    minimum: 0,
  })
  @OptionalDecimalValidation({
    fieldName: 'Annual entitlement',
    min: 0.01,
    allowZero: false,
    allowNegative: false,
    decimalPlaces: 2,
    transform: true,
  })
  annualEntitlement?: number;

  @ApiPropertyOptional({
    description: 'Maximum days that can be carried over',
    example: 5,
    minimum: 0,
  })
  @OptionalDecimalValidation({
    fieldName: 'Carry limit',
    min: 0,
    allowZero: true,
    allowNegative: false,
    decimalPlaces: 2,
    transform: true,
  })
  carryLimit?: number;

  @ApiPropertyOptional({
    description: 'Maximum days that can be encashed',
    example: 10,
    minimum: 0,
  })
  @OptionalDecimalValidation({
    fieldName: 'Encash limit',
    min: 0,
    allowZero: true,
    allowNegative: false,
    decimalPlaces: 2,
    transform: true,
  })
  encashLimit?: number;

  @ApiPropertyOptional({
    description: 'Cycle length in years',
    example: 1,
    minimum: 1,
  })
  @OptionalDecimalValidation({
    fieldName: 'Cycle length years',
    min: 1,
    allowZero: false,
    allowNegative: false,
    decimalPlaces: 0,
    transform: true,
  })
  cycleLengthYears?: number;

  @ApiPropertyOptional({
    description: 'Effective date',
    example: '2024-01-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Effective date must be a valid date in ISO format' },
  )
  effectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Expiry date',
    example: '2024-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Expiry date must be a valid date in ISO format' },
  )
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Additional remarks or notes about the policy',
    example: 'This policy applies to all full-time employees',
    maxLength: 1000,
  })
  @OptionalStringValidation({
    fieldName: 'Remarks',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Remarks can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  remarks?: string;
}
