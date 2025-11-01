import { ApiProperty } from '@nestjs/swagger';
import { RequiredStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class UpdateDepartmentDto {
  @ApiProperty({
    description: 'Department description',
    example: 'Human Resources Department',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Department description (desc1)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Department description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1: string;

  @ApiProperty({
    description: 'Department code',
    example: 'HR001',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Department code (code)',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Department code can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  code: string;

  @ApiProperty({
    description: 'Department designation',
    example: 'Human Resources',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Department designation (designation)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Department designation can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  designation: string;
}
