import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Param,
  Query,
  Get,
  Req,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CreateEmployeeMovementDto } from '../dto/create-employee-movement.dto';
import { UpdateEmployeeMovementDto } from '../dto/update-employee-movement.dto';
import { QueryEmployeeMovementDto } from '../dto/query-employee-movement.dto';
import { CreateEmployeeMovementUseCase } from '@features/201-files/application/use-cases/employee-movement/create-employee-movement.use-case';
import { UpdateEmployeeMovementUseCase } from '@features/201-files/application/use-cases/employee-movement/update-employee-movement.use-case';
import { FindEmployeeMovementsByEmployeeUseCase } from '@features/201-files/application/use-cases/employee-movement/find-employee-movements-by-employee.use-case';
import { FindWithPaginatedListEmployeeMovementUseCase } from '@features/201-files/application/use-cases/employee-movement/find-with-paginated-list-employee-movement.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { SoftDeleteEmployeeMovementUseCase } from '@features/201-files/application/use-cases/employee-movement/soft-delete-employee-movement.use-case';

@ApiTags('201-Employee Movement')
@Controller(CONSTANTS_CONTROLLERS.EMPLOYEE_MOVEMENT)
export class EmployeeMovementController {
  constructor(
    private readonly createEmployeeMovementUseCase: CreateEmployeeMovementUseCase,
    private readonly updateEmployeeMovementUseCase: UpdateEmployeeMovementUseCase,
    private readonly findEmployeeMovementsByEmployeeUseCase: FindEmployeeMovementsByEmployeeUseCase,
    private readonly findWithPaginatedListEmployeeMovementUseCase: FindWithPaginatedListEmployeeMovementUseCase,
    private readonly softDeleteEmployeeMovementUseCase: SoftDeleteEmployeeMovementUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new employee movement' })
  @ApiBody({ type: CreateEmployeeMovementDto })
  @ApiResponse({
    status: 201,
    description: 'Employee movement created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createEmployeeMovementDto: CreateEmployeeMovementDto,
    @Req() request: Request,
  ) {
    return this.createEmployeeMovementUseCase.execute(
      createEmployeeMovementDto,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).sessionId,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1')
  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee movement' })
  @ApiParam({ name: 'id', description: 'Employee movement ID', example: 1 })
  @ApiBody({ type: UpdateEmployeeMovementDto })
  @ApiResponse({
    status: 200,
    description: 'Employee movement updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Employee movement not found' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeMovementDto: UpdateEmployeeMovementDto,
    @Req() request: Request,
  ) {
    return this.updateEmployeeMovementUseCase.execute(
      id,
      updateEmployeeMovementDto,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).sessionId,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a employee movement' })
  @ApiParam({ name: 'id', description: 'Employee movement ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Employee movement archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee movement not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEmployeeMovementUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a employee movement' })
  @ApiParam({ name: 'id', description: 'Employee movement ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Employee movement unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee movement not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEmployeeMovementUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1')
  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get all movements for a specific employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Employee movements retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findByEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Req() request: Request,
  ) {
    return this.findEmployeeMovementsByEmployeeUseCase.execute(
      employeeId,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).sessionId,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get paginated list of employee movements' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: '10',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'movementType',
    required: false,
    description: 'Filter by movement type',
  })
  @ApiQuery({
    name: 'effectiveDateFrom',
    required: false,
    description: 'Filter from date',
  })
  @ApiQuery({
    name: 'effectiveDateTo',
    required: false,
    description: 'Filter to date',
  })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Employee movements retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findWithPagination(
    @Query() queryDto: QueryEmployeeMovementDto,
    @Req() request: Request,
  ) {
    return this.findWithPaginatedListEmployeeMovementUseCase.execute(
      queryDto.page || 1,
      queryDto.limit || 10,
      {
        employeeId: queryDto.employeeId,
        movementType: queryDto.movementType,
        effectiveDateFrom: queryDto.effectiveDateFrom,
        effectiveDateTo: queryDto.effectiveDateTo,
        searchTerm: queryDto.searchTerm,
      },
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).sessionId,
        username: (request as any).user?.username,
      },
    );
  }
}
