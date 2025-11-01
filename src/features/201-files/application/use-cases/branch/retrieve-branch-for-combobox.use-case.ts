import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveBranchForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BRANCH)
    private readonly branchRepository: BranchRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const branchs = await this.branchRepository.retrieveForCombobox();

    return branchs.map((val: { desc1: string }) => ({
      value: val.desc1 || '',
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
