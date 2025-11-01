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
import { CreateEduCourseDto } from '../dto/create-edu-course.dto';
import { UpdateEduCourseDto } from '../dto/update-edu-course.dto';
import { CreateEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/create-edu-course.use-case';
import { UpdateEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/update-edu-course.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEduCoursePaginatedListUseCase } from '@features/201-files/application/use-cases/edu-course/find-edu-course-paginated-list.use-case';
import { RetrieveCourseForComboboxUseCase } from '@features/201-files/application/use-cases/edu-course/retrieve-edu-course-for-combobox.use-case';
import { SoftDeleteEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/soft-delete-edu-course.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Education Course')
@Controller(CONSTANTS_CONTROLLERS.EDUCOURSE)
export class EduCourseController {
  constructor(
    private readonly createEduCourseUseCase: CreateEduCourseUseCase,
    private readonly updateEduCourseUseCase: UpdateEduCourseUseCase,
    private readonly findEduCoursePaginatedListUseCase: FindEduCoursePaginatedListUseCase,
    private readonly retrieveEduCourseForComboboxUseCase: RetrieveCourseForComboboxUseCase,
    private readonly softDeleteEduCourseUseCase: SoftDeleteEduCourseUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new edu-course' })
  @ApiBody({ type: CreateEduCourseDto })
  @ApiResponse({ status: 201, description: 'Edu-course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createEduCourseDto: CreateEduCourseDto,
    @Req() request: Request,
  ) {
    return this.createEduCourseUseCase.execute(
      createEduCourseDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of edu-courses' })
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
    description: 'Edu-courses retrieved successfully',
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
    return await this.findEduCoursePaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update edu-course information' })
  @ApiParam({ name: 'id', description: 'Edu-course ID', example: 1 })
  @ApiBody({ type: UpdateEduCourseDto })
  @ApiResponse({ status: 200, description: 'Edu-course updated successfully' })
  @ApiResponse({ status: 404, description: 'Edu-course not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEduCourseDto: UpdateEduCourseDto,
    @Req() request: Request,
  ) {
    return this.updateEduCourseUseCase.execute(
      id,
      updateEduCourseDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a edu-course' })
  @ApiParam({ name: 'id', description: 'Edu-course ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Edu-course archived successfully' })
  @ApiResponse({ status: 404, description: 'Edu-course not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduCourseUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a edu-course' })
  @ApiParam({ name: 'id', description: 'Edu-course ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Edu-course unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Edu-course not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduCourseUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get edu-courses for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Edu-courses retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveEduCourseForComboboxUseCase.execute();
  }
}
