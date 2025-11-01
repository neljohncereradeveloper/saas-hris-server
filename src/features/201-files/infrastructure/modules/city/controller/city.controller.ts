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
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { CreateCityUseCase } from '@features/201-files/application/use-cases/city/create-city.use-case';
import { UpdateCityUseCase } from '@features/201-files/application/use-cases/city/update-city.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindCityPaginatedListUseCase } from '@features/201-files/application/use-cases/city/find-city-paginated-list.use-case';
import { RetrieveCityForComboboxUseCase } from '@features/201-files/application/use-cases/city/retrieve-city-for-combobox.use-case';
import { SoftDeleteCityUseCase } from '@features/201-files/application/use-cases/city/soft-delete-city.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-City')
@Controller(CONSTANTS_CONTROLLERS.CITY)
export class CityController {
  constructor(
    private readonly createCityUseCase: CreateCityUseCase,
    private readonly updateCityUseCase: UpdateCityUseCase,
    private readonly findCityPaginatedListUseCase: FindCityPaginatedListUseCase,
    private readonly retrieveCityForComboboxUseCase: RetrieveCityForComboboxUseCase,
    private readonly softDeleteCityUseCase: SoftDeleteCityUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new city' })
  @ApiBody({ type: CreateCityDto })
  @ApiResponse({ status: 201, description: 'City created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createCityDto: CreateCityDto, @Req() request: Request) {
    return this.createCityUseCase.execute(
      createCityDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of citys' })
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
  @ApiResponse({ status: 200, description: 'Citys retrieved successfully' })
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
    return await this.findCityPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update city information' })
  @ApiParam({ name: 'id', description: 'City ID', example: 1 })
  @ApiBody({ type: UpdateCityDto })
  @ApiResponse({ status: 200, description: 'City updated successfully' })
  @ApiResponse({ status: 404, description: 'City not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityDto: UpdateCityDto,
    @Req() request: Request,
  ) {
    return this.updateCityUseCase.execute(
      id,
      updateCityDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a city' })
  @ApiParam({ name: 'id', description: 'City ID', example: 1 })
  @ApiResponse({ status: 200, description: 'City archived successfully' })
  @ApiResponse({ status: 404, description: 'City not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteCityUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a city' })
  @ApiParam({ name: 'id', description: 'City ID', example: 1 })
  @ApiResponse({ status: 200, description: 'City unarchived successfully' })
  @ApiResponse({ status: 404, description: 'City not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteCityUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get citys for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Citys retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveCityForComboboxUseCase.execute();
  }
}
