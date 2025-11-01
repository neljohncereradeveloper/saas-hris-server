import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Put,
  Delete,
  Param,
  Query,
  Get,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateReferenceDto } from '../dto/create-reference.dto';
import { UpdateReferenceDto } from '../dto/update-reference.dto';
import { CreateReferenceUseCase } from '@features/201-files/application/use-cases/reference/create-reference.use-case';
import { UpdateReferenceUseCase } from '@features/201-files/application/use-cases/reference/update-reference.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEmployeesReferenceUseCase } from '@features/201-files/application/use-cases/reference/find-employees-reference.use-case';
import { SoftDeleteReferenceUseCase } from '@features/201-files/application/use-cases/reference/soft-delete-reference.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
@ApiTags('201-Reference')
@Controller(CONSTANTS_CONTROLLERS.REFERENCE)
export class ReferenceController {
  constructor(
    private readonly createReferenceUseCase: CreateReferenceUseCase,
    private readonly updateReferenceUseCase: UpdateReferenceUseCase,
    private readonly findEmployeesReferenceUseCase: FindEmployeesReferenceUseCase,
    private readonly softDeleteReferenceUseCase: SoftDeleteReferenceUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new reference' })
  @ApiBody({ type: CreateReferenceDto })
  @ApiResponse({ status: 201, description: 'Reference created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createReferenceDto: CreateReferenceDto,
    @Req() request: Request,
  ) {
    return this.createReferenceUseCase.execute(
      createReferenceDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get references by employee ID' })
  @ApiQuery({
    name: 'employeeId',
    description: 'Employee ID to get references for',
    example: 1,
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'References retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid employee ID',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findEmployeesReference(@Query('employeeId') employeeId: string) {
    // Validate and parse query parameters
    const parsedEmployeeId = parseInt(employeeId, 10);
    return await this.findEmployeesReferenceUseCase.execute(parsedEmployeeId);
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update reference information' })
  @ApiParam({ name: 'id', description: 'Reference ID', example: 1 })
  @ApiBody({ type: UpdateReferenceDto })
  @ApiResponse({ status: 200, description: 'Reference updated successfully' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReferenceDto: UpdateReferenceDto,
    @Req() request: Request,
  ) {
    return this.updateReferenceUseCase.execute(
      id,
      updateReferenceDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a reference' })
  @ApiParam({ name: 'id', description: 'Reference ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Reference archived successfully' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteReferenceUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a reference' })
  @ApiParam({ name: 'id', description: 'Reference ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Reference unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteReferenceUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }
}
