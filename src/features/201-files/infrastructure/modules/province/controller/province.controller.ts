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
import { CreateProvinceDto } from '../dto/create-province.dto';
import { UpdateProvinceDto } from '../dto/update-province.dto';
import { CreateProvinceUseCase } from '@features/201-files/application/use-cases/province/create-province.use-case';
import { UpdateProvinceUseCase } from '@features/201-files/application/use-cases/province/update-province.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindProvincePaginatedListUseCase } from '@features/201-files/application/use-cases/province/find-province-paginated-list.use-case';
import { RetrieveProvinceForComboboxUseCase } from '@features/201-files/application/use-cases/province/retrieve-province-for-combobox.use-case';
import { SoftDeleteProvinceUseCase } from '@features/201-files/application/use-cases/province/soft-delete-province.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Province')
@Controller(CONSTANTS_CONTROLLERS.PROVINCE)
export class ProvinceController {
  constructor(
    private readonly createProvinceUseCase: CreateProvinceUseCase,
    private readonly updateProvinceUseCase: UpdateProvinceUseCase,
    private readonly findProvincePaginatedListUseCase: FindProvincePaginatedListUseCase,
    private readonly retrieveProvinceForComboboxUseCase: RetrieveProvinceForComboboxUseCase,
    private readonly softDeleteProvinceUseCase: SoftDeleteProvinceUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new province' })
  @ApiBody({ type: CreateProvinceDto })
  @ApiResponse({ status: 201, description: 'Province created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createProvinceDto: CreateProvinceDto,
    @Req() request: Request,
  ) {
    return this.createProvinceUseCase.execute(
      createProvinceDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of provinces' })
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
  @ApiResponse({ status: 200, description: 'Provinces retrieved successfully' })
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
    return await this.findProvincePaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update province information' })
  @ApiParam({ name: 'id', description: 'Province ID', example: 1 })
  @ApiBody({ type: UpdateProvinceDto })
  @ApiResponse({ status: 200, description: 'Province updated successfully' })
  @ApiResponse({ status: 404, description: 'Province not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProvinceDto: UpdateProvinceDto,
    @Req() request: Request,
  ) {
    return this.updateProvinceUseCase.execute(
      id,
      updateProvinceDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a province' })
  @ApiParam({ name: 'id', description: 'Province ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Province archived successfully' })
  @ApiResponse({ status: 404, description: 'Province not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteProvinceUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a province' })
  @ApiParam({ name: 'id', description: 'Province ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Province unarchived successfully' })
  @ApiResponse({ status: 404, description: 'Province not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteProvinceUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get provinces for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Provinces retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveProvinceForComboboxUseCase.execute();
  }
}
