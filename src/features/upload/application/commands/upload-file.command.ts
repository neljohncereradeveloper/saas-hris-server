export class UploadFileCommand {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  fileType: 'image' | 'contract' | 'public-document' | 'temporary';

  constructor(dto: {
    buffer: Buffer;
    filename: string;
    mimetype: string;
    fileType: 'image' | 'contract' | 'public-document' | 'temporary';
  }) {
    this.buffer = dto.buffer;
    this.filename = dto.filename;
    this.mimetype = dto.mimetype;
    this.fileType = dto.fileType;
  }
}
