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
import { CreateBarangayDto } from '../dto/create-barangay.dto';
import { UpdateBarangayDto } from '../dto/update-barangay.dto';
import { CreateBarangayUseCase } from '@features/201-files/application/use-cases/barangay/create-barangay.use-case';
import { UpdateBarangayUseCase } from '@features/201-files/application/use-cases/barangay/update-barangay.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindBarangayPaginatedListUseCase } from '@features/201-files/application/use-cases/barangay/find-barangay-paginated-list.use-case';
import { RetrieveBarangayForComboboxUseCase } from '@features/201-files/application/use-cases/barangay/retrieve-barangay-for-combobox.use-case';
import { SoftDeleteBarangayUseCase } from '@features/201-files/application/use-cases/barangay/soft-delete-barangay.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Barangay')
@Controller(CONSTANTS_CONTROLLERS.BRANGAY)
export class BarangayController {
  constructor(
    private readonly createBarangayUseCase: CreateBarangayUseCase,
    private readonly updateBarangayUseCase: UpdateBarangayUseCase,
    private readonly findBarangayPaginatedListUseCase: FindBarangayPaginatedListUseCase,
    private readonly retrieveBarangayForComboboxUseCase: RetrieveBarangayForComboboxUseCase,
    private readonly softDeleteBarangayUseCase: SoftDeleteBarangayUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new barangay' })
  @ApiBody({ type: CreateBarangayDto })
  @ApiResponse({ status: 201, description: 'Barangay created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createBarangayDto: CreateBarangayDto,
    @Req() request: Request,
  ) {
    return this.createBarangayUseCase.execute(
      createBarangayDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of barangays' })
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
  @ApiResponse({ status: 200, description: 'Barangays retrieved successfully' })
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
    return await this.findBarangayPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update barangay information' })
  @ApiParam({ name: 'id', description: 'Barangay ID', example: 1 })
  @ApiBody({ type: UpdateBarangayDto })
  @ApiResponse({ status: 200, description: 'Barangay updated successfully' })
  @ApiResponse({ status: 404, description: 'Barangay not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBarangayDto: UpdateBarangayDto,
    @Req() request: Request,
  ) {
    return this.updateBarangayUseCase.execute(
      id,
      updateBarangayDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a barangay' })
  @ApiParam({ name: 'id', description: 'Barangay ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Barangay archived successfully' })
  @ApiResponse({ status: 404, description: 'Barangay not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteBarangayUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a barangay' })
  @ApiParam({ name: 'id', description: 'Barangay ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Barangay unarchived successfully' })
  @ApiResponse({ status: 404, description: 'Barangay not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteBarangayUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get barangays for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Barangays retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveBarangayForComboboxUseCase.execute();
  }
}
