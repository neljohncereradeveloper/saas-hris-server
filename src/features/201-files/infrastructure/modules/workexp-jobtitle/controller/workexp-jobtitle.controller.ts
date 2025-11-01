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
import { CreateWorkExpJobTitleDto } from '../dto/create-workexp-jobtitle.dto';
import { UpdateWorkExpJobTitleDto } from '../dto/update-workexp-jobtitle.dto';
import { CreateWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/create-workexp-jobtitle.use-case';
import { UpdateWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/update-workexp-jobtitle.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindWorkExpJobTitlePaginatedListUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/find-workexp-jobtitle-paginated-list.use-case';
import { RetrieveWorkExpJobTitleForComboboxUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/retrieve-workexp-jobtitle-for-combobox.use-case';
import { SoftDeleteWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/soft-delete-workexp-jobtitle.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('201-Work Experience Job Title')
@Controller(CONSTANTS_CONTROLLERS.WORKJOBTITLE)
export class WorkExpJobTitleController {
  constructor(
    private readonly createWorkExpJobTitleUseCase: CreateWorkExpJobTitleUseCase,
    private readonly updateWorkExpJobTitleUseCase: UpdateWorkExpJobTitleUseCase,
    private readonly findWorkExpJobTitlePaginatedListUseCase: FindWorkExpJobTitlePaginatedListUseCase,
    private readonly retrieveWorkExpJobTitleForComboboxUseCase: RetrieveWorkExpJobTitleForComboboxUseCase,
    private readonly softDeleteWorkExpJobTitleUseCase: SoftDeleteWorkExpJobTitleUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new workexp-jobtitle' })
  @ApiBody({ type: CreateWorkExpJobTitleDto })
  @ApiResponse({
    status: 201,
    description: 'Workexp-jobtitle created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createWorkExpJobTitleDto: CreateWorkExpJobTitleDto,
    @Req() request: Request,
  ) {
    return this.createWorkExpJobTitleUseCase.execute(
      createWorkExpJobTitleDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of workexp-jobtitles' })
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
    description: 'Workexp-jobtitles retrieved successfully',
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
    return await this.findWorkExpJobTitlePaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update workexp-jobtitle information' })
  @ApiParam({ name: 'id', description: 'Workexp-jobtitle ID', example: 1 })
  @ApiBody({ type: UpdateWorkExpJobTitleDto })
  @ApiResponse({
    status: 200,
    description: 'Workexp-jobtitle updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Workexp-jobtitle not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkExpJobTitleDto: UpdateWorkExpJobTitleDto,
    @Req() request: Request,
  ) {
    return this.updateWorkExpJobTitleUseCase.execute(
      id,
      updateWorkExpJobTitleDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a workexp-jobtitle' })
  @ApiParam({ name: 'id', description: 'Workexp-jobtitle ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Workexp-jobtitle archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Workexp-jobtitle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteWorkExpJobTitleUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a workexp-jobtitle' })
  @ApiParam({ name: 'id', description: 'Workexp-jobtitle ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Workexp-jobtitle unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Workexp-jobtitle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteWorkExpJobTitleUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get workexp-jobtitles for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Workexp-jobtitles retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveWorkExpJobTitleForComboboxUseCase.execute();
  }
}
