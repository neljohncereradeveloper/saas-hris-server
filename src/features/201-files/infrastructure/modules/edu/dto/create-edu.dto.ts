import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredStringValidation,
  OptionalStringValidation,
  RequiredNumberValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateEduDto {
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
    description: 'School name',
    example: 'University of the Philippines',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'School (school)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'School can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  school: string;

  @ApiProperty({
    description: 'Education level',
    example: "Bachelor's Degree",
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Education level (eduLevel)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Education level can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  eduLevel: string;

  @ApiProperty({
    description: 'Course name',
    example: 'Computer Science',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
    required: false,
  })
  @OptionalStringValidation({
    fieldName: 'Course (course)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Course can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  course?: string;

  @ApiProperty({
    description: 'Course level',
    example: 'Undergraduate',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
    required: false,
  })
  @OptionalStringValidation({
    fieldName: 'Course level (courseLevel)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Course level can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  courseLevel?: string;

  @ApiProperty({
    description: 'School year',
    example: '2018-2022',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'School year (schoolYear)',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'School year can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  schoolYear: string;
}
