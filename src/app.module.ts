import { ErrorLoggerMiddleware } from 'src/features/shared/infrastructure/middlewares/error-logger.middleware';
import { RequestLoggerMiddleware } from 'src/features/shared/infrastructure/middlewares/request-logger.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Core201FileModule } from '@features/201-files/infrastructure/modules/core.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { UploadModule } from './features/upload/infrastructure/modules/upload.module';
import { CoreDocumentManagementModule } from './features/document-management/infrastructure/modules/core.module';
import { CoreLeaveManagementModule } from './features/leave-management/infrastructure/modules/core.module';
import { HolidayModule } from '@features/shared/infrastructure/modules/holiday/holiday.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostgresqlDatabaseModule,
    Core201FileModule,
    CoreDocumentManagementModule,
    CoreLeaveManagementModule,
    HolidayModule,
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'images'),
      serveRoot: '/images',
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware, ErrorLoggerMiddleware)
      .forRoutes('*'); // Logs all requests
  }
}
