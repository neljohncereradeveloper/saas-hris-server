import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredNumberValidation,
  RequiredStringValidation,
  OptionalStringValidation,
  OptionalDecimalValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({
    description: 'Employee ID',
    example: 1,
    minimum: 1,
  })
  @RequiredNumberValidation({
    fieldName: 'Employee ID',
    min: 1,
    allowZero: false,
    allowNegative: false,
    transform: true,
  })
  employeeId: number;

  @ApiProperty({
    description: 'Leave type name',
    example: 'Annual Leave',
    minLength: 1,
    maxLength: 100,
  })
  @RequiredStringValidation({
    fieldName: 'Leave Type',
    minLength: 1,
    maxLength: 100,
    sanitize: true,
  })
  leaveType: string;

  @ApiProperty({
    description: 'Start date of leave',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateStringCustom({ message: 'Start date must be a valid date' })
  startDate: Date;

  @ApiProperty({
    description: 'End date of leave',
    example: '2024-01-20',
    type: String,
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsNotEmpty({ message: 'End date is required' })
  @IsDateStringCustom({ message: 'End date must be a valid date' })
  endDate: Date;

  @ApiProperty({
    description: 'Reason for leave',
    example: 'Family vacation',
    required: false,
    maxLength: 500,
  })
  @OptionalStringValidation({
    fieldName: 'Reason',
    maxLength: 500,
    sanitize: true,
  })
  reason?: string;

  @ApiProperty({
    description:
      'Total days (optional - auto-calculated from dates if not provided). Supports half-days (e.g., 0.5, 1.5). Minimum: 0.5 days.',
    example: 1.5,
    required: false,
    minimum: 0.5,
    maximum: 365,
  })
  @OptionalDecimalValidation({
    fieldName: 'Total Days',
    min: 0.5,
    max: 365,
    allowZero: true,
    allowNegative: true, // Use true to respect min parameter (allows min: 0.5)
    decimalPlaces: 2,
  })
  totalDays?: number;

  @ApiProperty({
    description:
      'Is half-day leave (only valid when startDate equals endDate). If true and dates are same, totalDays will be set to 0.5',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isHalfDay?: boolean;
}
