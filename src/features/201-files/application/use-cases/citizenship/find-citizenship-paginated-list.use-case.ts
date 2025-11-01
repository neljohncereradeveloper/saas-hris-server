import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
import { CitizenShip } from '@features/201-files/domain/models/citizenship.model';

@Injectable()
export class FindCitizenshipPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP)
    private readonly citizenShipRepository: CitizenShipRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: CitizenShip[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.citizenShipRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
