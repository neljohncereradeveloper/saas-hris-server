import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { LeaveType } from '@features/leave-management/domain/models/leave-type.model';

@Injectable()
export class FindLeaveTypePaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: LeaveType[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.leaveTypeRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
