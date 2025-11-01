import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { LeavePolicy } from '@features/leave-management/domain/models/leave-policy.model';

@Injectable()
export class GetActivePolicyUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
  ) {}

  async execute(leaveTypeId: number): Promise<LeavePolicy | null> {
    const activePolicy =
      await this.leavePolicyRepository.getActivePolicy(leaveTypeId);

    return activePolicy;
  }
}
