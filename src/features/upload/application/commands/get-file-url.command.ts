export class GetFileUrlCommand {
  filename: string;
  fileType: 'image' | 'contract' | 'public-document' | 'temporary';
  responseDisposition?: 'inline' | 'attachment';

  constructor(dto: {
    filename: string;
    fileType: 'image' | 'contract' | 'public-document' | 'temporary';
    responseDisposition?: 'inline' | 'attachment';
  }) {
    this.filename = dto.filename;
    this.fileType = dto.fileType;
    this.responseDisposition = dto.responseDisposition;
  }
}
