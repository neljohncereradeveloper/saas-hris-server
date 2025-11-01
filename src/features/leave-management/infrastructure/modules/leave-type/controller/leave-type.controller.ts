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
import { CreateLeaveTypeDto } from '../dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from '../dto/update-leave-type.dto';
import { CreateLeaveTypeUseCase } from '@features/leave-management/application/use-cases/leave-type/create-leave-type.use-case';
import { UpdateLeaveTypeUseCase } from '@features/leave-management/application/use-cases/leave-type/update-leave-type.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindLeaveTypePaginatedListUseCase } from '@features/leave-management/application/use-cases/leave-type/find-leave-type-paginated-list.use-case';
import { RetrieveLeaveTypeForComboboxUseCase } from '@features/leave-management/application/use-cases/leave-type/retrieve-leave-type-for-combobox.use-case';
import { SoftDeleteLeaveTypeUseCase } from '@features/leave-management/application/use-cases/leave-type/soft-delete-leave-type.use-case';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Leave Type')
@Controller(CONSTANTS_CONTROLLERS.LEAVETYPE)
export class LeaveTypeController {
  constructor(
    private readonly createLeaveTypeUseCase: CreateLeaveTypeUseCase,
    private readonly updateLeaveTypeUseCase: UpdateLeaveTypeUseCase,
    private readonly findLeaveTypePaginatedListUseCase: FindLeaveTypePaginatedListUseCase,
    private readonly retrieveLeaveTypeForComboboxUseCase: RetrieveLeaveTypeForComboboxUseCase,
    private readonly softDeleteLeaveTypeUseCase: SoftDeleteLeaveTypeUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new leave type' })
  @ApiBody({ type: CreateLeaveTypeDto })
  @ApiResponse({ status: 201, description: 'Leave type created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createLeaveTypeDto: CreateLeaveTypeDto,
    @Req() request: Request,
  ) {
    return this.createLeaveTypeUseCase.execute(
      createLeaveTypeDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get paginated list of leave types' })
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
    description: 'Leave types retrieved successfully',
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
    return await this.findLeaveTypePaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1')
  @Put(':id')
  @ApiOperation({ summary: 'Update leave type information' })
  @ApiParam({ name: 'id', description: 'Leave type ID', example: 1 })
  @ApiBody({ type: UpdateLeaveTypeDto })
  @ApiResponse({ status: 200, description: 'Leave type updated successfully' })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
    @Req() request: Request,
  ) {
    return this.updateLeaveTypeUseCase.execute(
      id,
      updateLeaveTypeDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1')
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a leave type' })
  @ApiParam({ name: 'id', description: 'Leave type ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Leave type archived successfully' })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteLeaveTypeUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1')
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a leave type' })
  @ApiParam({ name: 'id', description: 'Leave type ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave type unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteLeaveTypeUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1')
  @Get('combobox')
  @ApiOperation({ summary: 'Get leave types for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Leave types retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveLeaveTypeForComboboxUseCase.execute();
  }
}
