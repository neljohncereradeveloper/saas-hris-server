import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { Branch } from '@features/201-files/domain/models/branch.model';

@Injectable()
export class FindBranchPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BRANCH)
    private readonly branchRepository: BranchRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Branch[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.branchRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
