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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { CreateBranchUseCase } from '@features/201-files/application/use-cases/branch/create-branch.use-case';
import { UpdateBranchUseCase } from '@features/201-files/application/use-cases/branch/update-branch.use-case';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import { FindBranchPaginatedListUseCase } from '@features/201-files/application/use-cases/branch/find-branch-paginated-list.use-case';
import { RetrieveBranchForComboboxUseCase } from '@features/201-files/application/use-cases/branch/retrieve-branch-for-combobox.use-case';
import { SoftDeleteBranchUseCase } from '@features/201-files/application/use-cases/branch/soft-delete-branch.use-case';

@ApiTags('201-Branch')
@Controller(CONSTANTS_CONTROLLERS.BRANCH)
export class BranchController {
  constructor(
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
    private readonly findBranchPaginatedListUseCase: FindBranchPaginatedListUseCase,
    private readonly retrieveBranchForComboboxUseCase: RetrieveBranchForComboboxUseCase,
    private readonly softDeleteBranchUseCase: SoftDeleteBranchUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiBody({ type: CreateBranchDto })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @Req() request: Request,
  ) {
    return this.createBranchUseCase.execute(
      createBranchDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of branches' })
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
  @ApiResponse({ status: 200, description: 'Branches retrieved successfully' })
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
    return await this.findBranchPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update branch information' })
  @ApiParam({ name: 'id', description: 'Branch ID', example: 1 })
  @ApiBody({ type: UpdateBranchDto })
  @ApiResponse({ status: 200, description: 'Branch updated successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBranchDto: UpdateBranchDto,
    @Req() request: Request,
  ) {
    return this.updateBranchUseCase.execute(
      id,
      updateBranchDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a branch' })
  @ApiParam({ name: 'id', description: 'Branch ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Branch archived successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteBranchUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a branch' })
  @ApiParam({ name: 'id', description: 'Branch ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Branch unarchived successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteBranchUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get branches for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Branches retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveBranchForComboboxUseCase.execute();
  }
}
