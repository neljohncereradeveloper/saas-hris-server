import { Module } from '@nestjs/common';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';

@Module({
  providers: [
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
  ],
  exports: [
    CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
    CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
  ],
})
export class ErrorHandlerModule {}
