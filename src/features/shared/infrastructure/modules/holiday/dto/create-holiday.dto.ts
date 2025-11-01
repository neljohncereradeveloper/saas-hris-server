import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';
import { IsDateString, IsOptional } from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({
    description: 'Holiday name',
    example: "New Year's Day",
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()\']+$',
  })
  @RequiredStringValidation({
    fieldName: 'Holiday name',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()']+$/,
    patternMessage:
      'Holiday name can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  name: string;

  @ApiProperty({
    description: 'Holiday date',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @IsDateString({}, { message: 'Date must be a valid date string (YYYY-MM-DD)' })
  date: string;

  @ApiPropertyOptional({
    description: 'Description of the holiday',
    example: 'New Year celebration',
    maxLength: 1000,
  })
  @OptionalStringValidation({
    fieldName: 'Description',
    minLength: 1,
    maxLength: 1000,
    pattern: /^[a-zA-Z0-9\s\-_&.,()']+$/,
    patternMessage:
      'Description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  @IsOptional()
  description?: string;
}

