import { ApiProperty } from '@nestjs/swagger';
import { RequiredStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class UpdateTrainingCertDto {
  @ApiProperty({
    description: 'Training certificate description',
    example: 'AWS Certified Solutions Architect',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Training certificate description (desc1)',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Training certificate description can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  desc1: string;
}
