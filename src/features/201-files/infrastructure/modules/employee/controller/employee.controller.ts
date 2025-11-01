import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Put,
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
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { UpdateGovernmentDetailsDto } from '../dto/update-government-details.dto';
import { QueryEmployeeDto } from '../dto/query-employee.dto';
import { CreateEmployeeUseCase } from '@features/201-files/application/use-cases/employee/create-employee.use-case';
import { UpdateEmployeeUseCase } from '@features/201-files/application/use-cases/employee/update-employee.use-case';
import { UpdateGovernmentDetailsUseCase } from '@features/201-files/application/use-cases/employee/update-government-details.use-case';
import { FindEmployeeByIdUseCase } from '@features/201-files/application/use-cases/employee/find-employee-by-id.use-case';
import { FindWithPaginatedListEmployeeUseCase } from '@features/201-files/application/use-cases/employee/find-with-paginated-list-employee.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';

@ApiTags('201-Employee')
@Controller(CONSTANTS_CONTROLLERS.EMPLOYEE)
export class EmployeeController {
  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly updateEmployeeUseCase: UpdateEmployeeUseCase,
    private readonly updateGovernmentDetailsUseCase: UpdateGovernmentDetailsUseCase,
    private readonly findEmployeeByIdUseCase: FindEmployeeByIdUseCase,
    private readonly findWithPaginatedListEmployeeUseCase: FindWithPaginatedListEmployeeUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() request: Request,
  ) {
    return this.createEmployeeUseCase.execute(
      createEmployeeDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of employees' })
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
  @ApiQuery({
    name: 'employeeStatus',
    required: false,
    description: 'Filter by employee status',
    type: [String],
  })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findPaginatedList(@Query() queryDto: QueryEmployeeDto) {
    // Parse numeric values with defaults
    const page = parseInt(queryDto.page || '1', 10);
    const limit = parseInt(queryDto.limit || '10', 10);

    console.log(queryDto.employeeStatus);

    return await this.findWithPaginatedListEmployeeUseCase.execute(
      queryDto.term || '',
      page,
      limit,
      queryDto.employeeStatus || [],
    );
  }

  @Version('1') // API versioning
  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.findEmployeeByIdUseCase.execute(
      id,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update employee information' })
  @ApiParam({ name: 'id', description: 'Employee ID', example: 1 })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() request: Request,
  ) {
    return this.updateEmployeeUseCase.execute(
      id,
      updateEmployeeDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Put(':id/government-details')
  @ApiOperation({ summary: 'Update employee government details' })
  @ApiParam({ name: 'id', description: 'Employee ID', example: 1 })
  @ApiBody({ type: UpdateGovernmentDetailsDto })
  @ApiResponse({
    status: 200,
    description: 'Government details updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async updateGovernmentDetails(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGovernmentDetailsDto: UpdateGovernmentDetailsDto,
    @Req() request: Request,
  ) {
    return this.updateGovernmentDetailsUseCase.execute(
      id,
      updateGovernmentDetailsDto,
      (request as any).user?.id || 'system',
    );
  }

  // @Version('1') // API versioning
  // @Post(':id/upload-image')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadImage(
  //   @Param('id', ParseIntPipe) id: number,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() request: Request,
  // ) {
  //   return this.uploadEmployeeImageUseCase.execute(
  //     id,
  //     file,
  //     (request as any).user?.id,
  //   );
  // }
}
