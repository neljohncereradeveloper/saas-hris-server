import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CityRepository } from '@features/201-files/domain/repositories/city.repository';
import { City } from '@features/201-files/domain/models/city.model';

@Injectable()
export class FindCityPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITY)
    private readonly cityRepository: CityRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: City[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.cityRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
