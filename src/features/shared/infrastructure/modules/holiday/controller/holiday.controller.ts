import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Put,
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
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { CreateHolidayUseCase } from '@features/shared/application/use-cases/holiday/create-holiday.use-case';
import { UpdateHolidayUseCase } from '@features/shared/application/use-cases/holiday/update-holiday.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindHolidayPaginatedListUseCase } from '@features/shared/application/use-cases/holiday/find-holiday-paginated-list.use-case';
import { FindHolidayByIdUseCase } from '@features/shared/application/use-cases/holiday/find-holiday-by-id.use-case';
import { FindHolidaysByDateRangeUseCase } from '@features/shared/application/use-cases/holiday/find-holidays-by-date-range.use-case';
import { FindHolidayByYearUseCase } from '@features/shared/application/use-cases/holiday/find-holiday-by-year.use-case';
import { SoftDeleteHolidayUseCase } from '@features/shared/application/use-cases/holiday/soft-delete-holiday.use-case';
import { CreateHolidayCommand } from '@features/shared/application/commands/holiday/create-holiday.command';
import { UpdateHolidayCommand } from '@features/shared/application/commands/holiday/update-holiday.command';

@ApiTags('Shared-Holiday')
@Controller(CONSTANTS_CONTROLLERS.HOLIDAY)
export class HolidayController {
  constructor(
    private readonly createHolidayUseCase: CreateHolidayUseCase,
    private readonly updateHolidayUseCase: UpdateHolidayUseCase,
    private readonly findHolidayPaginatedListUseCase: FindHolidayPaginatedListUseCase,
    private readonly findHolidayByIdUseCase: FindHolidayByIdUseCase,
    private readonly findHolidaysByDateRangeUseCase: FindHolidaysByDateRangeUseCase,
    private readonly findHolidayByYearUseCase: FindHolidayByYearUseCase,
    private readonly softDeleteHolidayUseCase: SoftDeleteHolidayUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new holiday' })
  @ApiBody({ type: CreateHolidayDto })
  @ApiResponse({ status: 201, description: 'Holiday created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createHolidayDto: CreateHolidayDto,
    @Req() request: Request,
  ) {
    const command: CreateHolidayCommand = {
      name: createHolidayDto.name,
      date: createHolidayDto.date,
      description: createHolidayDto.description,
    };
    return this.createHolidayUseCase.execute(
      command,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).session?.id,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get paginated list of holidays' })
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
    description: 'Holidays retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findPaginatedList(
    @Query('term') term: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    return await this.findHolidayPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1')
  @Get('date-range')
  @ApiOperation({ summary: 'Get holidays by date range' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Holidays retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() request: Request,
  ) {
    return this.findHolidaysByDateRangeUseCase.execute(
      startDate,
      endDate,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).session?.id,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1')
  @Get('year/:year')
  @ApiOperation({ summary: 'Get holidays by year' })
  @ApiParam({ name: 'year', description: 'Year', example: 2024 })
  @ApiResponse({
    status: 200,
    description: 'Holidays retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findByYear(
    @Param('year', ParseIntPipe) year: number,
    @Req() request: Request,
  ) {
    return this.findHolidayByYearUseCase.execute(
      year,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).session?.id,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1')
  @Get(':id')
  @ApiOperation({ summary: 'Get holiday by ID' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Holiday retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.findHolidayByIdUseCase.execute(
      id,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).session?.id,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1')
  @Put(':id')
  @ApiOperation({ summary: 'Update holiday information' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: 1 })
  @ApiBody({ type: UpdateHolidayDto })
  @ApiResponse({ status: 200, description: 'Holiday updated successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHolidayDto: UpdateHolidayDto,
    @Req() request: Request,
  ) {
    const command: UpdateHolidayCommand = {
      id,
      name: updateHolidayDto.name,
      date: updateHolidayDto.date,
      description: updateHolidayDto.description,
    };
    return this.updateHolidayUseCase.execute(
      command,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).session?.id,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1')
  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a holiday' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Holiday archived successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteHolidayUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).session?.id,
        username: (request as any).user?.username,
      },
    );
  }

  @Version('1')
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a holiday' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Holiday unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteHolidayUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
        sessionId: (request as any).session?.id,
        username: (request as any).user?.username,
      },
    );
  }
}
