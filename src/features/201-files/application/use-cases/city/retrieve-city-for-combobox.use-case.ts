import { CityRepository } from '@features/201-files/domain/repositories/city.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveCityForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITY)
    private readonly cityRepository: CityRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const cities = await this.cityRepository.retrieveForCombobox();

    return cities.map((val: { desc1: string }) => ({
      value: val.desc1 || '',
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
