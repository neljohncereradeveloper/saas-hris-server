import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { BarangayRepository } from '@features/201-files/domain/repositories/barangay.repository';
import { Barangay } from '@features/201-files/domain/models/barangay.model';

@Injectable()
export class FindBarangayPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BARANGAY)
    private readonly barangayRepository: BarangayRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Barangay[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.barangayRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
