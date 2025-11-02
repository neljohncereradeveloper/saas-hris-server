import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsNumber,
  IsOptional,
  IsEmail,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GenderEnum } from '@shared/enum/gender.enum';
import {
  IsDateStringCustom,
  transformDateString,
} from '@features/shared/infrastructure/utils/date.util';
import {
  OptionalDecimalValidation,
  OptionalNumberValidation,
  OptionalStringValidation,
  RequiredStringValidation,
} from '@features/shared/infrastructure/decorators/validation.decorator';

export class CreateEmployeeDto {
  // ===== REQUIRED DATE FIELDS =====
  @ApiProperty({
    description: 'Hire date of the employee',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsNotEmpty({ message: 'Hire date is required' })
  @IsDateStringCustom({ message: 'Hire date must be a valid date' })
  hireDate: Date;

  @ApiPropertyOptional({
    description: 'Regularization date',
    example: '',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'Regularization date must be a valid date' })
  regularizationDate?: Date;

  @ApiPropertyOptional({
    description: 'End date of employment',
    example: '',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'End date must be a valid date' })
  endDate?: Date;

  @ApiProperty({
    description: 'Birth date of the employee',
    example: '1990-05-15',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsNotEmpty({ message: 'Birth date is required' })
  @IsDateStringCustom({ message: 'Birth date must be a valid date' })
  birthDate: Date;

  @ApiProperty({
    description: 'Employee status',
    example: 'Regular',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Employee status',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  employeeStatus: string;

  @ApiProperty({
    description: 'Job title of the employee',
    example: 'Software Engineer',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Job title',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  jobTitle: string;

  @ApiProperty({
    description: 'Religion of the employee',
    example: 'Roman Catholic',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Religion',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  religion: string;

  @ApiProperty({
    description: 'Civil status of the employee',
    example: 'Single',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Civil status',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  civilStatus: string;

  @ApiProperty({
    description: 'First name of the employee',
    example: 'John',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'First name',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  fname: string;

  @ApiPropertyOptional({
    description: 'Middle name of the employee',
    example: 'Michael',
    minLength: 1,
    maxLength: 100,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @OptionalStringValidation({
    fieldName: 'Middle name',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Middle name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  mname?: string;

  @ApiProperty({
    description: 'Last name of the employee',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Last name',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  lname: string;

  @ApiPropertyOptional({
    description: 'Name suffix',
    example: 'Jr.',
    minLength: 1,
    maxLength: 10,
    pattern: '^[a-zA-Z.]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Suffix',
    minLength: 1,
    maxLength: 10,
    pattern: /^[a-zA-Z.]+$/,
    patternMessage: 'Suffix can only contain letters and periods',
    sanitize: true,
  })
  suffix?: string;

  @ApiPropertyOptional({
    description: 'Employee ID number',
    example: 'EMP-2024-001',
    minLength: 1,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Employee ID number',
    minLength: 1,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  idNumber?: string;

  @ApiPropertyOptional({
    description: 'Biometric number',
    example: 'BIO-001',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Bio number',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Bio number can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  bioNumber?: string;

  @ApiPropertyOptional({
    description: 'Gender of the employee',
    example: 'male',
    enum: GenderEnum,
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Gender',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Gender can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  @IsEnum(GenderEnum, { message: 'Gender must be a valid gender' })
  gender?: string;

  @ApiPropertyOptional({
    description: 'Citizenship of the employee',
    example: 'Filipino',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Citizenship',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Citizenship can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  citizenShip?: string;

  @ApiProperty({
    description: 'Branch where employee works',
    example: 'Default',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Branch',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  branch: string;

  @ApiPropertyOptional({
    description: 'Department of the employee',
    example: 'Information Technology',
    maxLength: 255,
    minLength: 1,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Department',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  department?: string;

  @ApiPropertyOptional({
    description: 'Age of the employee',
    example: 34,
    minimum: 0,
    maximum: 150,
  })
  @OptionalNumberValidation({
    fieldName: 'Age',
    min: 0,
    max: 150,
    allowZero: true,
    allowNegative: false,
    transform: true,
  })
  age?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 175,
    minimum: 0,
    maximum: 300,
  })
  @OptionalNumberValidation({
    fieldName: 'Height',
    min: 0,
    max: 300,
    allowZero: true,
    allowNegative: false,
    transform: true,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 70,
    minimum: 0,
    maximum: 500,
  })
  @OptionalNumberValidation({
    fieldName: 'Weight',
    min: 0,
    max: 500,
    allowZero: true,
    allowNegative: false,
    transform: true,
  })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Cellphone number',
    example: '09123456789',
    minLength: 10,
    maxLength: 15,
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Cellphone number',
    minLength: 10,
    maxLength: 15,
    pattern: /^[0-9+\-\s()]+$/,
    patternMessage:
      'Cellphone number can only contain numbers, plus signs, hyphens, spaces, and parentheses',
    sanitize: true,
  })
  cellphoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Telephone number',
    example: '02-1234567',
    minLength: 7,
    maxLength: 15,
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Telephone number',
    minLength: 7,
    maxLength: 15,
    pattern: /^[0-9+\-\s()]+$/,
    patternMessage:
      'Telephone number can only contain numbers, plus signs, hyphens, spaces, and parentheses',
    sanitize: true,
  })
  telephoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
    minLength: 1,
    maxLength: 255,
    pattern: '^[\\w\\-\\.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$',
  })
  @OptionalStringValidation({
    fieldName: 'Email',
    minLength: 1,
    maxLength: 255,
    pattern: /^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$/,
    patternMessage: 'Email must be a valid email address',
    sanitize: true,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'Home address street',
    example: '123 Main Street',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Home address street',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  homeAddressStreet: string;

  @ApiProperty({
    description: 'Home address city',
    example: 'Manila',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Home address city',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  homeAddressCity: string;

  @ApiProperty({
    description: 'Home address province',
    example: 'Metro Manila',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Home address province',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  homeAddressProvince: string;

  @ApiProperty({
    description: 'Home address zip code',
    example: '1000',
    minLength: 1,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @RequiredStringValidation({
    fieldName: 'Home address zip code',
    minLength: 1,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    sanitize: true,
  })
  homeAddressZipCode: string;

  @ApiPropertyOptional({
    description: 'Spouse birth date',
    example: '1992-03-20',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({
    message: 'Husband or wife birth date must be a valid date',
  })
  husbandOrWifeBirthDate?: Date;

  @ApiPropertyOptional({
    description: 'Father birth date',
    example: '1965-03-20',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'Fathers birth date must be a valid date' })
  fathersBirthDate?: Date;

  @ApiPropertyOptional({
    description: 'Mother birth date',
    example: '1968-07-15',
    type: 'string',
    format: 'date',
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'Mothers birth date must be a valid date' })
  mothersBirthDate?: Date;

  @ApiPropertyOptional({
    description: 'Present address street (if different from home address)',
    example: '456 Business Avenue',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Present address street',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Present address street can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  presentAddressStreet?: string;

  @ApiPropertyOptional({
    description: 'Present address barangay',
    example: 'Barangay 123',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Present address barangay',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Present address barangay can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  presentAddressBarangay?: string;

  @ApiPropertyOptional({
    description: 'Present address city (if different from home address)',
    example: 'Quezon City',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Present address city',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Present address city can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  presentAddressCity?: string;

  @ApiPropertyOptional({
    description: 'Present address province (if different from home address)',
    example: 'Metro Manila',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Present address province',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Present address province can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  presentAddressProvince?: string;

  @ApiPropertyOptional({
    description: 'Present address zip code (if different from home address)',
    example: '1100',
    minLength: 1,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Present address zip code',
    minLength: 1,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Present address zip code can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  presentAddressZipCode?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'Jane Doe',
    minLength: 1,
    maxLength: 255,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @OptionalStringValidation({
    fieldName: 'Emergency contact name',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Emergency contact name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone number',
    example: '09123456788',
    minLength: 10,
    maxLength: 15,
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Emergency contact number',
    minLength: 10,
    maxLength: 15,
    pattern: /^[0-9+\-\s()]+$/,
    patternMessage:
      'Emergency contact number can only contain numbers, plus signs, hyphens, spaces, and parentheses',
    sanitize: true,
  })
  emergencyContactNumber?: string;

  @ApiPropertyOptional({
    description: 'Relationship to emergency contact',
    example: 'Sister',
    minLength: 1,
    maxLength: 100,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @OptionalStringValidation({
    fieldName: 'Emergency contact relationship',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Emergency contact relationship can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  emergencyContactRelationship?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact address',
    example: '789 Emergency Street, Manila',
    minLength: 1,
    maxLength: 500,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Emergency contact address',
    minLength: 1,
    maxLength: 500,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Emergency contact address can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  emergencyContactAddress?: string;

  @ApiPropertyOptional({
    description: 'Spouse name',
    example: 'Jane Smith',
    minLength: 1,
    maxLength: 255,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @OptionalStringValidation({
    fieldName: 'Husband or wife name',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Husband or wife name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  husbandOrWifeName?: string;

  @ApiPropertyOptional({
    description: 'Spouse occupation',
    example: 'Teacher',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Husband or wife occupation',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Husband or wife occupation can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  husbandOrWifeOccupation?: string;

  @ApiPropertyOptional({
    description: 'Number of children',
    example: 0,
    minimum: 0,
    maximum: 50,
  })
  @OptionalNumberValidation({
    fieldName: 'Number of children',
    min: 0,
    max: 50,
    allowZero: true,
    allowNegative: false,
    transform: true,
  })
  numberOfChildren?: number;

  @ApiPropertyOptional({
    description: 'Father name',
    example: 'Robert Doe',
    minLength: 1,
    maxLength: 255,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @OptionalStringValidation({
    fieldName: 'Fathers name',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Fathers name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  fathersName?: string;

  @ApiPropertyOptional({
    description: 'Father occupation',
    example: 'Engineer',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Fathers occupation',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Fathers occupation can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  fathersOccupation?: string;

  @ApiPropertyOptional({
    description: 'Mother name',
    example: 'Maria Doe',
    minLength: 1,
    maxLength: 255,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @OptionalStringValidation({
    fieldName: 'Mothers name',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Mothers name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  mothersName?: string;

  @ApiPropertyOptional({
    description: 'Mother occupation',
    example: 'Teacher',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Mothers occupation',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Mothers occupation can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  mothersOccupation?: string;

  @ApiPropertyOptional({
    description: 'Bank account number',
    example: '1234567890',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Bank account number',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Bank account number can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Bank account holder name',
    example: 'John Michael Doe',
    minLength: 1,
    maxLength: 255,
    pattern: "^[a-zA-Z\\s\\-'.,]+$",
  })
  @OptionalStringValidation({
    fieldName: 'Bank account name',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    patternMessage:
      'Bank account name can only contain letters, spaces, hyphens, apostrophes, and periods',
    sanitize: true,
  })
  bankAccountName?: string;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'BDO',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Bank name',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Bank name can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Bank branch',
    example: 'Makati Branch',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-_&.,()]+$',
  })
  @OptionalStringValidation({
    fieldName: 'Bank branch',
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/,
    patternMessage:
      'Bank branch can only contain letters, numbers, spaces, and basic punctuation',
    sanitize: true,
  })
  bankBranch?: string;

  @ApiPropertyOptional({
    description: 'Annual salary in PHP',
    example: 0,
    minimum: 0,
  })
  @OptionalDecimalValidation({
    fieldName: 'Annual salary',
    min: 0,
    allowZero: true,
    allowNegative: false,
    transform: true,
    decimalPlaces: 2,
  })
  annualSalary?: number;

  @ApiPropertyOptional({
    description: 'Monthly salary in PHP',
    example: 0,
    minimum: 0,
  })
  @OptionalDecimalValidation({
    fieldName: 'Monthly salary',
    min: 0,
    allowZero: true,
    allowNegative: false,
    transform: true,
    decimalPlaces: 2,
  })
  monthlySalary?: number;

  @ApiPropertyOptional({
    description: 'Daily rate in PHP',
    example: 0,
    minimum: 0,
  })
  @OptionalDecimalValidation({
    fieldName: 'Daily rate',
    min: 0,
    allowZero: true,
    allowNegative: false,
    transform: true,
    decimalPlaces: 2,
  })
  dailyRate?: number;

  @ApiPropertyOptional({
    description: 'Hourly rate in PHP',
    example: 0,
    minimum: 0,
  })
  @OptionalDecimalValidation({
    fieldName: 'Hourly rate',
    min: 0,
    allowZero: true,
    allowNegative: false,
    transform: true,
    decimalPlaces: 2,
  })
  hourlyRate?: number;
}
