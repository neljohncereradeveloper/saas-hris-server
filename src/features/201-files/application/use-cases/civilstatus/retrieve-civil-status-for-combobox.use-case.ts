import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveCivilStatusForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS)
    private readonly civilStatusRepository: CivilStatusRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const civilStatuss = await this.civilStatusRepository.retrieveForCombobox();

    return civilStatuss.map((val: { desc1: string }) => ({
      value: val.desc1 || '',
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
