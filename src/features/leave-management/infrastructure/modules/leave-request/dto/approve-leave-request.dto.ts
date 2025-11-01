import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredNumberValidation,
  OptionalStringValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class ApproveLeaveRequestDto {
  @ApiProperty({
    description: 'Approver employee ID',
    example: 2,
    minimum: 1,
  })
  @RequiredNumberValidation({
    fieldName: 'Approver Employee ID',
    min: 1,
    allowZero: false,
    allowNegative: false,
    transform: true,
  })
  approverId: number;

  @ApiProperty({
    description: 'Approval remarks',
    example: 'Approved for vacation',
    required: false,
    maxLength: 500,
  })
  @OptionalStringValidation({
    fieldName: 'Remarks',
    maxLength: 500,
    sanitize: true,
  })
  remarks?: string;
}

