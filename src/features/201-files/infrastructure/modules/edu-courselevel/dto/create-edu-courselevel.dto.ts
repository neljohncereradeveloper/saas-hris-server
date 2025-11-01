import { ApiProperty } from '@nestjs/swagger';
import { RequiredStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateEduCourseLevelDto {
  @ApiProperty({
    description: 'Education course level description',
    example: 'Undergraduate',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Education course level description (desc1)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Education course level description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1: string;
}
