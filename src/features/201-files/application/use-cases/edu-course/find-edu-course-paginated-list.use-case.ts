import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';

@Injectable()
export class FindEduCoursePaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE)
    private readonly courseRepository: EduCourseRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EduCourse[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.courseRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
