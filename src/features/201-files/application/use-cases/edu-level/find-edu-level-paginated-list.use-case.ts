import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { EduLevel } from '@features/201-files/domain/models/edu-level.model';

@Injectable()
export class FindEduLevelPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL)
    private readonly eduLevelRepository: EduLevelRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EduLevel[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.eduLevelRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
