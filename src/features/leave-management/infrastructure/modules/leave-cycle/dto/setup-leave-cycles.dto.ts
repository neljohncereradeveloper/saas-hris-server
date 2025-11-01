import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OptionalNumberValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class SetupLeaveCyclesDto {
  @ApiProperty({
    description:
      'Base year for cycle calculation (optional, defaults to current year)',
    example: 2024,
    minimum: 2000,
    maximum: 2100,
    required: false,
  })
  @OptionalNumberValidation({
    fieldName: 'Year',
    min: 2000,
    max: 2100,
    allowZero: false,
    allowNegative: false,
    transform: true,
  })
  year?: number;

  @ApiProperty({
    description: 'Force regenerate cycles even if they already exist',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  forceRegenerate?: boolean;
}
