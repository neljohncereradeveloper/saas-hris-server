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
import { CreateCitizenshipDto } from '../dto/create-citizenship.dto';
import { UpdateCitizenshipDto } from '../dto/update-citizenship.dto';
import { CreateCitizenshipUseCase } from '@features/201-files/application/use-cases/citizenship/create-citizenship.use-case';
import { UpdateCitizenshipUseCase } from '@features/201-files/application/use-cases/citizenship/update-citizenship.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindCitizenshipPaginatedListUseCase } from '@features/201-files/application/use-cases/citizenship/find-citizenship-paginated-list.use-case';
import { RetrieveCitizenshipForComboboxUseCase } from '@features/201-files/application/use-cases/citizenship/retrieve-citizenship-for-combobox.use-case';
import { SoftDeleteCitizenshipUseCase } from '@features/201-files/application/use-cases/citizenship/soft-delete-citizenship.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Citizenship')
@Controller(CONSTANTS_CONTROLLERS.CITIZENSHIP)
export class CitizenshipController {
  constructor(
    private readonly createCitizenshipUseCase: CreateCitizenshipUseCase,
    private readonly updateCitizenshipUseCase: UpdateCitizenshipUseCase,
    private readonly findCitizenshipPaginatedListUseCase: FindCitizenshipPaginatedListUseCase,
    private readonly retrieveCitizenshipForComboboxUseCase: RetrieveCitizenshipForComboboxUseCase,
    private readonly softDeleteCitizenshipUseCase: SoftDeleteCitizenshipUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new citizenship' })
  @ApiBody({ type: CreateCitizenshipDto })
  @ApiResponse({ status: 201, description: 'Citizenship created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createCitizenshipDto: CreateCitizenshipDto,
    @Req() request: Request,
  ) {
    return this.createCitizenshipUseCase.execute(
      createCitizenshipDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of citizenships' })
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
    description: 'Citizenships retrieved successfully',
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
    return await this.findCitizenshipPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update citizenship information' })
  @ApiParam({ name: 'id', description: 'Citizenship ID', example: 1 })
  @ApiBody({ type: UpdateCitizenshipDto })
  @ApiResponse({ status: 200, description: 'Citizenship updated successfully' })
  @ApiResponse({ status: 404, description: 'Citizenship not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCitizenshipDto: UpdateCitizenshipDto,
    @Req() request: Request,
  ) {
    return this.updateCitizenshipUseCase.execute(
      id,
      updateCitizenshipDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a citizenship' })
  @ApiParam({ name: 'id', description: 'Citizenship ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Citizenship archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Citizenship not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteCitizenshipUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a citizenship' })
  @ApiParam({ name: 'id', description: 'Citizenship ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Citizenship unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Citizenship not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteCitizenshipUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get citizenships for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Citizenships retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveCitizenshipForComboboxUseCase.execute();
  }
}
