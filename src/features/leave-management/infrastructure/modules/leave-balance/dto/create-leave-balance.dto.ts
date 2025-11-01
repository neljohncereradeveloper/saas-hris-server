import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredStringValidation,
  RequiredNumberValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateLeaveBalanceDto {
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
    description: 'Leave policy ID',
    example: 1,
    minimum: 1,
  })
  @RequiredNumberValidation({
    fieldName: 'Policy ID',
    min: 1,
    allowZero: false,
    allowNegative: false,
    transform: true,
  })
  policyId: number;

  @ApiProperty({
    description: 'Year for the leave balance',
    example: 2024,
    minimum: 2000,
    maximum: 2100,
  })
  @RequiredNumberValidation({
    fieldName: 'Year',
    min: 2000,
    max: 2100,
    allowZero: false,
    allowNegative: false,
    transform: true,
  })
  year: number;
}
