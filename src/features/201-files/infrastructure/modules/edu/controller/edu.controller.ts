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
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateEduDto } from '../dto/create-edu.dto';
import { UpdateEduDto } from '../dto/update-edu.dto';
import { CreateEduUseCase } from '@features/201-files/application/use-cases/edu/create-edu.use-case';
import { UpdateEduUseCase } from '@features/201-files/application/use-cases/edu/update-edu.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindEmployeesEduUseCase } from '@features/201-files/application/use-cases/edu/find-employees-edu.use-case';
import { SoftDeleteEduUseCase } from '@features/201-files/application/use-cases/edu/soft-delete-edu.use-case';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('201-Education')
@Controller(CONSTANTS_CONTROLLERS.EDU)
export class EduController {
  constructor(
    private readonly createEduUseCase: CreateEduUseCase,
    private readonly updateEduUseCase: UpdateEduUseCase,
    private readonly findEmployeesEduUseCase: FindEmployeesEduUseCase,
    private readonly softDeleteEduUseCase: SoftDeleteEduUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new edu' })
  @ApiBody({ type: CreateEduDto })
  @ApiResponse({ status: 201, description: 'Edu created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createEduDto: CreateEduDto, @Req() request: Request) {
    return this.createEduUseCase.execute(
      createEduDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get employee education records' })
  @ApiQuery({
    name: 'employeeId',
    required: true,
    description: 'Employee ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee education records retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findEmployeesEdu(@Query('employeeId') employeeId: string) {
    // Validate and parse query parameters
    const parsedEmployeeId = parseInt(employeeId, 10);
    return await this.findEmployeesEduUseCase.execute(parsedEmployeeId);
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update edu information' })
  @ApiParam({ name: 'id', description: 'Edu ID', example: 1 })
  @ApiBody({ type: UpdateEduDto })
  @ApiResponse({ status: 200, description: 'Edu updated successfully' })
  @ApiResponse({ status: 404, description: 'Edu not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEduDto: UpdateEduDto,
    @Req() request: Request,
  ) {
    return this.updateEduUseCase.execute(
      id,
      updateEduDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a edu' })
  @ApiParam({ name: 'id', description: 'Edu ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Edu archived successfully' })
  @ApiResponse({ status: 404, description: 'Edu not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a edu' })
  @ApiParam({ name: 'id', description: 'Edu ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Edu unarchived successfully' })
  @ApiResponse({ status: 404, description: 'Edu not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteEduUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }
}
