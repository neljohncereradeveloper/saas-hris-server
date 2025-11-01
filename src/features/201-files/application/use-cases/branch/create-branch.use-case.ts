import { Branch } from '@features/201-files/domain/models/branch.model';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateBranchCommand } from '@features/201-files/application/commands/branch/create-branch.command';
import { ConflictException } from '@features/shared/exceptions/shared';

@Injectable()
export class CreateBranchUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BRANCH)
    private readonly branchRepository: BranchRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateBranchCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Branch> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_BRANCH,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_BRANCH,
          CONSTANTS_DATABASE_MODELS.BRANCH,
          userId,
          dto,
          requestInfo,
          `Created new branch: ${dto.desc1}`,
          `Failed to create branch: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Check for duplicate branch code
            const existingBranchCode = await this.branchRepository.findByBrCode(
              dto.brCode,
              manager,
            );
            if (existingBranchCode) {
              throw new ConflictException('Branch code already exists');
            }

            // Check for duplicate description
            const existingDescription =
              await this.branchRepository.findByDescription(dto.desc1, manager);
            if (existingDescription) {
              throw new ConflictException('Branch description already exists');
            }

            // Create the branch
            const branch = await this.branchRepository.create(
              new Branch(dto),
              manager,
            );

            return branch;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
