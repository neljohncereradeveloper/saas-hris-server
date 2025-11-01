import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveCourseForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE)
    private readonly courseRepository: EduCourseRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const courses = await this.courseRepository.retrieveForCombobox();

    return courses.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
