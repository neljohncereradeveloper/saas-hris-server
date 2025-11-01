import { Training } from '@features/201-files/domain/models/training.model';
import { TrainingRepository } from '@features/201-files/domain/repositories/training.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateTrainingCommand } from '@features/201-files/application/commands/training/create-training.command';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { NotFoundException } from '@features/shared/exceptions/shared';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';

@Injectable()
export class CreateTrainingUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAINING)
    private readonly trainingRepository: TrainingRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT)
    private readonly trainingCertificateRepository: TrainingCertRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateTrainingCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Training> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_TRAINING,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_TRAINING,
          CONSTANTS_DATABASE_MODELS.TRAINING,
          userId,
          dto,
          requestInfo,
          `Created new training For Employee: ${dto.employeeId}`,
          `Failed to create training For Employee: ${dto.employeeId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Check if the employee exists
            const employee = await this.employeeRepository.findById(
              dto.employeeId,
              manager,
            );
            if (!employee) {
              throw new NotFoundException(
                `Employee with ID ${dto.employeeId} not found`,
              );
            }
            const certificate =
              await this.trainingCertificateRepository.findByDescription(
                dto.empTrainingsCertificate,
                manager,
              );
            if (!certificate) {
              throw new NotFoundException('Training certificate not found');
            }
            // Create the training
            const training = await this.trainingRepository.create(
              new Training({
                trainingDate: dto.trainingDate,
                trainingsCertId: certificate.id!,
                trainingTitle: dto.trainingTitle,
                desc1: dto.desc1,
                employeeId: dto.employeeId,
              }),
              manager,
            );

            return training;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
