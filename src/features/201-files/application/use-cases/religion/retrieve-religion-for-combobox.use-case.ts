import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveReligionForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.RELIGION)
    private readonly religionRepository: ReligionRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const religions = await this.religionRepository.retrieveForCombobox();

    return religions.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
