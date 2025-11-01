import { ApiPropertyOptional } from '@nestjs/swagger';
import { OptionalStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLeaveTypeDto {
  @ApiPropertyOptional({
    description: 'Leave type name',
    example: 'Vacation Leave',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Leave type name',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Leave type name can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Leave type code',
    example: 'VL',
    minLength: 1,
    maxLength: 20,
    pattern: '^[A-Z0-9_]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Leave type code',
    minLength: 1,
    maxLength: 20,
    pattern: /^[A-Z0-9_]+$/,
    patternMessage:
      'Leave type code can only contain uppercase letters, numbers, and underscores',
    sanitize: false,
  })
  code?: string;

  @ApiPropertyOptional({
    description: 'Description of the leave type',
    example: 'Vacation leave for employee rest and recreation',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Description',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1?: string;

  @ApiPropertyOptional({
    description: 'Whether the leave is paid',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Paid status must be a boolean value' })
  paid?: boolean;

  @ApiPropertyOptional({
    description: 'Additional remarks or notes about the leave type',
    example: 'Can be used for vacation or personal time off',
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
