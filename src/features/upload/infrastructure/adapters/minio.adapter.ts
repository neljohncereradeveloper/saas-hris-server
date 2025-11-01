import { Injectable, Inject } from '@nestjs/common';
import { Client, S3Error } from 'minio';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@features/shared/exceptions/shared';
import { UploadPort } from '@features/shared/ports/upload.port';

@Injectable()
export class MinioAdapter implements UploadPort {
  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    metadata?: Record<string, string>,
    tags?: Record<string, string>,
    bucketName?: string,
  ) {
    // Use provided bucket name or fallback to default
    const targetBucket =
      bucketName || this.configService.get<string>('MINIO_BUCKET') || 'ampc';

    // Check if bucket exists, create if not
    const bucketExists = await this.minioClient.bucketExists(targetBucket);
    if (!bucketExists) {
      await this.minioClient.makeBucket(targetBucket);
    }

    // Prepare metadata for MinIO
    const minioMetadata = {
      'Content-Type': mimetype,
      'Content-Disposition': 'inline',
      ...metadata, // Add custom metadata
    };

    // Upload file to bucket with metadata
    const data = await this.minioClient.putObject(
      targetBucket,
      filename,
      buffer,
      minioMetadata as any,
    );

    // Set tags if provided
    if (tags && Object.keys(tags).length > 0) {
      try {
        await this.minioClient.setObjectTagging(targetBucket, filename, tags);
        console.log('Set tags for file:', filename, tags);
      } catch (error) {
        console.warn('Failed to set tags for file:', filename, error);
        // Don't throw error for tag failures, just log warning
      }
    }

    return {
      url: `${this.configService.get('MINIO_ENDPOINT')}/${targetBucket}/${filename}`,
    };
  }

  async getFile(filename: string) {
    const bucketName = this.configService.get<string>('MINIO_BUCKET');

    try {
      const stream = await this.minioClient.getObject(
        bucketName || 'ampc',
        filename,
      );

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      return new Promise<Buffer>((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (error) => reject(error));
      });
    } catch (error: any) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found in minio ${filename}`);
      }
      throw error;
    }
  }

  async getFileStream(filename: string) {
    const bucketName = this.configService.get<string>('MINIO_BUCKET');

    try {
      return await this.minioClient.getObject(bucketName || 'ampc', filename);
    } catch (error: any) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found in minio ${filename}`);
      }
      throw error;
    }
  }

  /**
   * Generate a presigned URL for file access
   * @param filename - The filename in the bucket
   * @param expiresIn - Expiration time in seconds (default: 7 days)
   * @param responseDisposition - 'inline' for preview, 'attachment' for download
   */
  async getPresignedUrl(
    filename: string,
    expiresIn: number = 7 * 24 * 60 * 60, // 7 days
    responseDisposition: 'inline' | 'attachment' = 'inline',
  ): Promise<string> {
    const bucketName = this.configService.get<string>('MINIO_BUCKET');

    try {
      const url = await this.minioClient.presignedGetObject(
        bucketName || 'ampc',
        filename,
        expiresIn,
        {
          'response-content-disposition': responseDisposition,
        },
      );
      return url;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found in minio ${filename}`);
      }
      throw error;
    }
  }

  /**
   * Generate a presigned URL specifically for previewing files
   */
  async getPreviewUrl(
    filename: string,
    expiresIn: number = 7 * 24 * 60 * 60,
  ): Promise<string> {
    return this.getPresignedUrl(filename, expiresIn, 'inline');
  }

  /**
   * Generate a presigned URL specifically for downloading files
   */
  async getDownloadUrl(
    filename: string,
    expiresIn: number = 7 * 24 * 60 * 60,
  ): Promise<string> {
    return this.getPresignedUrl(filename, expiresIn, 'attachment');
  }

  /**
   * Generate a presigned URL for contracts and sensitive documents
   * Shorter expiration for security (1 hour)
   */
  async getContractUrl(
    filename: string,
    responseDisposition: 'inline' | 'attachment' = 'attachment',
  ): Promise<string> {
    // const expiresIn = 60 * 60; // 1 hour for contracts
    const expiresIn = 30; // 1 hour for contracts
    return this.getPresignedUrl(filename, expiresIn, responseDisposition);
  }

  /**
   * Generate a presigned URL for public documents (longer expiration)
   * Longer expiration for public documents (30 days)
   */
  async getPublicDocumentUrl(
    filename: string,
    responseDisposition: 'inline' | 'attachment' = 'inline',
  ): Promise<string> {
    const expiresIn = 30 * 24 * 60 * 60; // 30 days for public documents
    return this.getPresignedUrl(filename, expiresIn, responseDisposition);
  }

  /**
   * Generate a presigned URL with custom expiration based on file type
   */
  async getUrlByFileType(
    filename: string,
    fileType: 'image' | 'contract' | 'public-document' | 'temporary',
    responseDisposition: 'inline' | 'attachment' = 'inline',
  ): Promise<string> {
    let expiresIn: number;

    switch (fileType) {
      case 'image':
        expiresIn = 7 * 24 * 60 * 60; // 7 days
        break;
      case 'contract':
        expiresIn = 60 * 60; // 1 hour
        break;
      case 'public-document':
        expiresIn = 30 * 24 * 60 * 60; // 30 days
        break;
      case 'temporary':
        expiresIn = 15 * 60; // 15 minutes
        break;
      default:
        expiresIn = 7 * 24 * 60 * 60; // 7 days default
    }

    return this.getPresignedUrl(filename, expiresIn, responseDisposition);
  }

  /**
   * Get tags for a specific object
   */
  async getObjectTags(filename: string): Promise<Record<string, string>> {
    const bucketName = this.configService.get<string>('MINIO_BUCKET');

    try {
      const tags = await this.minioClient.getObjectTagging(
        bucketName || 'ampc',
        filename,
      );
      // Convert Tag[] to Record<string, string>
      const tagRecord: Record<string, string> = {};
      tags.forEach((tag) => {
        tagRecord[tag.Key] = tag.Value;
      });
      return tagRecord;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found in minio ${filename}`);
      }
      throw error;
    }
  }

  /**
   * Update tags for a specific object
   */
  async updateObjectTags(
    filename: string,
    tags: Record<string, string>,
  ): Promise<void> {
    const bucketName = this.configService.get<string>('MINIO_BUCKET');

    try {
      await this.minioClient.setObjectTagging(
        bucketName || 'ampc',
        filename,
        tags,
      );
    } catch (error: any) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found in minio ${filename}`);
      }
      throw error;
    }
  }

  /**
   * Remove all tags from a specific object
   */
  async removeObjectTags(filename: string): Promise<void> {
    const bucketName = this.configService.get<string>('MINIO_BUCKET');

    try {
      // Remove all tags by setting empty tags object
      await this.minioClient.setObjectTagging(
        bucketName || 'ampc',
        filename,
        {}, // Empty object removes all tags
      );
    } catch (error: any) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found in minio ${filename}`);
      }
      throw error;
    }
  }
}
