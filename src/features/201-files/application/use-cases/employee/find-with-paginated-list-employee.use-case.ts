import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { Employee } from '@features/shared/domain/models/employee.model';

@Injectable()
export class FindWithPaginatedListEmployeeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
    employeeStatus: Array<string>,
  ): Promise<{
    data: Employee[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.employeeRepository.findPaginatedList(
      term,
      page,
      limit,
      employeeStatus,
    );

    return result;
  }
}
