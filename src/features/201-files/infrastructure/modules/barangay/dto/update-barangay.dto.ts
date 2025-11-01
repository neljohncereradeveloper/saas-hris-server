import { ApiProperty } from '@nestjs/swagger';
import { RequiredStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class UpdateBarangayDto {
  @ApiProperty({
    description: 'Barangay description',
    example: 'Barangay 123',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Address Barangay description (desc1)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Address Barangay description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1: string;
}
