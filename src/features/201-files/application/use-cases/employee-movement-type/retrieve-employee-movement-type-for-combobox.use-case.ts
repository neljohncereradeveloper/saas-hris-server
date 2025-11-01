import { EmployeeMovementTypeRepository } from '@features/201-files/domain/repositories/employee-movement-type.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveEmployeeMovementTypeForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT_TYPE)
    private readonly employeeMovementTypeRepository: EmployeeMovementTypeRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const employeeMovementTypes =
      await this.employeeMovementTypeRepository.retrieveForCombobox();

    return employeeMovementTypes.map((val: { desc1: string }) => ({
      value: val.desc1 || '',
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
