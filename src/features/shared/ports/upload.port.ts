export interface UploadPort {
  uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    metadata?: Record<string, string>,
    tags?: Record<string, string>,
    bucketName?: string,
  ): Promise<{ url: string }>;
  getFile(filename: string): Promise<Buffer>;
  getFileStream(filename: string): Promise<any>;
  getPresignedUrl(
    filename: string,
    expiresIn?: number,
    responseDisposition?: 'inline' | 'attachment',
  ): Promise<string>;
  getPreviewUrl(filename: string, expiresIn?: number): Promise<string>;
  getDownloadUrl(filename: string, expiresIn?: number): Promise<string>;
  getContractUrl(
    filename: string,
    responseDisposition?: 'inline' | 'attachment',
  ): Promise<string>;
  getPublicDocumentUrl(
    filename: string,
    responseDisposition?: 'inline' | 'attachment',
  ): Promise<string>;
  getUrlByFileType(
    filename: string,
    fileType: 'image' | 'contract' | 'public-document' | 'temporary',
    responseDisposition?: 'inline' | 'attachment',
  ): Promise<string>;

  // Tag management methods
  getObjectTags(filename: string): Promise<Record<string, string>>;
  updateObjectTags(
    filename: string,
    tags: Record<string, string>,
  ): Promise<void>;
  removeObjectTags(filename: string): Promise<void>;
}
