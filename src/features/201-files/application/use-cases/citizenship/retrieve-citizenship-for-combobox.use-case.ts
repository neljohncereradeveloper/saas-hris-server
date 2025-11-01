import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveCitizenshipForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP)
    private readonly citizenShipRepository: CitizenShipRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const citizenShips = await this.citizenShipRepository.retrieveForCombobox();

    return citizenShips.map((val: { desc1: string }) => ({
      value: val.desc1 || '',
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
