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
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { CreateDepartmentUseCase } from '@features/201-files/application/use-cases/department/create-department.use-case';
import { UpdateDepartmentUseCase } from '@features/201-files/application/use-cases/department/update-department.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindDepartmentPaginatedListUseCase } from '@features/201-files/application/use-cases/department/find-department-paginated-list.use-case';
import { RetrieveDepartmentForComboboxUseCase } from '@features/201-files/application/use-cases/department/retrieve-department-for-combobox.use-case';
import { SoftDeleteDepartmentUseCase } from '@features/201-files/application/use-cases/department/soft-delete-department.use-case';

@ApiTags('201-Department')
@Controller(CONSTANTS_CONTROLLERS.DEPARTMENT)
export class DepartmentController {
  constructor(
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
    private readonly findDepartmentPaginatedListUseCase: FindDepartmentPaginatedListUseCase,
    private readonly retrieveDepartmentForComboboxUseCase: RetrieveDepartmentForComboboxUseCase,
    private readonly softDeleteDepartmentUseCase: SoftDeleteDepartmentUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Req() request: Request,
  ) {
    return this.createDepartmentUseCase.execute(
      createDepartmentDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of departments' })
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
    description: 'Departments retrieved successfully',
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
    return await this.findDepartmentPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update department information' })
  @ApiParam({ name: 'id', description: 'Department ID', example: 1 })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Req() request: Request,
  ) {
    return this.updateDepartmentUseCase.execute(
      id,
      updateDepartmentDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a department' })
  @ApiParam({ name: 'id', description: 'Department ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Department archived successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteDepartmentUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a department' })
  @ApiParam({ name: 'id', description: 'Department ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Department unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteDepartmentUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get departments for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveDepartmentForComboboxUseCase.execute();
  }
}
