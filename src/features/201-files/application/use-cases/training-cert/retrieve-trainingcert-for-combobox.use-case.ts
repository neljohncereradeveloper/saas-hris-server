import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveTrainingCertForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT)
    private readonly trainingcertRepository: TrainingCertRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const trainingcerts =
      await this.trainingcertRepository.retrieveForCombobox();

    return trainingcerts.map((val: { desc1: string }) => ({
      value: val.desc1,
      label: val.desc1
        ? val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase()
        : '',
    }));
  }
}
