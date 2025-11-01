import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { LeavePolicy } from '@features/leave-management/domain/models/leave-policy.model';

@Injectable()
export class FindLeavePolicyPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: LeavePolicy[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.leavePolicyRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
