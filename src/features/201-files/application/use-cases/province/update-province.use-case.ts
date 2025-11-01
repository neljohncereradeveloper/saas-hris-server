import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import {
  SomethinWentWrongException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { UpdateProvinceCommand } from '@features/201-files/application/commands/province/update-province.command';
import { Province } from '@features/201-files/domain/models/province.model';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';

@Injectable()
export class UpdateProvinceUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.PROVINCE)
    private readonly provinceRepository: ProvinceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateProvinceCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Province | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_PROVINCE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_PROVINCE,
          CONSTANTS_DATABASE_MODELS.PROVINCE,
          userId,
          { id, dto },
          requestInfo,
          `Updated province: ${dto.desc1}`,
          `Failed to update province with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate province existence
            const provinceResult = await this.provinceRepository.findById(
              id,
              manager,
            );
            if (!provinceResult) {
              throw new NotFoundException('Province not found');
            }

            // Update the province
            const updateSuccessfull = await this.provinceRepository.update(
              id,
              new Province(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Province update failed');
            }

            // Retrieve the updated province
            const province = await this.provinceRepository.findById(
              id,
              manager,
            );

            return province!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
