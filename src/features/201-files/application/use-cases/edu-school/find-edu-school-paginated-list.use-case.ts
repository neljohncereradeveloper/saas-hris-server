import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';

@Injectable()
export class FindEduSchoolPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL)
    private readonly eduSchoolRepository: EduSchoolRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EduSchool[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.eduSchoolRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
