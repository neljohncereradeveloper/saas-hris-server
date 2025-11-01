import { ErrorLoggerMiddleware } from 'src/features/shared/infrastructure/middlewares/error-logger.middleware';
import { RequestLoggerMiddleware } from 'src/features/shared/infrastructure/middlewares/request-logger.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Core201FileModule } from '@features/201-files/infrastructure/modules/core.module';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CoreLeaveManagementModule } from './features/leave-management/infrastructure/modules/core.module';
import { HolidayModule } from '@features/shared/infrastructure/modules/holiday/holiday.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostgresqlDatabaseModule,
    Core201FileModule,
    CoreLeaveManagementModule,
    HolidayModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware, ErrorLoggerMiddleware)
      .forRoutes('*'); // Logs all requests
  }
}
