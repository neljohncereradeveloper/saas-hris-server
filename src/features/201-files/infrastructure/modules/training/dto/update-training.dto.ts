import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateTrainingDto {
  @ApiProperty({
    description: 'Training date of the employee',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsNotEmpty({ message: 'Training date is required' })
  @IsDateStringCustom({ message: 'Training date must be a valid date' })
  trainingDate: Date;

  @ApiProperty({
    description: 'Certificate or credential received from the training',
    example: 'AWS Solutions Architect Associate',
    maxLength: 100,
    minLength: 1,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Employee training certificate (empTrainingsCertificate)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Employee training certificate can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  empTrainingsCertificate: string;

  @ApiProperty({
    description: 'Title or name of the training program',
    example: 'Advanced Project Management',
    required: false,
    maxLength: 100,
    minLength: 1,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Training title (trainingTitle)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Training title can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  trainingTitle?: string;

  @ApiProperty({
    description: 'Additional description or notes about the training',
    example:
      'Comprehensive training covering agile methodologies and team leadership',
    required: false,
    maxLength: 500,
    minLength: 1,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Description (desc1)',
    minLength: 1,
    maxLength: 500,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1?: string;
}
