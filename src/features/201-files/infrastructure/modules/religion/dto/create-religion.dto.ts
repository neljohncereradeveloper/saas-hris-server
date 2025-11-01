import { ApiProperty } from '@nestjs/swagger';
import { RequiredStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateReligionDto {
  @ApiProperty({
    description: 'Religion description',
    example: 'Catholic',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Religion description (desc1)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Religion description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1: string;
}
