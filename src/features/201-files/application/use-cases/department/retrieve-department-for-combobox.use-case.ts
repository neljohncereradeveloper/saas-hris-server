import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveDepartmentForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT)
    private readonly departmentRepository: DepartmentRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const departments = await this.departmentRepository.retrieveForCombobox();

    return departments.map((val: { desc1: string }) => ({
      value: val.desc1 || '',
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
