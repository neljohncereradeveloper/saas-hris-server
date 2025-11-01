import { ApiPropertyOptional } from '@nestjs/swagger';
import { OptionalStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class UpdateGovernmentDetailsDto {
  @ApiPropertyOptional({
    description: 'Philippine Health Insurance Corporation (PHIC) number',
    example: '123456789012',
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'PHIC',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'PHIC can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  phic?: string;

  @ApiPropertyOptional({
    description: 'Home Development Mutual Fund (HDMF) number',
    example: '123456789012',
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'HDMF',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'HDMF can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  hdmf?: string;

  @ApiPropertyOptional({
    description: 'Social Security System (SSS) number',
    example: '1234567890',
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'SSS number',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'SSS number can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  sssNo?: string;

  @ApiPropertyOptional({
    description: 'Tax Identification Number (TIN)',
    example: '123456789',
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'TIN number',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'TIN number can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  tinNo?: string;

  @ApiPropertyOptional({
    description: 'Tax exempt code',
    example: '123456789012',
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Tax exempt code',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Tax exempt code can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  taxExemptCode?: string;
}
