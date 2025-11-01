import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { Province } from '@features/201-files/domain/models/province.model';

@Injectable()
export class FindProvincePaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.PROVINCE)
    private readonly provinceRepository: ProvinceRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Province[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.provinceRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
