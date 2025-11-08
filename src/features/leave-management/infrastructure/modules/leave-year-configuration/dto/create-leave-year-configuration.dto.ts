import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import { Transform } from 'class-transformer';

export class CreateLeaveYearConfigurationDto {
  @ApiProperty({
    description: 'Cutoff start date (e.g., Nov 26)',
    example: '2023-11-26',
    type: String,
  })
  @IsNotEmpty({ message: 'Cutoff start date is required' })
  @IsDateStringCustom({ message: 'Invalid cutoff start date format' })
  @Transform(({ value }) => transformDateString(value))
  cutoffStartDate: Date;

  @ApiProperty({
    description: 'Cutoff end date (e.g., Nov 25 of next year)',
    example: '2024-11-25',
    type: String,
  })
  @IsNotEmpty({ message: 'Cutoff end date is required' })
  @IsDateStringCustom({ message: 'Invalid cutoff end date format' })
  @Transform(({ value }) => transformDateString(value))
  cutoffEndDate: Date;

  @ApiPropertyOptional({
    description: 'Remarks about the cutoff configuration',
    example: 'Standard cutoff period for 2023-2024',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

