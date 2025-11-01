export class FilenameUtil {
  static sanitizeFilename(filename: string): string {
    // Remove path, special chars, keep alphanumeric and basic punctuation
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/\.+/g, '.')
      .replace(/-+/g, '-')
      .toLowerCase();
  }

  static generateStorageFilename(metadata: {
    scope: string;
    employeeId?: number;
    documentType?: string;
    originalFilename: string;
  }): string {
    const timestamp = Date.now();
    const sanitized = FilenameUtil.sanitizeFilename(
      metadata.originalFilename.replace(/\.[^/.]+$/, ''),
    );
    const extension = FilenameUtil.extractExtension(metadata.originalFilename);
    const identifier = metadata.employeeId || '';
    const docType = (metadata.documentType || '')
      .toLowerCase()
      .replace(/\s+/g, '-');

    return `${metadata.scope.toLowerCase()}_${identifier}_${docType}_${sanitized}_${timestamp}.${extension}`;
  }

  static extractExtension(filename: string): string {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  }

  static validateExtension(
    extension: string,
    allowedTypes?: string[],
  ): boolean {
    if (!allowedTypes || allowedTypes.length === 0) return true;
    return allowedTypes.includes(extension.toLowerCase());
  }
}
