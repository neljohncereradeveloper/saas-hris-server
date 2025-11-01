import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveProvinceForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.PROVINCE)
    private readonly provinceRepository: ProvinceRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const provinces = await this.provinceRepository.retrieveForCombobox();

    return provinces.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
