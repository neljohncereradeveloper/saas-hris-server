import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EmployeeMovementTypeRepository } from '@features/201-files/domain/repositories/employee-movement-type.repository';
import { EmployeeMovementType } from '@features/201-files/domain/models/employee-movement-type.model';

@Injectable()
export class FindEmployeeMovementTypePaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT_TYPE)
    private readonly employeeMovementTypeRepository: EmployeeMovementTypeRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EmployeeMovementType[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.employeeMovementTypeRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
