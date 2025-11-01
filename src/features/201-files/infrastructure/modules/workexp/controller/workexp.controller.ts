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
import { CreateWorkExpDto } from '../dto/create-workexp.dto';
import { UpdateWorkExpDto } from '../dto/update-workexp.dto';
import { CreateWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/create-workexp.use-case';
import { UpdateWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/update-workexp.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEmployeesWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/find-employees-workexp.use-case';
import { SoftDeleteWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/soft-delete-workexp.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Work Experience')
@Controller(CONSTANTS_CONTROLLERS.WORKEXPERIENCE)
export class WorkExpController {
  constructor(
    private readonly createWorkExpUseCase: CreateWorkExpUseCase,
    private readonly updateWorkExpUseCase: UpdateWorkExpUseCase,
    private readonly findEmployeesWorkExpUseCase: FindEmployeesWorkExpUseCase,
    private readonly softDeleteWorkExpUseCase: SoftDeleteWorkExpUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new work experience record' })
  @ApiBody({ type: CreateWorkExpDto })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async create(
    @Body() createWorkExpDto: CreateWorkExpDto,
    @Req() request: Request,
  ) {
    return this.createWorkExpUseCase.execute(
      createWorkExpDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get work experience records for an employee' })
  @ApiQuery({ name: 'employeeId', description: 'Employee ID', example: 1 })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
  async findEmployeesWorkExp(@Query('employeeId') employeeId: string) {
    // Validate and parse query parameters
    const parsedEmployeeId = parseInt(employeeId, 10);
    return await this.findEmployeesWorkExpUseCase.execute(parsedEmployeeId);
  }

  @Version('1')
  @Put(':id')
  @ApiOperation({ summary: 'Update work experience information' })
  @ApiParam({ name: 'id', description: 'Work experience ID', example: 1 })
  @ApiBody({ type: UpdateWorkExpDto })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkExpDto: UpdateWorkExpDto,
    @Req() request: Request,
  ) {
    return this.updateWorkExpUseCase.execute(
      id,
      updateWorkExpDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1')
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a work experience record' })
  @ApiParam({ name: 'id', description: 'Work experience ID', example: 1 })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteWorkExpUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1')
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a work experience record' })
  @ApiParam({ name: 'id', description: 'Work experience ID', example: 1 })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteWorkExpUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }
}
