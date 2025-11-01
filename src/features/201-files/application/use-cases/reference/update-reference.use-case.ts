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
import { UpdateReferenceCommand } from '@features/201-files/application/commands/reference/update-reference.command';
import { Reference } from '@features/201-files/domain/models/reference.model';
import { ReferenceRepository } from '@features/201-files/domain/repositories/reference.repository';

@Injectable()
export class UpdateReferenceUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.REFERENCE)
    private readonly referenceRepository: ReferenceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateReferenceCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Reference | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_REFERENCE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_REFERENCE,
          CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId,
          { id, dto },
          requestInfo,
          `Updated reference: ${dto.fname} ${dto.lname}`,
          `Failed to update reference with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate reference existence
            const referenceResult = await this.referenceRepository.findById(
              id,
              manager,
            );
            if (!referenceResult) {
              throw new NotFoundException('Reference not found');
            }

            // Update the reference
            const updateSuccessfull = await this.referenceRepository.update(
              id,
              new Reference(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Reference update failed');
            }

            // Retrieve the updated reference
            const reference = await this.referenceRepository.findById(
              id,
              manager,
            );

            return reference!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
