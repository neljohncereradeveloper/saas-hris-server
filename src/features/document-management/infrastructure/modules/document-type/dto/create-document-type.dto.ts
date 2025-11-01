import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
export class CreateDocumentTypeDto {
  @ApiProperty({
    description: 'Document type description',
    example: 'Contract',
    minLength: 1,
    maxLength: 255,
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
  name: string;

  @ApiProperty({
    description: 'Document type description',
    example: 'Contract Description',
    minLength: 1,
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Document type description is required' })
  @IsString({ message: 'Document type description must be a string' })
  @Length(1, 255, {
    message: 'Document type description must be between 1 and 255 characters',
  })
  desc1: string;
}
