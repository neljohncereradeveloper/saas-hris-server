import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
export class UpdateDocumentTypeDto {
  @ApiProperty({
    description: 'Document type name',
    example: 'Contract',
    minLength: 1,
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Document type name is required' })
  @IsString({ message: 'Document type name must be a string' })
  @Length(1, 255, {
    message: 'Document type name must be between 1 and 255 characters',
  })
  name: string;

  @ApiProperty({
    description: 'Document type description',
    example: 'Contract Description',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Document type description is required' })
  @IsString({ message: 'Document type description must be a string' })
  @Length(1, 255, {
    message: 'Document type description must be between 1 and 255 characters',
  })
  @Matches(/^[a-zA-Z0-9\s\-_&.,()]+$/, {
    message:
      'Document type description can only contain letters, numbers, spaces, and basic punctuation',
  })
  desc1: string;
}
