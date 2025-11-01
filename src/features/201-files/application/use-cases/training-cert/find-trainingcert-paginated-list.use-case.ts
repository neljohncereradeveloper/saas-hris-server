import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';

@Injectable()
export class FindTrainingCertPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT)
    private readonly trainingcertRepository: TrainingCertRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: TrainingCert[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.trainingcertRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
