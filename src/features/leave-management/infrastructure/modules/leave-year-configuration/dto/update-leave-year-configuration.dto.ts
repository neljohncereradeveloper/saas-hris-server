import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsString,
  IsBoolean,
} from 'class-validator';
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import { Transform } from 'class-transformer';

export class UpdateLeaveYearConfigurationDto {
  @ApiPropertyOptional({
    description: 'Cutoff start date (e.g., Nov 26)',
    example: '2023-11-26',
    type: String,
  })
  @IsOptional()
  @IsDateStringCustom({ message: 'Invalid cutoff start date format' })
  @Transform(({ value }) => (value ? transformDateString(value) : value))
  cutoffStartDate?: Date;

  @ApiPropertyOptional({
    description: 'Cutoff end date (e.g., Nov 25 of next year)',
    example: '2024-11-25',
    type: String,
  })
  @IsOptional()
  @IsDateStringCustom({ message: 'Invalid cutoff end date format' })
  @Transform(({ value }) => (value ? transformDateString(value) : value))
  cutoffEndDate?: Date;

  @ApiPropertyOptional({
    description: 'Remarks about the cutoff configuration',
    example: 'Updated cutoff period',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description: 'Whether the configuration is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

