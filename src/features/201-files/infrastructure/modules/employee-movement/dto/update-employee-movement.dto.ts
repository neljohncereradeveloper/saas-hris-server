import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { MovementType } from '@shared/enum/movement-type.enum';
import { transformDateString } from '@features/shared/infrastructure/utils/date.util';
import {
  OptionalStringValidation,
  OptionalDecimalValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class UpdateEmployeeMovementDto {
  @ApiPropertyOptional({
    description: 'Type of movement',
    enum: MovementType,
    example: MovementType.TRANSFER,
  })
  @IsOptional()
  @IsEnum(MovementType, { message: 'Invalid movement type' })
  movementType?: MovementType;

  @ApiPropertyOptional({
    description: 'Effective date of the movement',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => (value ? transformDateString(value) : undefined))
  @IsOptional()
  @IsDateString({}, { message: 'Effective date must be a valid date' })
  effectiveDate?: Date;

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
    example: 'Main Office',
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
    example: 'Human Resources',
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
    description: 'New job title',
    example: 'Senior Developer',
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

  @ApiPropertyOptional({
    description: 'Approval date',
    example: '2024-01-10',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => (value ? transformDateString(value) : undefined))
  @IsOptional()
  @IsDateString({}, { message: 'Approval date must be a valid date' })
  approvedDate?: Date;

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
