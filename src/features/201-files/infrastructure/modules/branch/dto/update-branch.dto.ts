import { ApiProperty } from '@nestjs/swagger';
import { RequiredStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class UpdateBranchDto {
  @ApiProperty({
    description: 'Branch description',
    example: 'Main Office Branch',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Branch description (desc1)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Branch description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1: string;

  @ApiProperty({
    description: 'Branch code',
    example: 'MAIN001',
    minLength: 1,
    maxLength: 10,
    pattern: '^[A-Z0-9]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Branch code (brCode)',
    minLength: 1,
    maxLength: 10,
    pattern: /^[A-Z0-9]+$/,
    patternMessage:
      'Branch code must contain only uppercase letters and numbers',
    sanitize: true,
  })
  brCode: string;
}
