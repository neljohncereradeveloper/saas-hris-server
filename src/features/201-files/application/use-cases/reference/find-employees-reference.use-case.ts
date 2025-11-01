import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ReferenceRepository } from '@features/201-files/domain/repositories/reference.repository';
import { Reference } from '@features/201-files/domain/models/reference.model';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';

@Injectable()
export class FindEmployeesReferenceUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.REFERENCE)
    private readonly referenceRepository: ReferenceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(employeeId: number): Promise<{
    data: Reference[];
  }> {
    // Check if the employee exists
    const result =
      await this.referenceRepository.findEmployeesReference(employeeId);

    return result;
  }
}
