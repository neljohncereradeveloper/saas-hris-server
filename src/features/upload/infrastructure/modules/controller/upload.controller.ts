import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from '../../services/upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('image/:filename')
  @ApiOperation({ summary: 'Get image by filename' })
  @ApiParam({
    name: 'filename',
    description: 'Image filename with extension',
    example: 'profile-picture.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Image retrieved successfully',
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/gif': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
      'image/svg+xml': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const stream = await this.uploadService.getFileStream(filename);

      // Determine content type based on file extension
      const extension = filename.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';

      switch (extension) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
        default:
          contentType = 'image/jpeg'; // default fallback
      }

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      });

      stream.pipe(res);
    } catch (error: any) {
      res.status(404).json({
        message: 'Image not found',
        error: error.message,
      });
    }
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WebP, SVG)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Image uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'profile-picture.jpg' },
            mimetype: { type: 'string', example: 'image/jpeg' },
            size: { type: 'number', example: 1024000 },
            fileType: { type: 'string', example: 'image' },
            expiresIn: { type: 'string', example: '7 days' },
            previewUrl: {
              type: 'string',
              example: 'https://minio.example.com/preview/profile-picture.jpg',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - image file is required',
  })
  @ApiBearerAuth('JWT-auth')
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const result = await this.uploadService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Generate preview URL for the uploaded image
    const previewUrl = await this.uploadService.getPreviewUrl(
      file.originalname,
    );

    return {
      message: 'Image uploaded successfully',
      data: {
        ...result,
        previewUrl,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileType: 'image',
        expiresIn: '7 days',
      },
    };
  }

  @Post('contract')
  @UseInterceptors(FileInterceptor('contract'))
  @ApiOperation({ summary: 'Upload a contract file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Contract file to upload',
    schema: {
      type: 'object',
      properties: {
        contract: {
          type: 'string',
          format: 'binary',
          description: 'Contract file (PDF, DOC, DOCX)',
        },
      },
      required: ['contract'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Contract uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Contract uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'employment-contract.pdf' },
            mimetype: { type: 'string', example: 'application/pdf' },
            size: { type: 'number', example: 2048000 },
            fileType: { type: 'string', example: 'contract' },
            expiresIn: { type: 'string', example: '1 hour' },
            contractUrl: {
              type: 'string',
              example:
                'https://minio.example.com/contract/employment-contract.pdf',
            },
            securityNote: {
              type: 'string',
              example: 'This URL expires in 1 hour for security',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - contract file is required',
  })
  @ApiBearerAuth('JWT-auth')
  async uploadContract(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Contract file is required');
    }

    const result = await this.uploadService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Generate contract URL with 1 hour expiration
    const contractUrl = await this.uploadService.getContractUrl(
      file.originalname,
    );

    return {
      message: 'Contract uploaded successfully',
      data: {
        ...result,
        contractUrl,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileType: 'contract',
        expiresIn: '1 hour',
        securityNote: 'This URL expires in 1 hour for security',
      },
    };
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('document'))
  @ApiOperation({ summary: 'Upload a public document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file to upload',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF, DOC, DOCX, TXT)',
        },
      },
      required: ['document'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Document uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'policy-document.pdf' },
            mimetype: { type: 'string', example: 'application/pdf' },
            size: { type: 'number', example: 1536000 },
            fileType: { type: 'string', example: 'public-document' },
            expiresIn: { type: 'string', example: '30 days' },
            documentUrl: {
              type: 'string',
              example: 'https://minio.example.com/public/policy-document.pdf',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - document file is required',
  })
  @ApiBearerAuth('JWT-auth')
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Document file is required');
    }

    const result = await this.uploadService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Generate public document URL with 30 days expiration
    const documentUrl = await this.uploadService.getPublicDocumentUrl(
      file.originalname,
    );

    return {
      message: 'Document uploaded successfully',
      data: {
        ...result,
        documentUrl,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileType: 'public-document',
        expiresIn: '30 days',
      },
    };
  }

  @Post('file/:fileType')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file by type' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'fileType',
    description: 'Type of file to upload',
    enum: ['image', 'contract', 'public-document', 'temporary'],
    example: 'image',
  })
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'image uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'document.pdf' },
            mimetype: { type: 'string', example: 'application/pdf' },
            size: { type: 'number', example: 1024000 },
            fileType: { type: 'string', example: 'image' },
            expiresIn: { type: 'string', example: '7 days' },
            url: {
              type: 'string',
              example: 'https://minio.example.com/preview/document.pdf',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - file is required' })
  @ApiBearerAuth('JWT-auth')
  async uploadFileByType(
    @Param('fileType')
    fileType: 'image' | 'contract' | 'public-document' | 'temporary',
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const result = await this.uploadService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Generate URL based on file type
    const url = await this.uploadService.getUrlByFileType(
      file.originalname,
      fileType,
    );

    let expiresIn: string;
    switch (fileType) {
      case 'image':
        expiresIn = '7 days';
        break;
      case 'contract':
        expiresIn = '1 hour';
        break;
      case 'public-document':
        expiresIn = '30 days';
        break;
      case 'temporary':
        expiresIn = '15 minutes';
        break;
      default:
        expiresIn = '7 days';
    }

    return {
      message: `${fileType} uploaded successfully`,
      data: {
        ...result,
        url,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileType,
        expiresIn,
      },
    };
  }

  @Get('preview/:filename')
  @ApiOperation({ summary: 'Get preview URL by filename' })
  @ApiParam({
    name: 'filename',
    description: 'File filename with extension',
    example: 'profile-picture.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Preview URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Preview URL generated successfully',
        },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'profile-picture.jpg' },
            previewUrl: {
              type: 'string',
              example: 'https://minio.example.com/preview/profile-picture.jpg',
            },
            expiresIn: { type: 'string', example: '7 days' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Failed to generate preview URL' })
  @ApiBearerAuth('JWT-auth')
  async getPreviewUrl(@Param('filename') filename: string) {
    try {
      const previewUrl = await this.uploadService.getPreviewUrl(filename);
      return {
        message: 'Preview URL generated successfully',
        data: {
          filename,
          previewUrl,
          expiresIn: '7 days',
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate preview URL: ${error.message}`,
      );
    }
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Get download URL by filename' })
  @ApiParam({
    name: 'filename',
    description: 'File filename with extension',
    example: 'document.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Download URL generated successfully',
        },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'document.pdf' },
            downloadUrl: {
              type: 'string',
              example: 'https://minio.example.com/download/document.pdf',
            },
            expiresIn: { type: 'string', example: '7 days' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Failed to generate download URL' })
  @ApiBearerAuth('JWT-auth')
  async getDownloadUrl(@Param('filename') filename: string) {
    try {
      const downloadUrl = await this.uploadService.getDownloadUrl(filename);
      return {
        message: 'Download URL generated successfully',
        data: {
          filename,
          downloadUrl,
          expiresIn: '7 days',
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate download URL: ${error.message}`,
      );
    }
  }

  @Get('contract/:filename')
  @ApiOperation({ summary: 'Get contract URL by filename' })
  @ApiParam({
    name: 'filename',
    description: 'Contract filename with extension',
    example: 'employment-contract.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Contract URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Contract URL generated successfully',
        },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'employment-contract.pdf' },
            contractUrl: {
              type: 'string',
              example:
                'https://minio.example.com/contract/employment-contract.pdf',
            },
            expiresIn: { type: 'string', example: '1 hour' },
            securityNote: {
              type: 'string',
              example: 'This URL expires in 1 hour for security',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Failed to generate contract URL' })
  @ApiBearerAuth('JWT-auth')
  async getContractUrl(@Param('filename') filename: string) {
    try {
      const contractUrl = await this.uploadService.getContractUrl(filename);
      return {
        message: 'Contract URL generated successfully',
        data: {
          filename,
          contractUrl,
          expiresIn: '1 hour',
          securityNote: 'This URL expires in 1 hour for security',
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate contract URL: ${error.message}`,
      );
    }
  }

  @Get('public-document/:filename')
  @ApiOperation({ summary: 'Get public document URL by filename' })
  @ApiParam({
    name: 'filename',
    description: 'Document filename with extension',
    example: 'policy-document.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Public document URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Public document URL generated successfully',
        },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'policy-document.pdf' },
            publicUrl: {
              type: 'string',
              example: 'https://minio.example.com/public/policy-document.pdf',
            },
            expiresIn: { type: 'string', example: '30 days' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to generate public document URL',
  })
  @ApiBearerAuth('JWT-auth')
  async getPublicDocumentUrl(@Param('filename') filename: string) {
    try {
      const publicUrl = await this.uploadService.getPublicDocumentUrl(filename);
      return {
        message: 'Public document URL generated successfully',
        data: {
          filename,
          publicUrl,
          expiresIn: '30 days',
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate public document URL: ${error.message}`,
      );
    }
  }

  @Get('url-by-type/:fileType/:filename')
  @ApiOperation({ summary: 'Get URL by file type and filename' })
  @ApiParam({
    name: 'fileType',
    description: 'Type of file',
    enum: ['image', 'contract', 'public-document', 'temporary'],
    example: 'image',
  })
  @ApiParam({
    name: 'filename',
    description: 'File filename with extension',
    example: 'document.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'image URL generated successfully',
        },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'document.pdf' },
            url: {
              type: 'string',
              example: 'https://minio.example.com/preview/document.pdf',
            },
            fileType: { type: 'string', example: 'image' },
            expiresIn: { type: 'string', example: '7 days' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Failed to generate URL' })
  @ApiBearerAuth('JWT-auth')
  async getUrlByFileType(
    @Param('fileType')
    fileType: 'image' | 'contract' | 'public-document' | 'temporary',
    @Param('filename') filename: string,
  ) {
    try {
      const url = await this.uploadService.getUrlByFileType(filename, fileType);

      let expiresIn: string;
      switch (fileType) {
        case 'image':
          expiresIn = '7 days';
          break;
        case 'contract':
          expiresIn = '1 hour';
          break;
        case 'public-document':
          expiresIn = '30 days';
          break;
        case 'temporary':
          expiresIn = '15 minutes';
          break;
        default:
          expiresIn = '7 days';
      }

      return {
        message: `${fileType} URL generated successfully`,
        data: {
          filename,
          url,
          fileType,
          expiresIn,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate ${fileType} URL: ${error.message}`,
      );
    }
  }
}
