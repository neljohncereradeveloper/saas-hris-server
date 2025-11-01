import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Param,
  Get,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateLeaveCycleDto } from '../dto/create-leave-cycle.dto';
import { SetupLeaveCyclesDto } from '../dto/setup-leave-cycles.dto';
import { CreateLeaveCycleUseCase } from '@features/leave-management/application/use-cases/leave-cycle/create-leave-cycle.use-case';
import { SetupLeaveCyclesUseCase } from '@features/leave-management/application/use-cases/leave-cycle/setup-leave-cycles.use-case';
import { FindCyclesByEmployeeUseCase } from '@features/leave-management/application/use-cases/leave-cycle/find-cycles-by-employee.use-case';
import { GetActiveCycleUseCase } from '@features/leave-management/application/use-cases/leave-cycle/get-active-cycle.use-case';
import { CloseCycleUseCase } from '@features/leave-management/application/use-cases/leave-cycle/close-cycle.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Leave Cycle')
@Controller(CONSTANTS_CONTROLLERS.LEAVE_CYCLE)
export class LeaveCycleController {
  constructor(
    private readonly createLeaveCycleUseCase: CreateLeaveCycleUseCase,
    private readonly setupLeaveCyclesUseCase: SetupLeaveCyclesUseCase,
    private readonly findCyclesByEmployeeUseCase: FindCyclesByEmployeeUseCase,
    private readonly getActiveCycleUseCase: GetActiveCycleUseCase,
    private readonly closeCycleUseCase: CloseCycleUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new leave cycle' })
  @ApiBody({ type: CreateLeaveCycleDto })
  @ApiResponse({
    status: 201,
    description: 'Leave cycle created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createLeaveCycleDto: CreateLeaveCycleDto,
    @Req() request: Request,
  ) {
    return this.createLeaveCycleUseCase.execute(
      createLeaveCycleDto,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }

  @Version('1')
  @Post('setup')
  @ApiOperation({
    summary: 'Setup leave cycles for all active employees',
  })
  @ApiBody({ type: SetupLeaveCyclesDto })
  @ApiResponse({
    status: 201,
    description: 'Leave cycles setup successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async setup(@Body() dto: SetupLeaveCyclesDto, @Req() request: Request) {
    return this.setupLeaveCyclesUseCase.execute(
      dto,
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
    summary: 'Get all leave cycles for an employee',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave cycles retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No leave cycles found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.findCyclesByEmployeeUseCase.execute(employeeId);
  }

  @Version('1')
  @Get('employee/:employeeId/leave-type/:leaveTypeId/active')
  @ApiOperation({
    summary: 'Get active leave cycle for an employee and leave type',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID', example: 1 })
  @ApiParam({ name: 'leaveTypeId', description: 'Leave type ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Active leave cycle retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'No active cycle found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getActive(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('leaveTypeId', ParseIntPipe) leaveTypeId: number,
  ) {
    return this.getActiveCycleUseCase.execute(employeeId, leaveTypeId);
  }

  @Version('1')
  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a leave cycle' })
  @ApiParam({ name: 'id', description: 'Leave cycle ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Leave cycle closed successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave cycle not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cycle already closed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async close(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.closeCycleUseCase.execute(
      id,
      (request as any).user?.id || 'system',
      {
        ipAddress: (request as any).ip,
        userAgent: (request as any).get('user-agent'),
      },
    );
  }
}
