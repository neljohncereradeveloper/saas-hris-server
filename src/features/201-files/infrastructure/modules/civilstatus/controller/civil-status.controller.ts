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
import { CreateCivilStatusDto } from '../dto/create-civil-status.dto';
import { UpdateCivilStatusDto } from '../dto/update-civil-status.dto';
import { CreateCivilStatusUseCase } from '@features/201-files/application/use-cases/civilstatus/create-civil-status.use-case';
import { UpdateCivilStatusUseCase } from '@features/201-files/application/use-cases/civilstatus/update-civil-status.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindCivilStatusPaginatedListUseCase } from '@features/201-files/application/use-cases/civilstatus/find-civil-status-paginated-list.use-case';
import { RetrieveCivilStatusForComboboxUseCase } from '@features/201-files/application/use-cases/civilstatus/retrieve-civil-status-for-combobox.use-case';
import { SoftDeleteCivilStatusUseCase } from '@features/201-files/application/use-cases/civilstatus/soft-delete-civil-status.use-case';

@ApiTags('201-Civil Status')
@Controller(CONSTANTS_CONTROLLERS.CIVILSTATUS)
export class CivilStatusController {
  constructor(
    private readonly createCivilStatusUseCase: CreateCivilStatusUseCase,
    private readonly updateCivilStatusUseCase: UpdateCivilStatusUseCase,
    private readonly findCivilStatusPaginatedListUseCase: FindCivilStatusPaginatedListUseCase,
    private readonly retrieveCivilStatusForComboboxUseCase: RetrieveCivilStatusForComboboxUseCase,
    private readonly softDeleteCivilStatusUseCase: SoftDeleteCivilStatusUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new civil status' })
  @ApiBody({ type: CreateCivilStatusDto })
  @ApiResponse({
    status: 201,
    description: 'Civil Status created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createCivilStatusDto: CreateCivilStatusDto,
    @Req() request: Request,
  ) {
    return this.createCivilStatusUseCase.execute(
      createCivilStatusDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of civil statuses' })
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
    description: 'Civil Statuses retrieved successfully',
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
    return await this.findCivilStatusPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update civil status information' })
  @ApiParam({ name: 'id', description: 'Civil Status ID', example: 1 })
  @ApiBody({ type: UpdateCivilStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Civil Status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Civil Status not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCivilStatusDto: UpdateCivilStatusDto,
    @Req() request: Request,
  ) {
    return this.updateCivilStatusUseCase.execute(
      id,
      updateCivilStatusDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a civil status' })
  @ApiParam({ name: 'id', description: 'Civil Status ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Civil Status archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Civil Status not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteCivilStatusUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a civil status' })
  @ApiParam({ name: 'id', description: 'Civil Status ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Civil Status unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Civil Status not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteCivilStatusUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get civil statuses for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Civil Statuses retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveCivilStatusForComboboxUseCase.execute();
  }
}
