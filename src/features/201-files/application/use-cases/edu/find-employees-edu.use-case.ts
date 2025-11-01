import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EduRepository } from '@features/201-files/domain/repositories/edu';
import { Edu } from '@features/201-files/domain/models/edu';

@Injectable()
export class FindEmployeesEduUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDU)
    private readonly eduRepository: EduRepository,
  ) {}

  async execute(employeeId: number): Promise<{
    data: Edu[];
  }> {
    const result = await this.eduRepository.findEmployeesEducation(employeeId);

    return result;
  }
}
