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
import { CreateEduSchoolDto } from '../dto/create-edu-school.dto';
import { UpdateEduSchoolDto } from '../dto/update-edu-school.dto';
import { CreateEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/create-edu-school.use-case';
import { UpdateEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/update-edu-school.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEduSchoolPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-school/find-edu-school-paginated-list.use-case';
import { RetrieveEduSchoolForComboboxUseCase } from '@features/201-files/application/use-cases/edu-school/retrieve-edu-school-for-combobox.use-case';
import { SoftDeleteEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/soft-delete-edu-school.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Education School')
@Controller(CONSTANTS_CONTROLLERS.EDUSCHOOL)
export class EduSchoolController {
  constructor(
    private readonly createEduSchoolUseCase: CreateEduSchoolUseCase,
    private readonly updateEduSchoolUseCase: UpdateEduSchoolUseCase,
    private readonly findEduSchoolPaginatedListUseCase: FindEduSchoolPaginatedListUseCase,
    private readonly retrieveEduSchoolForComboboxUseCase: RetrieveEduSchoolForComboboxUseCase,
    private readonly softDeleteEduSchoolUseCase: SoftDeleteEduSchoolUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new edu-school' })
  @ApiBody({ type: CreateEduSchoolDto })
  @ApiResponse({ status: 201, description: 'Edu-school created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createEduSchoolDto: CreateEduSchoolDto,
    @Req() request: Request,
  ) {
    return this.createEduSchoolUseCase.execute(
      createEduSchoolDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of edu-schools' })
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
    description: 'Edu-schools retrieved successfully',
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
    return await this.findEduSchoolPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update edu-school information' })
  @ApiParam({ name: 'id', description: 'Edu-school ID', example: 1 })
  @ApiBody({ type: UpdateEduSchoolDto })
  @ApiResponse({ status: 200, description: 'Edu-school updated successfully' })
  @ApiResponse({ status: 404, description: 'Edu-school not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEduSchoolDto: UpdateEduSchoolDto,
    @Req() request: Request,
  ) {
    return this.updateEduSchoolUseCase.execute(
      id,
      updateEduSchoolDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a edu-school' })
  @ApiParam({ name: 'id', description: 'Edu-school ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Edu-school archived successfully' })
  @ApiResponse({ status: 404, description: 'Edu-school not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduSchoolUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a edu-school' })
  @ApiParam({ name: 'id', description: 'Edu-school ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Edu-school unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Edu-school not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduSchoolUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get edu-schools for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Edu-schools retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveEduSchoolForComboboxUseCase.execute();
  }
}
