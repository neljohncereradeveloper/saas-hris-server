import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { MovementType } from '@shared/enum/movement-type.enum';
import { transformDateString } from '@features/shared/infrastructure/utils/date.util';
import {
  OptionalStringValidation,
  OptionalNumberValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class QueryEmployeeMovementDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @OptionalNumberValidation({
    fieldName: 'Page (page)',
    min: 1,
    allowZero: false,
    allowNegative: false,
  })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @OptionalNumberValidation({
    fieldName: 'Limit (limit)',
    min: 1,
    max: 100,
    allowZero: false,
    allowNegative: false,
  })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Employee ID to filter movements',
    example: 1,
  })
  @OptionalNumberValidation({
    fieldName: 'Employee ID (employeeId)',
    min: 1,
    allowZero: false,
    allowNegative: false,
  })
  employeeId?: number;

  @ApiPropertyOptional({
    description: 'Movement type to filter',
    enum: MovementType,
    example: MovementType.TRANSFER,
  })
  @IsOptional()
  @IsEnum(MovementType, { message: 'Invalid movement type' })
  movementType?: MovementType;

  @ApiPropertyOptional({
    description: 'Filter movements from this date',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => (value ? transformDateString(value) : undefined))
  @IsOptional()
  @IsDateString({}, { message: 'Effective date from must be a valid date' })
  effectiveDateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter movements until this date',
    example: '2024-12-31',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => (value ? transformDateString(value) : undefined))
  @IsOptional()
  @IsDateString({}, { message: 'Effective date to must be a valid date' })
  effectiveDateTo?: Date;

  @ApiPropertyOptional({
    description: 'Search term for employee name or movement reason',
    example: 'John Doe',
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Search term (searchTerm)',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Search term can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  searchTerm?: string;
}
