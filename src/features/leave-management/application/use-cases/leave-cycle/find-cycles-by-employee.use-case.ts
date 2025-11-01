import { LeaveCycleRepository } from '@features/leave-management/domain/repositories/leave-cycle.repository';
import { LeaveCycle } from '@features/leave-management/domain/models/leave-cycle.model';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';

@Injectable()
export class FindCyclesByEmployeeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_CYCLE)
    private readonly leaveCycleRepository: LeaveCycleRepository,
  ) {}

  async execute(employeeId: number): Promise<LeaveCycle[]> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_LEAVE_CYCLE_BY_ID,
      async (manager) => {
        return this.leaveCycleRepository.findByEmployee(employeeId, manager);
      },
    );
  }
}
