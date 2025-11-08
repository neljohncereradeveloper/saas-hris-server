import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Param,
  Get,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateLeaveYearConfigurationDto } from '../dto/create-leave-year-configuration.dto';
import { UpdateLeaveYearConfigurationDto } from '../dto/update-leave-year-configuration.dto';
import { CreateLeaveYearConfigurationUseCase } from '@features/leave-management/application/use-cases/leave-year-configuration/create-leave-year-configuration.use-case';
import { UpdateLeaveYearConfigurationUseCase } from '@features/leave-management/application/use-cases/leave-year-configuration/update-leave-year-configuration.use-case';
import { FindLeaveYearConfigurationByYearUseCase } from '@features/leave-management/application/use-cases/leave-year-configuration/find-leave-year-configuration-by-year.use-case';
import { GetActiveCutoffForDateUseCase } from '@features/leave-management/application/use-cases/leave-year-configuration/get-active-cutoff-for-date.use-case';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Leave Year Configuration')
@Controller('leave-year-configuration')
export class LeaveYearConfigurationController {
  constructor(
    private readonly createLeaveYearConfigurationUseCase: CreateLeaveYearConfigurationUseCase,
    private readonly updateLeaveYearConfigurationUseCase: UpdateLeaveYearConfigurationUseCase,
    private readonly findLeaveYearConfigurationByYearUseCase: FindLeaveYearConfigurationByYearUseCase,
    private readonly getActiveCutoffForDateUseCase: GetActiveCutoffForDateUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new leave year configuration' })
  @ApiBody({ type: CreateLeaveYearConfigurationDto })
  @ApiResponse({
    status: 201,
    description: 'Leave year configuration created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createDto: CreateLeaveYearConfigurationDto,
    @Req() request: Request,
  ) {
    return this.createLeaveYearConfigurationUseCase.execute(
      {
        cutoffStartDate: createDto.cutoffStartDate,
        cutoffEndDate: createDto.cutoffEndDate,
        remarks: createDto.remarks,
      },
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a leave year configuration' })
  @ApiParam({ name: 'id', description: 'Configuration ID', example: 1 })
  @ApiBody({ type: UpdateLeaveYearConfigurationDto })
  @ApiResponse({
    status: 200,
    description: 'Leave year configuration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLeaveYearConfigurationDto,
    @Req() request: Request,
  ) {
    return this.updateLeaveYearConfigurationUseCase.execute(
      {
        id,
        cutoffStartDate: updateDto.cutoffStartDate,
        cutoffEndDate: updateDto.cutoffEndDate,
        remarks: updateDto.remarks,
        isActive: updateDto.isActive,
      },
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Get('year/:year')
  @ApiOperation({ summary: 'Find leave year configuration by year identifier' })
  @ApiParam({
    name: 'year',
    description: 'Leave year identifier (e.g., "2023-2024")',
    example: '2023-2024',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave year configuration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findByYear(@Param('year') year: string) {
    return this.findLeaveYearConfigurationByYearUseCase.execute(year);
  }

  @Version('1')
  @Get('active-for-date')
  @ApiOperation({
    summary: 'Get active leave year configuration for a specific date',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date to check (YYYY-MM-DD)',
    example: '2024-01-15',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Active configuration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No active configuration found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getActiveForDate(@Query('date') date: string) {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format');
    }
    return this.getActiveCutoffForDateUseCase.execute(dateObj);
  }
}

