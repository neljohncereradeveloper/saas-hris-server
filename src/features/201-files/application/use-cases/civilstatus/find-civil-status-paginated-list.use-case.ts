import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { CivilStatus } from '@features/201-files/domain/models/civilstatus.model';

@Injectable()
export class FindCivilStatusPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS)
    private readonly civilStatusRepository: CivilStatusRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: CivilStatus[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.civilStatusRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
