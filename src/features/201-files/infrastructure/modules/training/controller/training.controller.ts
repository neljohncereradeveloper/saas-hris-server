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
import { CreateTrainingDto } from '../dto/create-training.dto';
import { UpdateTrainingDto } from '../dto/update-training.dto';
import { CreateTrainingUseCase } from '@features/201-files/application/use-cases/training/create-training.use-case';
import { UpdateTrainingUseCase } from '@features/201-files/application/use-cases/training/update-training-experience.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEmployeesTrainingUseCase } from '@features/201-files/application/use-cases/training/find-employees-training.use-case';
import { SoftDeleteTrainingUseCase } from '@features/201-files/application/use-cases/training/soft-delete-training.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Training')
@Controller(CONSTANTS_CONTROLLERS.TRAININGS)
export class TrainingController {
  constructor(
    private readonly createTrainingUseCase: CreateTrainingUseCase,
    private readonly updateTrainingUseCase: UpdateTrainingUseCase,
    private readonly findEmployeesTrainingUseCase: FindEmployeesTrainingUseCase,
    private readonly softDeleteTrainingUseCase: SoftDeleteTrainingUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new training' })
  @ApiBody({ type: CreateTrainingDto })
  @ApiResponse({ status: 201, description: 'Training created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
    @Req() request: Request,
  ) {
    return this.createTrainingUseCase.execute(
      createTrainingDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get training records for a specific employee' })
  @ApiQuery({
    name: 'employeeId',
    description: 'Employee ID to filter training records',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Training records retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid employee ID',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiBearerAuth('JWT-auth')
  async findEmployeesTraining(@Query('employeeId') employeeId: string) {
    // Validate and parse query parameters
    const parsedEmployeeId = parseInt(employeeId, 10);
    return await this.findEmployeesTrainingUseCase.execute(parsedEmployeeId);
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update training information' })
  @ApiParam({ name: 'id', description: 'Training ID', example: 1 })
  @ApiBody({ type: UpdateTrainingDto })
  @ApiResponse({ status: 200, description: 'Training updated successfully' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainingDto: UpdateTrainingDto,
    @Req() request: Request,
  ) {
    return this.updateTrainingUseCase.execute(
      id,
      updateTrainingDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a training' })
  @ApiParam({ name: 'id', description: 'Training ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Training archived successfully' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteTrainingUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a training' })
  @ApiParam({ name: 'id', description: 'Training ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Training unarchived successfully' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteTrainingUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }
}
