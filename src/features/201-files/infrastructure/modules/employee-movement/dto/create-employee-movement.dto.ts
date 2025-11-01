import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { MovementType } from '@shared/enum/movement-type.enum';
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import {
  RequiredStringValidation,
  OptionalStringValidation,
  RequiredNumberValidation,
  OptionalDecimalValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateEmployeeMovementDto {
  @ApiProperty({
    description: 'Employee ID',
    example: 1,
  })
  @RequiredNumberValidation({
    fieldName: 'Employee ID (employeeId)',
    min: 1,
    allowZero: false,
    allowNegative: false,
  })
  employeeId: number;

  @ApiProperty({
    description: 'Type of movement',
    enum: MovementType,
    example: MovementType.TRANSFER,
  })
  @IsNotEmpty({ message: 'Movement type is required' })
  @IsEnum(MovementType, { message: 'Invalid movement type' })
  movementType: MovementType;

  @ApiProperty({
    description: 'Effective date of the movement',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsDateStringCustom({ message: 'Effective date must be a valid date' })
  effectiveDate: Date;

  @ApiPropertyOptional({
    description: 'Reason for the movement',
    example: 'Department restructuring and promotion',
    maxLength: 1000,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Reason (reason)',
    minLength: 1,
    maxLength: 1000,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Reason can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'New branch name',
    example: 'Downtown Branch',
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'New branch (newBranch)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'New branch can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  newBranch?: string;

  @ApiPropertyOptional({
    description: 'New department name',
    example: 'Information Technology',
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'New department (newDepartment)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'New department can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  newDepartment?: string;

  @ApiPropertyOptional({
    description: 'New job title name',
    example: 'Lead Developer',
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'New job title (newJobTitle)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'New job title can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  newJobTitle?: string;

  @ApiPropertyOptional({
    description: 'New annual salary',
    example: 60000.0,
  })
  @OptionalDecimalValidation({
    fieldName: 'New annual salary (newAnnualSalary)',
    min: 0.01,
    allowZero: false,
    allowNegative: false,
    decimalPlaces: 2,
  })
  newAnnualSalary?: number;

  @ApiPropertyOptional({
    description: 'New monthly salary',
    example: 5000.0,
  })
  @OptionalDecimalValidation({
    fieldName: 'New monthly salary (newMonthlySalary)',
    min: 0.01,
    allowZero: false,
    allowNegative: false,
    decimalPlaces: 2,
  })
  newMonthlySalary?: number;

  @ApiPropertyOptional({
    description: 'Approved by (user ID or name)',
    example: 'admin@company.com',
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Approved by (approvedBy)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Approved by can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  approvedBy?: string;

  @ApiProperty({
    description: 'Approved date of the movement',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsDateStringCustom({ message: 'Approved date must be a valid date' })
  approvedDate: Date;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Employee requested this transfer for career development',
    maxLength: 2000,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Notes (notes)',
    minLength: 1,
    maxLength: 2000,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Notes can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  notes?: string;
}
