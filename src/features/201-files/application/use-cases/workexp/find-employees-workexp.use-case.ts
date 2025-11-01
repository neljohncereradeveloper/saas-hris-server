import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
import { WorkExp } from '@features/201-files/domain/models/workexp.model';

@Injectable()
export class FindEmployeesWorkExpUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXP)
    private readonly workExpRepository: WorkExpRepository,
  ) {}

  async execute(employeeId: number): Promise<{
    data: WorkExp[];
  }> {
    const result =
      await this.workExpRepository.findEmployeesWorkExp(employeeId);

    return result;
  }
}
