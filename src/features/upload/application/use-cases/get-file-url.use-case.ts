import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { UploadPort } from '@features/shared/ports/upload.port';
import { GetFileUrlCommand } from '../commands/get-file-url.command';

@Injectable()
export class GetFileUrlUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.UPLOAD_PORT)
    private readonly uploadPort: UploadPort,
  ) {}

  async execute(
    dto: GetFileUrlCommand,
  ): Promise<{ url: string; expiresIn: string; securityNote?: string }> {
    const url = await this.uploadPort.getUrlByFileType(
      dto.filename,
      dto.fileType,
      dto.responseDisposition,
    );

    let expiresIn: string;
    let securityNote: string | undefined;

    switch (dto.fileType) {
      case 'image':
        expiresIn = '7 days';
        break;
      case 'contract':
        expiresIn = '1 hour';
        securityNote = 'This URL expires in 1 hour for security';
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
      url,
      expiresIn,
      securityNote,
    };
  }
}
