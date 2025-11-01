import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveWorkExpCompanyForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY)
    private readonly workexpcompanyRepository: WorkexpCompanyRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const workexpcompanys =
      await this.workexpcompanyRepository.retrieveForCombobox();

    return workexpcompanys.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
