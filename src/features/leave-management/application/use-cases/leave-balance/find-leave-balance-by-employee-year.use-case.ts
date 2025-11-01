import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { LeaveBalance } from '@features/leave-management/domain/models/leave-balance.model';

@Injectable()
export class FindLeaveBalanceByEmployeeYearUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE)
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
  ) {}

  async execute(employeeId: number, year: number): Promise<LeaveBalance[]> {
    const leaveBalances = await this.leaveBalanceRepository.findByEmployeeYear(
      employeeId,
      year,
    );

    return leaveBalances;
  }
}
