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
import { CreateWorkExpCompanyDto } from '../dto/create-workexp-company.dto';
import { UpdateWorkExpCompanyDto } from '../dto/update-workexp-company.dto';
import { CreateWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/create-workexp-company.use-case';
import { UpdateWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/update-workexp-company.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindWorkExpCompanyPaginatedListUseCase } from '@features/201-files/application/use-cases/workexp-company/find-workexp-company-paginated-list.use-case';
import { RetrieveWorkExpCompanyForComboboxUseCase } from '@features/201-files/application/use-cases/workexp-company/retrieve-workexp-company-for-combobox.use-case';
import { SoftDeleteWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/soft-delete-workexp-company.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Work Experience Company')
@Controller(CONSTANTS_CONTROLLERS.WORKCOMPANY)
export class WorkExpCompanyController {
  constructor(
    private readonly createWorkExpCompanyUseCase: CreateWorkExpCompanyUseCase,
    private readonly updateWorkExpCompanyUseCase: UpdateWorkExpCompanyUseCase,
    private readonly findWorkExpCompanyPaginatedListUseCase: FindWorkExpCompanyPaginatedListUseCase,
    private readonly retrieveWorkExpCompanyForComboboxUseCase: RetrieveWorkExpCompanyForComboboxUseCase,
    private readonly softDeleteWorkExpCompanyUseCase: SoftDeleteWorkExpCompanyUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new workexp-company' })
  @ApiBody({ type: CreateWorkExpCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Workexp-company created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createWorkExpCompanyDto: CreateWorkExpCompanyDto,
    @Req() request: Request,
  ) {
    return this.createWorkExpCompanyUseCase.execute(
      createWorkExpCompanyDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of workexp-companys' })
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
    description: 'Workexp-companys retrieved successfully',
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
    return await this.findWorkExpCompanyPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update workexp-company information' })
  @ApiParam({ name: 'id', description: 'Workexp-company ID', example: 1 })
  @ApiBody({ type: UpdateWorkExpCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Workexp-company updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Workexp-company not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkExpCompanyDto: UpdateWorkExpCompanyDto,
    @Req() request: Request,
  ) {
    return this.updateWorkExpCompanyUseCase.execute(
      id,
      updateWorkExpCompanyDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a workexp-company' })
  @ApiParam({ name: 'id', description: 'Workexp-company ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Workexp-company archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Workexp-company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteWorkExpCompanyUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a workexp-company' })
  @ApiParam({ name: 'id', description: 'Workexp-company ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Workexp-company unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Workexp-company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteWorkExpCompanyUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get workexp-companys for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Workexp-companys retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveWorkExpCompanyForComboboxUseCase.execute();
  }
}
