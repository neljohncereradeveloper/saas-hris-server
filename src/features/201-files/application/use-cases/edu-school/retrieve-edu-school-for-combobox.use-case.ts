import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveEduSchoolForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL)
    private readonly eduSchoolRepository: EduSchoolRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const schools = await this.eduSchoolRepository.retrieveForCombobox();

    return schools.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
