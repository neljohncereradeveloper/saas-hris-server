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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CONSTANTS_CONTROLLERS } from '@shared/constants/controller.constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateDocumentUseCase } from '@features/document-management/application/use-cases/document/create-document.use-case';
import { UpdateDocumentUseCase } from '@features/document-management/application/use-cases/document/update-document.use-case';
import { FindDocumentPaginatedListUseCase } from '@features/document-management/application/use-cases/document/find-document-paginated-list.use-case';
import { SoftDeleteDocumentUseCase } from '@features/document-management/application/use-cases/document/soft-delete-document.use-case';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';

@ApiTags('Document')
@Controller(CONSTANTS_CONTROLLERS.DOCUMENT)
export class DocumentController {
  constructor(
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly updateDocumentUseCase: UpdateDocumentUseCase,
    private readonly findDocumentPaginatedListUseCase: FindDocumentPaginatedListUseCase,
    private readonly softDeleteDocumentUseCase: SoftDeleteDocumentUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document data with optional file upload',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Employment Contract' },
        fileName: { type: 'string', example: 'contract_2024.pdf' },
        filePath: {
          type: 'string',
          example: '/uploads/documents/contract_2024.pdf',
        },
        scope: {
          type: 'string',
          enum: ['Employee', 'General'],
          example: 'Employee',
        },
        employeeId: { type: 'number', example: 123 },
        documentType: { type: 'string', example: 'Contract' },
        description: {
          type: 'string',
          example: 'Employment contract for new hire',
        },
        expirationDate: {
          type: 'string',
          format: 'date',
          example: '2025-12-31',
        },
        targetDepartment: { type: 'string', example: 'Human Resources' },
        targetBranch: { type: 'string', example: 'Main Office' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload',
        },
      },
      required: ['title', 'scope'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    // Add file information to DTO if file is uploaded
    if (file) {
      createDocumentDto.fileBuffer = file.buffer;
      createDocumentDto.fileMimetype = file.mimetype;
      createDocumentDto.fileName = file.originalname;
    }

    return this.createDocumentUseCase.execute(
      createDocumentDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of document' })
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
    description: 'Document retrieved successfully',
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
    return await this.findDocumentPaginatedListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
    );
  }

  @Version('1') // API versioning
  @Put(':id')
  @ApiOperation({ summary: 'Update document information' })
  @ApiParam({ name: 'id', description: 'Document ID', example: 1 })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Req() request: Request,
  ) {
    return this.updateDocumentUseCase.execute(
      id,
      updateDocumentDto,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive a document' })
  @ApiParam({ name: 'id', description: 'Document ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Document archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteDocumentUseCase.execute(
      id,
      false,
      (request as any).user?.id || 'system',
    );
  }

  @Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a document' })
  @ApiParam({ name: 'id', description: 'Document ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Document unarchived successfully',
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.softDeleteDocumentUseCase.execute(
      id,
      true,
      (request as any).user?.id || 'system',
    );
  }
}
