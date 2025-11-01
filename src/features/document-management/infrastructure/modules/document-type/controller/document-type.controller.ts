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
import { CreateDocumentTypeUseCase } from '@features/document-management/application/use-cases/document-type/create-document-type.use-case';
import { FindDocumentTypePaginatedListUseCase } from '@features/document-management/application/use-cases/document-type/find-document-type-paginated-list.use-case';
import { UpdateDocumentTypeUseCase } from '@features/document-management/application/use-cases/document-type/update-document-type.use-case';
import { RetrieveDocumentTypeForComboboxUseCase } from '@features/document-management/application/use-cases/document-type/retrieve-document-type-for-combobox.use-case';
import { SoftDeleteDocumentTypeUseCase } from '@features/document-management/application/use-cases/document-type/soft-delete-document-type.use-case';
import { CreateDocumentTypeDto } from '../dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from '../dto/update-document-type.dto';

@ApiTags('Document Type')
@Controller(CONSTANTS_CONTROLLERS.DOCUMENTTYPE)
export class DocumentTypeController {
  constructor(
    private readonly createDocumentTypeUseCase: CreateDocumentTypeUseCase,
    private readonly updateDocumentTypeUseCase: UpdateDocumentTypeUseCase,
    private readonly findDocumentTypePaginatedListUseCase: FindDocumentTypePaginatedListUseCase,
    private readonly retrieveDocumentTypeForComboboxUseCase: RetrieveDocumentTypeForComboboxUseCase,
    private readonly softDeleteDocumentTypeUseCase: SoftDeleteDocumentTypeUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new document type' })
  @ApiBody({ type: CreateDocumentTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Document type created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createDocumentTypeDto: CreateDocumentTypeDto,
    @Req() request: Request,
  ) {
    return this.createDocumentTypeUseCase.execute(
      createDocumentTypeDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of document types' })
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
    description: 'Document types retrieved successfully',
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
    return await this.findDocumentTypePaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update document type information' })
  @ApiParam({ name: 'id', description: 'Document type ID', example: 1 })
  @ApiBody({ type: UpdateDocumentTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Document type updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentTypeDto: UpdateDocumentTypeDto,
    @Req() request: Request,
  ) {
    return this.updateDocumentTypeUseCase.execute(
      id,
      updateDocumentTypeDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a document type' })
  @ApiParam({ name: 'id', description: 'Document type ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Document type archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteDocumentTypeUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a document type' })
  @ApiParam({ name: 'id', description: 'Document type ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Document type unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteDocumentTypeUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get document types for combobox dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Document types retrieved successfully for combobox',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox() {
    return this.retrieveDocumentTypeForComboboxUseCase.execute();
  }
}
