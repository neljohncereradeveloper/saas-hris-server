import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredStringValidation,
  OptionalStringValidation,
  RequiredNumberValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateReferenceDto {
  @ApiProperty({
    description: 'Employee ID',
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
    description: 'First name of the reference',
    example: 'John',
    type: 'string',
    minLength: 1,
    maxLength: 100,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @RequiredStringValidation({
    fieldName: 'First name (fname)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'First name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  fname: string;

  @ApiProperty({
    description: 'Middle name of the reference',
    example: 'Michael',
    type: 'string',
    minLength: 1,
    maxLength: 100,
    required: false,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @OptionalStringValidation({
    fieldName: 'Middle name (mname)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Middle name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  mname?: string;

  @ApiProperty({
    description: 'Last name of the reference',
    example: 'Doe',
    type: 'string',
    minLength: 1,
    maxLength: 100,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @RequiredStringValidation({
    fieldName: 'Last name (lname)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Last name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  lname: string;

  @ApiProperty({
    description: 'Suffix of the reference (e.g., Jr., Sr., III)',
    example: 'Jr.',
    type: 'string',
    minLength: 1,
    maxLength: 10,
    required: false,
    pattern: '^[a-zA-Z.]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Suffix (suffix)',
    minLength: 1,
    maxLength: 10,
    pattern: /^[a-zA-Z.]+$/,
    patternMessage: 'Suffix can only contain letters and periods',
    sanitize: true,
  })
  suffix?: string;

  @ApiProperty({
    description: 'Cellphone number of the reference',
    example: '+1234567890',
    type: 'string',
    minLength: 10,
    maxLength: 15,
    required: false,
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Cellphone number (cellphoneNumber)',
    minLength: 10,
    maxLength: 15,
    pattern: /^[0-9+\-\s()]+$/,
    patternMessage:
      'Cellphone number can only contain numbers, plus signs, hyphens, spaces, and parentheses',
    sanitize: true,
  })
  cellphoneNumber?: string;
}
