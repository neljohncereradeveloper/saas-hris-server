import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveJobTitleForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE)
    private readonly jobtitleRepository: JobTitleRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const jobtitles = await this.jobtitleRepository.retrieveForCombobox();

    return jobtitles.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
