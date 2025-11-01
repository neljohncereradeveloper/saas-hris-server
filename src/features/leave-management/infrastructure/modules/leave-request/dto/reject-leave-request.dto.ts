import { ApiProperty } from '@nestjs/swagger';
import {
  RequiredNumberValidation,
  RequiredStringValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class RejectLeaveRequestDto {
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
    description: 'Rejection remarks (required)',
    example: 'Insufficient coverage during requested period',
    maxLength: 500,
  })
  @RequiredStringValidation({
    fieldName: 'Remarks',
    minLength: 1,
    maxLength: 500,
    sanitize: true,
  })
  remarks: string;
}
