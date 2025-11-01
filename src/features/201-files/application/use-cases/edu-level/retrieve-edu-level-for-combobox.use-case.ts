import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveEduLevelForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL)
    private readonly eduLevelRepository: EduLevelRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const educationLevels = await this.eduLevelRepository.retrieveForCombobox();

    return educationLevels.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
