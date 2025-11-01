import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
import { Religion } from '@features/201-files/domain/models/religion.model';

@Injectable()
export class FindReligionPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.RELIGION)
    private readonly religionRepository: ReligionRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Religion[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.religionRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
