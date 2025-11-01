import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TrainingRepository } from '@features/201-files/domain/repositories/training.repository';
import { Training } from '@features/201-files/domain/models/training.model';

@Injectable()
export class FindEmployeesTrainingUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAINING)
    private readonly trainingRepository: TrainingRepository,
  ) {}

  async execute(employeeId: number): Promise<{
    data: Training[];
  }> {
    const result =
      await this.trainingRepository.findEmployeesTraining(employeeId);

    return result;
  }
}
