import { ApiProperty } from '@nestjs/swagger';
import { RequiredStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateEmployeeMovementTypeDto {
  @ApiProperty({
    description: 'Employee movement type description',
    example: 'Transfer',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Employee movement type description (desc1)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Employee movement type description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1: string;
}
