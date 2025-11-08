import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';
import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsString,
} from 'class-validator';
import { RequiredDecimalValidation } from '@features/shared/infrastructure/decorators/validation.decorator';
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import { Transform } from 'class-transformer';

export class CreateLeavePolicyDto {
  @ApiProperty({
    description: 'Leave type name',
    example: 'Vacation Leave',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Leave type',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Leave type can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  leaveType: string;

  @ApiProperty({
    description: 'Annual entitlement days',
    example: 15,
    minimum: 0,
  })
  @RequiredDecimalValidation({
    fieldName: 'Annual entitlement',
    min: 0,
    allowZero: true,
    allowNegative: false,
    decimalPlaces: 2,
    transform: true,
  })
  annualEntitlement: number;

  @ApiProperty({
    description: 'Maximum days that can be carried over',
    example: 5,
    minimum: 0,
  })
  @RequiredDecimalValidation({
    fieldName: 'Carry limit',
    min: 0,
    allowZero: true,
    allowNegative: false,
    decimalPlaces: 2,
    transform: true,
  })
  carryLimit: number;

  @ApiProperty({
    description: 'Maximum days that can be encashed',
    example: 10,
    minimum: 0,
  })
  @RequiredDecimalValidation({
    fieldName: 'Encash limit',
    min: 0,
    allowZero: true,
    allowNegative: false,
    decimalPlaces: 2,
    transform: true,
  })
  encashLimit: number;

  @ApiProperty({
    description: 'Cycle length in years',
    example: 1,
    minimum: 1,
  })
  @RequiredDecimalValidation({
    fieldName: 'Cycle length years',
    min: 1,
    allowZero: false,
    allowNegative: false,
    decimalPlaces: 0,
    transform: true,
  })
  cycleLengthYears: number;

  @ApiPropertyOptional({
    description: 'Effective date',
    example: '2024-01-01',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'Effective date must be a valid date' })
  effectiveDate?: Date;

  @ApiPropertyOptional({
    description: 'Expiry date',
    example: '2024-12-31',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'Expiry date must be a valid date' })
  expiryDate?: Date;

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

  @ApiPropertyOptional({
    description:
      'Minimum service period in months required for eligibility (e.g., 12 for 1 year, 6 for 6 months). Set to 0 or omit for no requirement.',
    example: 12,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Minimum service months must be an integer' })
  @Min(0, { message: 'Minimum service months cannot be negative' })
  minimumServiceMonths?: number;

  @ApiPropertyOptional({
    description:
      'Array of allowed employee statuses (e.g., ["regular"]). Leave empty or null to allow all statuses.',
    example: ['regular'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Allowed employee statuses must be an array' })
  @IsString({ each: true, message: 'Each employee status must be a string' })
  allowedEmployeeStatuses?: string[];
}
