import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveEduCourseLevelForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL)
    private readonly courseLevelRepository: EduCourseLevelRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const courseLevels = await this.courseLevelRepository.retrieveForCombobox();

    return courseLevels.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
