import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Param,
  Query,
  Get,
  Req,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from '../dto/update-leave-request.dto';
import { ApproveLeaveRequestDto } from '../dto/approve-leave-request.dto';
import { RejectLeaveRequestDto } from '../dto/reject-leave-request.dto';
import { UpdateLeaveRequestCommand } from '@features/leave-management/application/commands/leave-request/update-leave-request.command';
import { CreateLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/create-leave-request.use-case';
import { UpdateLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/update-leave-request.use-case';
import { ApproveLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/approve-leave-request.use-case';
import { RejectLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/reject-leave-request.use-case';
import { CancelLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/cancel-leave-request.use-case';
import { FindLeaveRequestByIdUseCase } from '@features/leave-management/application/use-cases/leave-request/find-leave-request-by-id.use-case';
import { FindLeaveRequestsByEmployeeUseCase } from '@features/leave-management/application/use-cases/leave-request/find-leave-requests-by-employee.use-case';
import { FindPendingLeaveRequestsUseCase } from '@features/leave-management/application/use-cases/leave-request/find-pending-leave-requests.use-case';
import { FindLeaveRequestPaginatedListUseCase } from '@features/leave-management/application/use-cases/leave-request/find-leave-request-paginated-list.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Leave Request')
@Controller(CONSTANTS_CONTROLLERS.LEAVE_REQUEST)
export class LeaveRequestController {
  constructor(
    private readonly createLeaveRequestUseCase: CreateLeaveRequestUseCase,
    private readonly updateLeaveRequestUseCase: UpdateLeaveRequestUseCase,
    private readonly approveLeaveRequestUseCase: ApproveLeaveRequestUseCase,
    private readonly rejectLeaveRequestUseCase: RejectLeaveRequestUseCase,
    private readonly cancelLeaveRequestUseCase: CancelLeaveRequestUseCase,
    private readonly findLeaveRequestByIdUseCase: FindLeaveRequestByIdUseCase,
    private readonly findLeaveRequestsByEmployeeUseCase: FindLeaveRequestsByEmployeeUseCase,
    private readonly findPendingLeaveRequestsUseCase: FindPendingLeaveRequestsUseCase,
    private readonly findLeaveRequestPaginatedListUseCase: FindLeaveRequestPaginatedListUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiBody({ type: CreateLeaveRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Leave request created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
    @Req() request: Request,
  ) {
    // Convert string dates to Date objects for the command
    const startDate =
      createLeaveRequestDto.startDate instanceof Date
        ? createLeaveRequestDto.startDate
        : new Date(createLeaveRequestDto.startDate);
    const endDate =
      createLeaveRequestDto.endDate instanceof Date
        ? createLeaveRequestDto.endDate
        : new Date(createLeaveRequestDto.endDate);

    return this.createLeaveRequestUseCase.execute(
      {
        ...createLeaveRequestDto,
        startDate,
        endDate,
      },
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Put(':id')
  @ApiOperation({ summary: 'Update a leave request (PENDING only)' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: 1 })
  @ApiBody({ type: UpdateLeaveRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Leave request updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cannot update request',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Req() request: Request,
  ) {
    // Convert string dates to Date objects if provided
    const command: UpdateLeaveRequestCommand = {
      id,
      leaveType: updateLeaveRequestDto.leaveType,
      reason: updateLeaveRequestDto.reason,
      totalDays: updateLeaveRequestDto.totalDays,
      isHalfDay: updateLeaveRequestDto.isHalfDay,
    };

    if (updateLeaveRequestDto.startDate) {
      command.startDate =
        updateLeaveRequestDto.startDate instanceof Date
          ? updateLeaveRequestDto.startDate
          : new Date(updateLeaveRequestDto.startDate);
    }

    if (updateLeaveRequestDto.endDate) {
      command.endDate =
        updateLeaveRequestDto.endDate instanceof Date
          ? updateLeaveRequestDto.endDate
          : new Date(updateLeaveRequestDto.endDate);
    }

    return this.updateLeaveRequestUseCase.execute(
      command,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: 1 })
  @ApiBody({ type: ApproveLeaveRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Leave request approved successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cannot approve request',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveLeaveRequestDto,
    @Req() request: Request,
  ) {
    return this.approveLeaveRequestUseCase.execute(
      id,
      approveDto.approverId,
      approveDto.remarks || '',
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: 1 })
  @ApiBody({ type: RejectLeaveRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Leave request rejected successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cannot reject request',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: RejectLeaveRequestDto,
    @Req() request: Request,
  ) {
    return this.rejectLeaveRequestUseCase.execute(
      id,
      rejectDto.approverId,
      rejectDto.remarks,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: 1 })
  @ApiQuery({
    name: 'employeeId',
    description: 'Employee ID (must own the request)',
    example: 1,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cannot cancel request',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Query('employeeId', ParseIntPipe) employeeId: number,
    @Req() request: Request,
  ) {
    return this.cancelLeaveRequestUseCase.execute(
      id,
      employeeId,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Get(':id')
  @ApiOperation({ summary: 'Get a leave request by ID' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave request retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.findLeaveRequestByIdUseCase.execute(
      id,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Get('employee/:employeeId')
  @ApiOperation({
    summary: 'Get all leave requests for an employee',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findByEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Req() request: Request,
  ) {
    return this.findLeaveRequestsByEmployeeUseCase.execute(
      employeeId,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Get('pending/list')
  @ApiOperation({
    summary: 'Get all pending leave requests',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending leave requests retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findPending(@Req() request: Request) {
    return this.findPendingLeaveRequestsUseCase.execute(
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Get('list/paginated')
  @ApiOperation({
    summary: 'Get paginated list of leave requests with search',
  })
  @ApiQuery({
    name: 'term',
    description: 'Search term',
    required: false,
    example: 'vacation',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated leave requests retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findPaginatedList(
    @Query('term') term: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() request: Request,
  ) {
    return this.findLeaveRequestPaginatedListUseCase.execute(
      term,
      page,
      limit,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }
}
