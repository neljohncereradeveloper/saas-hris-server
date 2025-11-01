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
import { CreateTrainingCertDto } from '../dto/create-training-cert.dto';
import { UpdateTrainingCertDto } from '../dto/update-training-cert.dto';
import { CreateTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/create-trainingcert.use-case';
import { UpdateTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/update-trainingcert.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindTrainingCertPaginatedListUseCase } from '@features/201-files/application/use-cases/training-cert/find-trainingcert-paginated-list.use-case';
import { RetrieveTrainingCertForComboboxUseCase } from '@features/201-files/application/use-cases/training-cert/retrieve-trainingcert-for-combobox.use-case';
import { SoftDeleteTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/soft-delete-trainingcert.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('201-Training Certificate')
@Controller(CONSTANTS_CONTROLLERS.TRAININGSCERT)
export class TrainingCertController {
  constructor(
    private readonly createTrainingCertUseCase: CreateTrainingCertUseCase,
    private readonly updateTrainingCertUseCase: UpdateTrainingCertUseCase,
    private readonly findTrainingCertPaginatedListUseCase: FindTrainingCertPaginatedListUseCase,
    private readonly retrieveTrainingCertForComboboxUseCase: RetrieveTrainingCertForComboboxUseCase,
    private readonly softDeleteTrainingCertUseCase: SoftDeleteTrainingCertUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new training-cert' })
  @ApiBody({ type: CreateTrainingCertDto })
  @ApiResponse({
    status: 201,
    description: 'Training-cert created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createTrainingCertDto: CreateTrainingCertDto,
    @Req() request: Request,
  ) {
    return this.createTrainingCertUseCase.execute(
      createTrainingCertDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of training-certs' })
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
    description: 'Training-certs retrieved successfully',
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
    return await this.findTrainingCertPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update training-cert information' })
  @ApiParam({ name: 'id', description: 'Training-cert ID', example: 1 })
  @ApiBody({ type: UpdateTrainingCertDto })
  @ApiResponse({
    status: 200,
    description: 'Training-cert updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Training-cert not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainingCertDto: UpdateTrainingCertDto,
    @Req() request: Request,
  ) {
    return this.updateTrainingCertUseCase.execute(
      id,
      updateTrainingCertDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a training-cert' })
  @ApiParam({ name: 'id', description: 'Training-cert ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Training-cert archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Training-cert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteTrainingCertUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a training-cert' })
  @ApiParam({ name: 'id', description: 'Training-cert ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Training-cert unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Training-cert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteTrainingCertUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get training-certs for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Training-certs retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveTrainingCertForComboboxUseCase.execute();
  }
}
