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
import { CreateEduCourseLevelDto } from '../dto/create-edu-courselevel.dto';
import { UpdateEduCourseLevelDto } from '../dto/update-edu-courselevel.dto';
import { CreateEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/create-edu-courselevel.use-case';
import { UpdateEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/update-edu-courselevel.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEduCourseLevelPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-courselevel/find-edu-courselevel-paginated-list.use-case';
import { RetrieveEduCourseLevelForComboboxUseCase } from '@features/201-files/application/use-cases/edu-courselevel/retrieve-edu-courselevel-for-combobox.use-case';
import { SoftDeleteEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/soft-delete-edu-courselevel.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('201-Education Course Level')
@Controller(CONSTANTS_CONTROLLERS.EDUCOURSELEVEL)
export class EduCourseLevelController {
  constructor(
    private readonly createEduCourseLevelUseCase: CreateEduCourseLevelUseCase,
    private readonly updateEduCourseLevelUseCase: UpdateEduCourseLevelUseCase,
    private readonly findEduCourseLevelPaginatedListUseCase: FindEduCourseLevelPaginatedListUseCase,
    private readonly retrieveEduCourseLevelForComboboxUseCase: RetrieveEduCourseLevelForComboboxUseCase,
    private readonly softDeleteEduCourseLevelUseCase: SoftDeleteEduCourseLevelUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new edu-courselevel' })
  @ApiBody({ type: CreateEduCourseLevelDto })
  @ApiResponse({
    status: 201,
    description: 'Edu-courselevel created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createEduCourseLevelDto: CreateEduCourseLevelDto,
    @Req() request: Request,
  ) {
    return this.createEduCourseLevelUseCase.execute(
      createEduCourseLevelDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of edu-courselevels' })
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
    description: 'Edu-courselevels retrieved successfully',
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
    return await this.findEduCourseLevelPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update edu-courselevel information' })
  @ApiParam({ name: 'id', description: 'Edu-courselevel ID', example: 1 })
  @ApiBody({ type: UpdateEduCourseLevelDto })
  @ApiResponse({
    status: 200,
    description: 'Edu-courselevel updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Edu-courselevel not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEduCourseLevelDto: UpdateEduCourseLevelDto,
    @Req() request: Request,
  ) {
    return this.updateEduCourseLevelUseCase.execute(
      id,
      updateEduCourseLevelDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a edu-courselevel' })
  @ApiParam({ name: 'id', description: 'Edu-courselevel ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Edu-courselevel archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Edu-courselevel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduCourseLevelUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a edu-courselevel' })
  @ApiParam({ name: 'id', description: 'Edu-courselevel ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Edu-courselevel unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Edu-courselevel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduCourseLevelUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get edu-courselevels for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Edu-courselevels retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveEduCourseLevelForComboboxUseCase.execute();
  }
}
