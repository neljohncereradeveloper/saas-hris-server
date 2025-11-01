import {
  IsOptional,
  IsNumberString,
  IsArray,
  IsEnum,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatusEnum } from '@shared/enum/employee-status.enum';
import { OptionalStringValidation } from '@features/shared/infrastructure/decorators/validation.decorator';

export class QueryEmployeeDto {
  @ApiPropertyOptional({
    description: 'Search term to filter employees by name, email, or ID',
    example: 'doe',
    minLength: 0,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-\\.\\@]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Search term',
    minLength: 0,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-\.\@]+$/,
    patternMessage:
      'Search term can only contain letters, numbers, spaces, hyphens, dots, and @ symbols',
    sanitize: true,
  })
  term?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: '1',
    default: '1',
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a valid number' })
  @Matches(/^\d+$/, { message: 'Page must contain only numbers' })
  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? '1' : Math.max(1, parsed).toString();
  })
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: '100',
    default: '10',
    maximum: 100,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a valid number' })
  @Matches(/^\d+$/, { message: 'Limit must contain only numbers' })
  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? '10' : Math.min(100, Math.max(1, parsed)).toString();
  })
  limit?: string;

  @ApiPropertyOptional({
    description: 'Filter by employee status',
    example: [],
    enum: EmployeeStatusEnum,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];

    // If it's already an array, return it
    if (Array.isArray(value)) return value;

    // If it's a string, try to parse it as JSON array
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If JSON parsing fails, treat as single string wrapped in array
        return [value];
      }
    }

    return [];
  })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? item.toLowerCase() : item,
      );
    }
    return value;
  })
  @IsArray({ message: 'Employee status must be an array' })
  @IsEnum(EmployeeStatusEnum, {
    each: true,
    message: 'Each employee status must be a valid status',
  })
  employeeStatus?: string[];
}
