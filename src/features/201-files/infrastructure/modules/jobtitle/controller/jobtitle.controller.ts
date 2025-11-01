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
import { CreateJobTitleDto } from '../dto/create-jobtitle.dto';
import { UpdateJobTitleDto } from '../dto/update-jobtitle.dto';
import { CreateJobTitleUseCase } from '@features/201-files/application/use-cases/jobtitle/create-jobtitle.use-case';
import { UpdateJobTitleUseCase } from '@features/201-files/application/use-cases/jobtitle/update-jobtitle.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindJobTitlePaginatedListUseCase } from '@features/201-files/application/use-cases/jobtitle/find-jobtitle-paginated-list.use-case';
import { RetrieveJobTitleForComboboxUseCase } from '@features/201-files/application/use-cases/jobtitle/retrieve-jobtitle-for-combobox.use-case';
import { SoftDeleteJobTitleUseCase } from '@features/201-files/application/use-cases/jobtitle/soft-delete-jobtitle.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Job Title')
@Controller(CONSTANTS_CONTROLLERS.JOBTITLE)
export class JobTitleController {
  constructor(
    private readonly createJobTitleUseCase: CreateJobTitleUseCase,
    private readonly updateJobTitleUseCase: UpdateJobTitleUseCase,
    private readonly findJobTitlePaginatedListUseCase: FindJobTitlePaginatedListUseCase,
    private readonly retrieveJobTitleForComboboxUseCase: RetrieveJobTitleForComboboxUseCase,
    private readonly softDeleteJobTitleUseCase: SoftDeleteJobTitleUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new jobtitle' })
  @ApiBody({ type: CreateJobTitleDto })
  @ApiResponse({ status: 201, description: 'Jobtitle created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createJobTitleDto: CreateJobTitleDto,
    @Req() request: Request,
  ) {
    return this.createJobTitleUseCase.execute(
      createJobTitleDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of jobtitles' })
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
  @ApiResponse({ status: 200, description: 'Jobtitles retrieved successfully' })
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
    return await this.findJobTitlePaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update jobtitle information' })
  @ApiParam({ name: 'id', description: 'Jobtitle ID', example: 1 })
  @ApiBody({ type: UpdateJobTitleDto })
  @ApiResponse({ status: 200, description: 'Jobtitle updated successfully' })
  @ApiResponse({ status: 404, description: 'Jobtitle not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobTitleDto: UpdateJobTitleDto,
    @Req() request: Request,
  ) {
    return this.updateJobTitleUseCase.execute(
      id,
      updateJobTitleDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a jobtitle' })
  @ApiParam({ name: 'id', description: 'Jobtitle ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Jobtitle archived successfully' })
  @ApiResponse({ status: 404, description: 'Jobtitle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteJobTitleUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a jobtitle' })
  @ApiParam({ name: 'id', description: 'Jobtitle ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Jobtitle unarchived successfully' })
  @ApiResponse({ status: 404, description: 'Jobtitle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteJobTitleUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get jobtitles for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Jobtitles retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveJobTitleForComboboxUseCase.execute();
  }
}
