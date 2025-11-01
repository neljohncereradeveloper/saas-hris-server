import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredNumberValidation,
  RequiredStringValidation,
  OptionalNumberValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateLeaveCycleDto {
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
    description:
      'Year for cycle calculation (optional, defaults to current year)',
    example: 2025,
    minimum: 2000,
    maximum: 2100,
    required: false,
  })
  @OptionalNumberValidation({
    fieldName: 'Year',
    min: 2000,
    max: 2100,
    allowZero: false,
    allowNegative: false,
    transform: true,
  })
  year?: number;
}
