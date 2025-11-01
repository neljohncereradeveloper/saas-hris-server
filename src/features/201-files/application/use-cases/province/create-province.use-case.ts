import { Province } from '@features/201-files/domain/models/province.model';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateProvinceCommand } from '@features/201-files/application/commands/province/create-province.command';

@Injectable()
export class CreateProvinceUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.PROVINCE)
    private readonly provinceRepository: ProvinceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateProvinceCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Province> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_PROVINCE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_PROVINCE,
          CONSTANTS_DATABASE_MODELS.PROVINCE,
          userId,
          dto,
          requestInfo,
          `Created new province: ${dto.desc1}`,
          `Failed to create province: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the province
            const province = await this.provinceRepository.create(
              new Province(dto),
              manager,
            );

            return province;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
