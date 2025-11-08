import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RequiredStringValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';
import { IsBoolean, IsOptional } from 'class-validator';

export class GenerateAnnualLeaveBalancesDto {
  @ApiProperty({
    description: 'Leave year identifier to generate leave balances for (e.g., "2023-2024")',
    example: '2023-2024',
  })
  @RequiredStringValidation({
    fieldName: 'Year',
    minLength: 1,
    maxLength: 20,
  })
  year: string;

  @ApiPropertyOptional({
    description: 'Force regeneration of existing balances',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Force regenerate must be a boolean value' })
  forceRegenerate?: boolean;
}
