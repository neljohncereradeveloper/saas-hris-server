import { Injectable, Inject } from '@nestjs/common';
import { UploadPort } from '@features/shared/ports/upload.port';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class UploadService {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.UPLOAD_PORT)
    private readonly uploadPort: UploadPort,
  ) {}

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    metadata?: Record<string, string>,
    tags?: Record<string, string>,
    bucketName?: string,
  ) {
    return this.uploadPort.uploadFile(
      buffer,
      filename,
      mimetype,
      metadata,
      tags,
      bucketName,
    );
  }

  async getFile(filename: string) {
    return this.uploadPort.getFile(filename);
  }

  async getFileStream(filename: string) {
    return this.uploadPort.getFileStream(filename);
  }

  async getPreviewUrl(filename: string, expiresIn?: number) {
    return this.uploadPort.getPreviewUrl(filename, expiresIn);
  }

  async getDownloadUrl(filename: string, expiresIn?: number) {
    return this.uploadPort.getDownloadUrl(filename, expiresIn);
  }

  async getContractUrl(
    filename: string,
    responseDisposition?: 'inline' | 'attachment',
  ) {
    return this.uploadPort.getContractUrl(filename, responseDisposition);
  }

  async getPublicDocumentUrl(
    filename: string,
    responseDisposition?: 'inline' | 'attachment',
  ) {
    return this.uploadPort.getPublicDocumentUrl(filename, responseDisposition);
  }

  async getUrlByFileType(
    filename: string,
    fileType: 'image' | 'contract' | 'public-document' | 'temporary',
    responseDisposition?: 'inline' | 'attachment',
  ) {
    return this.uploadPort.getUrlByFileType(
      filename,
      fileType,
      responseDisposition,
    );
  }

  // Tag management methods
  async getObjectTags(filename: string) {
    return this.uploadPort.getObjectTags(filename);
  }

  async updateObjectTags(filename: string, tags: Record<string, string>) {
    return this.uploadPort.updateObjectTags(filename, tags);
  }

  async removeObjectTags(filename: string) {
    return this.uploadPort.removeObjectTags(filename);
  }
}
