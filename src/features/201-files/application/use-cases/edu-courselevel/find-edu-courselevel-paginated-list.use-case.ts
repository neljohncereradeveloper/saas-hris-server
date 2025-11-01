import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { EduCourseLevel } from '@features/201-files/domain/models/edu-courselevel.model';

@Injectable()
export class FindEduCourseLevelPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL)
    private readonly courseLevelRepository: EduCourseLevelRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EduCourseLevel[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.courseLevelRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
