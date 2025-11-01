import { CreateEmployeeMovementTypeUseCase } from '@features/201-files/application/use-cases/employee-movement-type/employee-movement-type.use-case';
import { UpdateEmployeeMovementTypeUseCase } from '@features/201-files/application/use-cases/employee-movement-type/update-employee-movement-type.use-case';
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEmployeeMovementTypePaginatedListUseCase } from '@features/201-files/application/use-cases/employee-movement-type/find-employee-movement-type-paginated-list.use-case';
import { RetrieveEmployeeMovementTypeForComboboxUseCase } from '@features/201-files/application/use-cases/employee-movement-type/retrieve-employee-movement-type-for-combobox.use-case';
import { SoftDeleteEmployeeMovementTypeUseCase } from '@features/201-files/application/use-cases/employee-movement-type/soft-delete-employee-movement-type.use-case';
import { CreateEmployeeMovementTypeDto } from '../dto/create-employee-movement-type.dto';
import { UpdateEmployeeMovementTypeDto } from '../dto/update-employee-movement-type.dto';

@ApiTags('201-Employee Movement Type')
@Controller(CONSTANTS_CONTROLLERS.EMPLOYEE_MOVEMENT_TYPE)
export class EmployeeMovementTypeController {
  constructor(
    private readonly createEmployeeMovementTypeUseCase: CreateEmployeeMovementTypeUseCase,
    private readonly updateEmployeeMovementTypeUseCase: UpdateEmployeeMovementTypeUseCase,
    private readonly findEmployeeMovementTypePaginatedListUseCase: FindEmployeeMovementTypePaginatedListUseCase,
    private readonly retrieveEmployeeMovementTypeForComboboxUseCase: RetrieveEmployeeMovementTypeForComboboxUseCase,
    private readonly softDeleteEmployeeMovementTypeUseCase: SoftDeleteEmployeeMovementTypeUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new employee movement type' })
  @ApiBody({ type: CreateEmployeeMovementTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Employee Movement Type created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createEmployeeMovementTypeDto: CreateEmployeeMovementTypeDto,
    @Req() request: Request,
  ) {
    return this.createEmployeeMovementTypeUseCase.execute(
      createEmployeeMovementTypeDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of employee movement types' })
  @ApiQuery({ name: 'term', required: false, description: 'Search term' })
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
  @ApiResponse({
    status: 200,
    description: 'Employee Movement Types retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findPaginatedList(
    @Query('term') term: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    // Validate and parse query parameters
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    return await this.findEmployeeMovementTypePaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update employee movement type information' })
  @ApiParam({
    name: 'id',
    description: 'Employee Movement Type ID',
    example: 1,
  })
  @ApiBody({ type: UpdateEmployeeMovementTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Employee Movement Type updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee Movement Type not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeMovementTypeDto: UpdateEmployeeMovementTypeDto,
    @Req() request: Request,
  ) {
    return this.updateEmployeeMovementTypeUseCase.execute(
      id,
      updateEmployeeMovementTypeDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a employee movement type' })
  @ApiParam({
    name: 'id',
    description: 'Employee Movement Type ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Employee Movement Type archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee Movement Type not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEmployeeMovementTypeUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a employee movement type' })
  @ApiParam({
    name: 'id',
    description: 'Employee Movement Type ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Employee Movement Type unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee Movement Type not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEmployeeMovementTypeUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({
    summary: 'Get employee movement types for combobox dropdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee Movement Types retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveEmployeeMovementTypeForComboboxUseCase.execute();
  }
}
