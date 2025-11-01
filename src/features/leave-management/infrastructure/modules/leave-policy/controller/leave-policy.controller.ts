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
import { CreateLeavePolicyDto } from '../dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from '../dto/update-leave-policy.dto';
import { CreateLeavePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/create-leave-policy.use-case';
import { UpdateLeavePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/update-leave-policy.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindLeavePolicyPaginatedListUseCase } from '@features/leave-management/application/use-cases/leave-policy/find-leave-policy-paginated-list.use-case';
import { SoftDeleteLeavePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/soft-delete-leave-policy.use-case';
import { ActivatePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/activate-policy.use-case';
import { RetirePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/retire-policy.use-case';
import { GetActivePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/get-active-policy.use-case';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Leave-Management-Leave-Policy')
@Controller(CONSTANTS_CONTROLLERS.LEAVE_POLICY)
export class LeavePolicyController {
  constructor(
    private readonly createLeavePolicyUseCase: CreateLeavePolicyUseCase,
    private readonly updateLeavePolicyUseCase: UpdateLeavePolicyUseCase,
    private readonly findLeavePolicyPaginatedListUseCase: FindLeavePolicyPaginatedListUseCase,
    private readonly softDeleteLeavePolicyUseCase: SoftDeleteLeavePolicyUseCase,
    private readonly activatePolicyUseCase: ActivatePolicyUseCase,
    private readonly retirePolicyUseCase: RetirePolicyUseCase,
    private readonly getActivePolicyUseCase: GetActivePolicyUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new leave policy' })
  @ApiBody({ type: CreateLeavePolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Leave policy created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createLeavePolicyDto: CreateLeavePolicyDto,
    @Req() request: Request,
  ) {
    // Convert string dates to Date objects
    const command = {
      ...createLeavePolicyDto,
      effectiveDate: new Date(createLeavePolicyDto.effectiveDate),
      expiryDate: new Date(createLeavePolicyDto.expiryDate),
    };

    return this.createLeavePolicyUseCase.execute(
      command,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get paginated list of leave policies' })
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
    description: 'Leave policies retrieved successfully',
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
    return await this.findLeavePolicyPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1')
  @Put(':id')
  @ApiOperation({ summary: 'Update leave policy information' })
  @ApiParam({ name: 'id', description: 'Leave policy ID', example: 1 })
  @ApiBody({ type: UpdateLeavePolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Leave policy updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave policy not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeavePolicyDto: UpdateLeavePolicyDto,
    @Req() request: Request,
  ) {
    // Convert string dates to Date objects if provided
    const command: any = { ...updateLeavePolicyDto };
    if (updateLeavePolicyDto.effectiveDate) {
      command.effectiveDate = new Date(updateLeavePolicyDto.effectiveDate);
    }
    if (updateLeavePolicyDto.expiryDate) {
      command.expiryDate = new Date(updateLeavePolicyDto.expiryDate);
    }

    return this.updateLeavePolicyUseCase.execute(
      id,
      command,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a leave policy' })
  @ApiParam({ name: 'id', description: 'Leave policy ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave policy archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave policy not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteLeavePolicyUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a leave policy' })
  @ApiParam({ name: 'id', description: 'Leave policy ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave policy unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave policy not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteLeavePolicyUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a leave policy' })
  @ApiParam({ name: 'id', description: 'Leave policy ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave policy activated successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave policy not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.activatePolicyUseCase.execute(
      id,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Patch(':id/retire')
  @ApiOperation({ summary: 'Retire a leave policy' })
  @ApiParam({ name: 'id', description: 'Leave policy ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave policy retired successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave policy not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retire(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.retirePolicyUseCase.execute(
      id,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Get('active/:leaveTypeId')
  @ApiOperation({ summary: 'Get active leave policy for a leave type' })
  @ApiParam({ name: 'leaveTypeId', description: 'Leave type ID', example: 1 })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date to check policy',
    example: '2024-01-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Active leave policy retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No active policy found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getActivePolicy(
    @Param('leaveTypeId', ParseIntPipe) leaveTypeId: number,
    @Query('date') date: string,
  ) {
    return this.getActivePolicyUseCase.execute(leaveTypeId);
  }
}
