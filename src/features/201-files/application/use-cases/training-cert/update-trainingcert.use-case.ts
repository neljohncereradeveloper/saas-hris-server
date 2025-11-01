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
import { UpdateTrainingCertificateCommand } from '@features/201-files/application/commands/training-certificate/update-training-certificate.command';
import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';

@Injectable()
export class UpdateTrainingCertUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT)
    private readonly trainingcertRepository: TrainingCertRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateTrainingCertificateCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<TrainingCert | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_TRAININGCERT,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_TRAININGCERT,
          CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId,
          { id, dto },
          requestInfo,
          `Updated training certificate: ${dto.desc1}`,
          `Failed to update training certificate with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate trainingcert existence
            const trainingcertResult =
              await this.trainingcertRepository.findById(id, manager);
            if (!trainingcertResult) {
              throw new NotFoundException('Trainingcert not found');
            }

            // Update the trainingcert
            const updateSuccessfull = await this.trainingcertRepository.update(
              id,
              new TrainingCert(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException(
                'Trainingcert update failed',
              );
            }

            // Retrieve the updated trainingcert
            const trainingcert = await this.trainingcertRepository.findById(
              id,
              manager,
            );

            return trainingcert!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
