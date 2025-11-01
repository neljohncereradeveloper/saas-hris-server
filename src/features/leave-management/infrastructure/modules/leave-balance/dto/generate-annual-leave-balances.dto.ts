import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RequiredNumberValidation,
  OptionalNumberValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';
import { IsBoolean, IsOptional } from 'class-validator';

export class GenerateAnnualLeaveBalancesDto {
  @ApiProperty({
    description: 'Year to generate leave balances for',
    example: 2024,
    minimum: 2000,
    maximum: 2100,
  })
  @RequiredNumberValidation({
    fieldName: 'Year',
    min: 2000,
    max: 2100,
    allowZero: false,
    allowNegative: false,
    transform: true,
  })
  year: number;

  @ApiPropertyOptional({
    description: 'Force regeneration of existing balances',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Force regenerate must be a boolean value' })
  forceRegenerate?: boolean;
}
