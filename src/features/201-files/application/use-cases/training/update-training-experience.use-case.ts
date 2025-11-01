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
import { UpdateTrainingCommand } from '@features/201-files/application/commands/training/update-training.command';
import { Training } from '@features/201-files/domain/models/training.model';
import { TrainingRepository } from '@features/201-files/domain/repositories/training.repository';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
@Injectable()
export class UpdateTrainingUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAINING)
    private readonly trainingRepository: TrainingRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT)
    private readonly trainingCertificateRepository: TrainingCertRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateTrainingCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Training | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_TRAINING,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_TRAINING,
          CONSTANTS_DATABASE_MODELS.TRAINING,
          userId,
          { id, dto },
          requestInfo,
          `Updated training: ${dto.trainingTitle}`,
          `Failed to update training with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate trainingExperience existence
            const trainingExperienceResult =
              await this.trainingRepository.findById(id, manager);
            if (!trainingExperienceResult) {
              throw new NotFoundException('Training not found');
            }

            // Check if the certificate exists
            const certificate =
              await this.trainingCertificateRepository.findByDescription(
                dto.empTrainingsCertificate,
                manager,
              );
            if (!certificate) {
              throw new NotFoundException('Training certificate not found');
            }

            // Update the trainingExperience
            const updateSuccessfull = await this.trainingRepository.update(
              id,
              new Training({
                trainingDate: dto.trainingDate,
                trainingsCertId: certificate.id!,
                trainingTitle: dto.trainingTitle,
                desc1: dto.desc1,
              }),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Training update failed');
            }

            // Retrieve the updated trainingExperience
            const training = await this.trainingRepository.findById(
              id,
              manager,
            );

            return training!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
