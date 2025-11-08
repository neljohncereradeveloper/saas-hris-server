import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Delete,
  Param,
  Query,
  Get,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateLeaveBalanceDto } from '../dto/create-leave-balance.dto';
import { GenerateAnnualLeaveBalancesDto } from '../dto/generate-annual-leave-balances.dto';
import { CreateLeaveBalanceUseCase } from '@features/leave-management/application/use-cases/leave-balance/create-leave-balance.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindLeaveBalanceByEmployeeYearUseCase } from '@features/leave-management/application/use-cases/leave-balance/find-leave-balance-by-employee-year.use-case';
import { SoftDeleteLeaveBalanceUseCase } from '@features/leave-management/application/use-cases/leave-balance/soft-delete-leave-balance.use-case';
import { CloseLeaveBalanceUseCase } from '@features/leave-management/application/use-cases/leave-balance/close-leave-balance.use-case';
import { GenerateAnnualLeaveBalancesUseCase } from '@features/leave-management/application/use-cases/leave-balance/generate-annual-leave-balances.use-case';
import { ResetLeaveBalancesForYearUseCase } from '@features/leave-management/application/use-cases/leave-balance/reset-leave-balances-for-year.use-case';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Leave Balance')
@Controller(CONSTANTS_CONTROLLERS.LEAVE_BALANCE)
export class LeaveBalanceController {
  constructor(
    private readonly createLeaveBalanceUseCase: CreateLeaveBalanceUseCase,
    private readonly generateAnnualLeaveBalancesUseCase: GenerateAnnualLeaveBalancesUseCase,
    private readonly findLeaveBalanceByEmployeeYearUseCase: FindLeaveBalanceByEmployeeYearUseCase,
    private readonly closeLeaveBalanceUseCase: CloseLeaveBalanceUseCase,
    private readonly softDeleteLeaveBalanceUseCase: SoftDeleteLeaveBalanceUseCase,
    private readonly resetLeaveBalancesForYearUseCase: ResetLeaveBalancesForYearUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new leave balance' })
  @ApiBody({ type: CreateLeaveBalanceDto })
  @ApiResponse({
    status: 201,
    description: 'Leave balance created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createLeaveBalanceDto: CreateLeaveBalanceDto,
    @Req() request: Request,
  ) {
    return this.createLeaveBalanceUseCase.execute(
      createLeaveBalanceDto,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Post('generate-annual')
  @ApiOperation({ summary: 'Generate annual leave balances for all employees' })
  @ApiBody({ type: GenerateAnnualLeaveBalancesDto })
  @ApiResponse({
    status: 201,
    description: 'Annual leave balances generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async generateAnnual(
    @Body() dto: GenerateAnnualLeaveBalancesDto,
    @Req() request: Request,
  ) {
    return this.generateAnnualLeaveBalancesUseCase.execute(
      dto,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Get('employee/:employeeId/year/:year')
  @ApiOperation({
    summary: 'Get all leave balances for an employee for a specific year',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID', example: 1 })
  @ApiParam({
    name: 'year',
    description: 'Leave year identifier (e.g., "2023-2024")',
    example: '2023-2024',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave balances retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No leave balances found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findByEmployeeYear(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('year') year: string,
  ) {
    return this.findLeaveBalanceByEmployeeYearUseCase.execute(employeeId, year);
  }

  @Version('1')
  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a leave balance' })
  @ApiParam({ name: 'id', description: 'Leave balance ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave balance closed successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave balance not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - balance already closed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async close(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.closeLeaveBalanceUseCase.execute(
      id,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a leave balance' })
  @ApiParam({ name: 'id', description: 'Leave balance ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave balance archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave balance not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteLeaveBalanceUseCase.execute(
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
  @ApiOperation({ summary: 'Unarchive a leave balance' })
  @ApiParam({ name: 'id', description: 'Leave balance ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave balance unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave balance not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteLeaveBalanceUseCase.execute(
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
  @Post('reset/year/:year')
  @ApiOperation({ summary: 'Reset all leave balances for a specific year' })
  @ApiParam({
    name: 'year',
    description: 'Leave year identifier to reset (e.g., "2023-2024")',
    example: '2023-2024',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave balances reset successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async resetForYear(
    @Param('year') year: string,
    @Req() request: Request,
  ) {
    return this.resetLeaveBalancesForYearUseCase.execute(
      year,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }
}
