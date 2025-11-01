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
import { CreateEduLevelDto } from '../dto/create-edu-level.dto';
import { UpdateEduLevelDto } from '../dto/update-edu-level.dto';
import { CreateEduLevelUseCase } from '@features/201-files/application/use-cases/edu-level/create-edu-level.use-case';
import { UpdateEduLevelUseCase } from '@features/201-files/application/use-cases/edu-level/update-edu-level.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEduLevelPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-level/find-edu-level-paginated-list.use-case';
import { RetrieveEduLevelForComboboxUseCase } from '@features/201-files/application/use-cases/edu-level/retrieve-edu-level-for-combobox.use-case';
import { SoftDeleteEduLevelUseCase } from '@features/201-files/application/use-cases/edu-level/soft-delete-edu-level.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Education Level')
@Controller(CONSTANTS_CONTROLLERS.EDULEVEL)
export class EduLevelController {
  constructor(
    private readonly createEduLevelUseCase: CreateEduLevelUseCase,
    private readonly updateEduLevelUseCase: UpdateEduLevelUseCase,
    private readonly findEduLevelPaginatedListUseCase: FindEduLevelPaginatedListUseCase,
    private readonly retrieveEduLevelForComboboxUseCase: RetrieveEduLevelForComboboxUseCase,
    private readonly softDeleteEduLevelUseCase: SoftDeleteEduLevelUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new edu-level' })
  @ApiBody({ type: CreateEduLevelDto })
  @ApiResponse({ status: 201, description: 'Edu-level created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createEduLevelDto: CreateEduLevelDto,
    @Req() request: Request,
  ) {
    return this.createEduLevelUseCase.execute(
      createEduLevelDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of edu-levels' })
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
    description: 'Edu-levels retrieved successfully',
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
    return await this.findEduLevelPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update edu-level information' })
  @ApiParam({ name: 'id', description: 'Edu-level ID', example: 1 })
  @ApiBody({ type: UpdateEduLevelDto })
  @ApiResponse({ status: 200, description: 'Edu-level updated successfully' })
  @ApiResponse({ status: 404, description: 'Edu-level not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEduLevelDto: UpdateEduLevelDto,
    @Req() request: Request,
  ) {
    return this.updateEduLevelUseCase.execute(
      id,
      updateEduLevelDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a edu-level' })
  @ApiParam({ name: 'id', description: 'Edu-level ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Edu-level archived successfully' })
  @ApiResponse({ status: 404, description: 'Edu-level not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduLevelUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a edu-level' })
  @ApiParam({ name: 'id', description: 'Edu-level ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Edu-level unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Edu-level not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduLevelUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get edu-levels for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Edu-levels retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveEduLevelForComboboxUseCase.execute();
  }
}
