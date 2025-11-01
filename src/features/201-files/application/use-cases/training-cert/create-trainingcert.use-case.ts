import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateTrainingCertificateCommand } from '@features/201-files/application/commands/training-certificate/create-training-certificate.command';

@Injectable()
export class CreateTrainingCertUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT)
    private readonly trainingcertRepository: TrainingCertRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateTrainingCertificateCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<TrainingCert> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_TRAININGCERT,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_TRAININGCERT,
          CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId,
          dto,
          requestInfo,
          `Created new training certificate: ${dto.desc1}`,
          `Failed to create training certificate: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the trainingcert
            const trainingcert = await this.trainingcertRepository.create(
              new TrainingCert(dto),
              manager,
            );

            return trainingcert;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
