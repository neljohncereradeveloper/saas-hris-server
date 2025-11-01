import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { UploadController } from './controller/upload.controller';
import { UploadService } from '../services/upload.service';
import { MinioAdapter } from '../adapters/minio.adapter';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { UploadFileUseCase } from '../../application/use-cases/upload-file.use-case';
import { GetFileUrlUseCase } from '../../application/use-cases/get-file-url.use-case';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Global()
@Module({
  controllers: [UploadController],
  imports: [ConfigModule, PostgresqlDatabaseModule],
  providers: [
    {
      provide: 'MINIO_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Minio.Client({
          endPoint: configService.get<string>('MINIO_ENDPOINT') || '',
          port: configService.get<number>('MINIO_PORT'),
          useSSL: false,
          accessKey: configService.get<string>('MINIO_ACCESS_KEY') || '',
          secretKey: configService.get<string>('MINIO_SECRET_KEY') || '',
        });
      },
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.UPLOAD_PORT,
      useClass: MinioAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    },
    MinioAdapter,
    UploadService,
    UploadFileUseCase,
    GetFileUrlUseCase,
  ],
  exports: [
    'MINIO_CLIENT',
    CONSTANTS_REPOSITORY_TOKENS.UPLOAD_PORT,
    MinioAdapter,
    UploadService,
    UploadFileUseCase,
    GetFileUrlUseCase,
  ],
})
export class UploadModule {}
