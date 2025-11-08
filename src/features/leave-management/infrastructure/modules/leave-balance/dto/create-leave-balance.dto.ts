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
    description: 'Leave year identifier for the leave balance (e.g., "2023-2024")',
    example: '2023-2024',
  })
  @RequiredStringValidation({
    fieldName: 'Year',
    minLength: 1,
    maxLength: 20,
  })
  year: string;
}
