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
import { UpdateCityCommand } from '@features/201-files/application/commands/city/update-city.command';
import { City } from '@features/201-files/domain/models/city.model';
import { CityRepository } from '@features/201-files/domain/repositories/city.repository';

@Injectable()
export class UpdateCityUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITY)
    private readonly cityRepository: CityRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateCityCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<City | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_CITY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_CITY,
          CONSTANTS_DATABASE_MODELS.CITY,
          userId,
          { id, dto },
          requestInfo,
          `Updated city: ${dto.desc1}`,
          `Failed to update city with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate city existence
            const cityResult = await this.cityRepository.findById(id, manager);
            if (!cityResult) {
              throw new NotFoundException('City not found');
            }

            // Update the city
            const updateSuccessfull = await this.cityRepository.update(
              id,
              new City(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('City update failed');
            }

            // Retrieve the updated city
            const city = await this.cityRepository.findById(id, manager);

            return city!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
