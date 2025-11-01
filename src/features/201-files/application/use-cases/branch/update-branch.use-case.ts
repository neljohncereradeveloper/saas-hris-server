import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import {
  SomethinWentWrongException,
  NotFoundException,
  ConflictException,
} from '@features/shared/exceptions/shared';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { UpdateBranchCommand } from '@features/201-files/application/commands/branch/update-branch.command';
import { Branch } from '@features/201-files/domain/models/branch.model';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';

@Injectable()
export class UpdateBranchUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BRANCH)
    private readonly branchRepository: BranchRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateBranchCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Branch | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_BRANCH,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_BRANCH,
          CONSTANTS_DATABASE_MODELS.BRANCH,
          userId,
          { id, dto },
          requestInfo,
          `Updated branch: ${dto.desc1}`,
          `Failed to update branch with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate branch existence
            const branchResult = await this.branchRepository.findById(
              id,
              manager,
            );
            if (!branchResult) {
              throw new NotFoundException('Branch not found');
            }

            // Check for duplicate branch code (excluding current branch)
            const existingBranchCode = await this.branchRepository.findByBrCode(
              dto.brCode,
              manager,
            );
            if (existingBranchCode && existingBranchCode.id !== id) {
              throw new ConflictException('Branch code already exists');
            }

            // Check for duplicate description (excluding current branch)
            const existingDescription =
              await this.branchRepository.findByDescription(dto.desc1, manager);
            if (existingDescription && existingDescription.id !== id) {
              throw new ConflictException('Branch description already exists');
            }

            // Update the branch
            const updateSuccessfull = await this.branchRepository.update(
              id,
              new Branch(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Branch update failed');
            }

            // Retrieve the updated branch
            const branch = await this.branchRepository.findById(id, manager);

            return branch!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
