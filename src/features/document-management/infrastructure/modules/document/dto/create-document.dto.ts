import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  Length,
  Matches,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnumDocumentScope } from '@features/document-management/domain/enum/document-scope.enum';
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import { TransformUtil } from '@features/shared/infrastructure/utils/transform.util';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Document title',
    example: 'Employment Contract',
    minLength: 1,
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Document title is required' })
  @IsString({ message: 'Document title must be a string' })
  @Length(1, 255, {
    message: 'Document title must be between 1 and 255 characters',
  })
  @Matches(/^[a-zA-Z0-9\s\-_&.,()]+$/, {
    message:
      'Document title can only contain letters, numbers, spaces, and basic punctuation',
  })
  title: string;

  @ApiProperty({
    description: 'File name of the uploaded document',
    example: 'contract_2024.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'File name must be a string' })
  fileName?: string;

  @ApiProperty({
    description: 'File path or URL of the uploaded document',
    example: '/uploads/documents/contract_2024.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'File path must be a string' })
  filePath?: string;

  @ApiProperty({
    description: 'Document scope - Employee or General',
    enum: EnumDocumentScope,
    example: EnumDocumentScope.EMPLOYEE,
  })
  @IsNotEmpty({ message: 'Document scope is required' })
  @IsEnum(EnumDocumentScope, {
    message: 'Document scope must be either Employee or General',
  })
  scope: EnumDocumentScope;

  @ApiProperty({
    description: 'Employee ID (required if scope is Employee)',
    example: 123,
    required: false,
  })
  @TransformUtil.toNumber(true)
  @IsOptional()
  @IsNumber({}, { message: 'Employee ID must be a number' })
  employeeId?: number;

  @ApiProperty({
    description: 'Document type reference',
    example: 'Contract',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Document type must be a string' })
  documentType?: string;

  @ApiProperty({
    description: 'Document description',
    example: 'Employment contract for new hire',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Document description must be a string' })
  @Length(0, 500, {
    message: 'Document description must not exceed 500 characters',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Expiration date of the document',
    example: '2024-12-31',
    type: 'string',
    format: 'date',
    required: false,
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'Expiration date must be a valid date' })
  expirationDate?: Date;

  @ApiProperty({
    description: 'Target department for group-wide documents',
    example: 'Human Resources',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Target department must be a string' })
  targetDepartment?: string;

  @ApiProperty({
    description: 'Target branch for branch-wide documents',
    example: 'Main Office',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Target branch must be a string' })
  targetBranch?: string;

  // File upload fields (populated by controller)
  @ApiProperty({
    description: 'File buffer (populated by file upload)',
    required: false,
  })
  @IsOptional()
  fileBuffer?: Buffer;

  @ApiProperty({
    description: 'File MIME type (populated by file upload)',
    example: 'application/pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'File MIME type must be a string' })
  fileMimetype?: string;

  @ApiProperty({
    description: 'File type for upload handling',
    enum: ['image', 'contract', 'public-document', 'temporary'],
    example: 'contract',
    required: false,
  })
  @IsOptional()
  @IsIn(['image', 'contract', 'public-document', 'temporary'], {
    message:
      'File type must be one of: image, contract, public-document, temporary',
  })
  fileType?: 'image' | 'contract' | 'public-document' | 'temporary';
}
