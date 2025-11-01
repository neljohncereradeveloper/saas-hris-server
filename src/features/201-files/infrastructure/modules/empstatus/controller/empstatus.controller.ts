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
import { CreateEmpStatusDto } from '../dto/create-empstatus.dto';
import { UpdateEmpStatusDto } from '../dto/update-empstatus.dto';
import { CreateEmpStatusUseCase } from '@features/201-files/application/use-cases/empstatus/create-empstatus.use-case';
import { UpdateEmpStatusUseCase } from '@features/201-files/application/use-cases/empstatus/update-empstatus.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEmpStatusPaginatedListUseCase } from '@features/201-files/application/use-cases/empstatus/find-empstatus-paginated-list.use-case';
import { RetrieveEmpStatusForComboboxUseCase } from '@features/201-files/application/use-cases/empstatus/retrieve-empstatus-for-combobox.use-case';
import { SoftDeleteEmpStatusUseCase } from '@features/201-files/application/use-cases/empstatus/soft-delete-empstatus.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('201-Employee Status')
@Controller(CONSTANTS_CONTROLLERS.EMPSTATUS)
export class EmpStatusController {
  constructor(
    private readonly createEmpStatusUseCase: CreateEmpStatusUseCase,
    private readonly updateEmpStatusUseCase: UpdateEmpStatusUseCase,
    private readonly findEmpStatusPaginatedListUseCase: FindEmpStatusPaginatedListUseCase,
    private readonly retrieveEmpStatusForComboboxUseCase: RetrieveEmpStatusForComboboxUseCase,
    private readonly softDeleteEmpStatusUseCase: SoftDeleteEmpStatusUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new empstatus' })
  @ApiBody({ type: CreateEmpStatusDto })
  @ApiResponse({ status: 201, description: 'Empstatus created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createEmpStatusDto: CreateEmpStatusDto,
    @Req() request: Request,
  ) {
    return this.createEmpStatusUseCase.execute(
      createEmpStatusDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of empstatuss' })
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
    description: 'Empstatuss retrieved successfully',
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
    return await this.findEmpStatusPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update empstatus information' })
  @ApiParam({ name: 'id', description: 'Empstatus ID', example: 1 })
  @ApiBody({ type: UpdateEmpStatusDto })
  @ApiResponse({ status: 200, description: 'Empstatus updated successfully' })
  @ApiResponse({ status: 404, description: 'Empstatus not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpStatusDto: UpdateEmpStatusDto,
    @Req() request: Request,
  ) {
    return this.updateEmpStatusUseCase.execute(
      id,
      updateEmpStatusDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a empstatus' })
  @ApiParam({ name: 'id', description: 'Empstatus ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Empstatus archived successfully' })
  @ApiResponse({ status: 404, description: 'Empstatus not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEmpStatusUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a empstatus' })
  @ApiParam({ name: 'id', description: 'Empstatus ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Empstatus unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Empstatus not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEmpStatusUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get empstatuss for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Empstatuss retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveEmpStatusForComboboxUseCase.execute();
  }
}
