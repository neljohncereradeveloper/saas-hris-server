import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { JobTitle } from '@features/201-files/domain/models/jobtitle.model';

@Injectable()
export class FindJobTitlePaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE)
    private readonly jobtitleRepository: JobTitleRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: JobTitle[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.jobtitleRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
