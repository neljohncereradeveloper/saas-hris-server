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
import { CreateReligionDto } from '../dto/create-religion.dto';
import { UpdateReligionDto } from '../dto/update-religion.dto';
import { CreateReligionUseCase } from '@features/201-files/application/use-cases/religion/create-religion.use-case';
import { UpdateReligionUseCase } from '@features/201-files/application/use-cases/religion/update-religion.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindReligionPaginatedListUseCase } from '@features/201-files/application/use-cases/religion/find-religion-paginated-list.use-case';
import { RetrieveReligionForComboboxUseCase } from '@features/201-files/application/use-cases/religion/retrieve-religion-for-combobox.use-case';
import { SoftDeleteReligionUseCase } from '@features/201-files/application/use-cases/religion/soft-delete-religion.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Religion')
@Controller(CONSTANTS_CONTROLLERS.RELIGION)
export class ReligionController {
  constructor(
    private readonly createReligionUseCase: CreateReligionUseCase,
    private readonly updateReligionUseCase: UpdateReligionUseCase,
    private readonly findReligionPaginatedListUseCase: FindReligionPaginatedListUseCase,
    private readonly retrieveReligionForComboboxUseCase: RetrieveReligionForComboboxUseCase,
    private readonly softDeleteReligionUseCase: SoftDeleteReligionUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new religion' })
  @ApiBody({ type: CreateReligionDto })
  @ApiResponse({ status: 201, description: 'Religion created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createReligionDto: CreateReligionDto,
    @Req() request: Request,
  ) {
    return this.createReligionUseCase.execute(
      createReligionDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of religions' })
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
  @ApiResponse({ status: 200, description: 'Religions retrieved successfully' })
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
    return await this.findReligionPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update religion information' })
  @ApiParam({ name: 'id', description: 'Religion ID', example: 1 })
  @ApiBody({ type: UpdateReligionDto })
  @ApiResponse({ status: 200, description: 'Religion updated successfully' })
  @ApiResponse({ status: 404, description: 'Religion not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReligionDto: UpdateReligionDto,
    @Req() request: Request,
  ) {
    return this.updateReligionUseCase.execute(
      id,
      updateReligionDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a religion' })
  @ApiParam({ name: 'id', description: 'Religion ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Religion archived successfully' })
  @ApiResponse({ status: 404, description: 'Religion not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteReligionUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a religion' })
  @ApiParam({ name: 'id', description: 'Religion ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Religion unarchived successfully' })
  @ApiResponse({ status: 404, description: 'Religion not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteReligionUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get religions for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Religions retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveReligionForComboboxUseCase.execute();
  }
}
