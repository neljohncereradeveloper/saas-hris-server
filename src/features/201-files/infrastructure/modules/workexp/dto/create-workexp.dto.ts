import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredStringValidation,
  OptionalStringValidation,
  RequiredNumberValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateWorkExpDto {
  @ApiProperty({
    description: 'The ID of the employee this work experience belongs to',
    example: 1,
    type: 'number',
  })
  @RequiredNumberValidation({
    fieldName: 'Employee ID (employeeId)',
    min: 1,
    allowZero: false,
    allowNegative: false,
  })
  employeeId: number;

  @ApiProperty({
    description: 'The job title or position held during this work experience',
    example: 'Senior Software Engineer',
    required: false,
    maxLength: 100,
    minLength: 1,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Job title (jobTitle)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Job title can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  jobTitle?: string;

  @ApiProperty({
    description: 'The name of the company where the work experience was gained',
    example: 'Tech Solutions Inc.',
    maxLength: 100,
    minLength: 1,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Company (company)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Company can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  company: string;

  @ApiProperty({
    description: 'Duration or years of experience in this position',
    example: '2 years',
    required: false,
    maxLength: 50,
    minLength: 1,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Years (years)',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Years can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  years?: string;
}
