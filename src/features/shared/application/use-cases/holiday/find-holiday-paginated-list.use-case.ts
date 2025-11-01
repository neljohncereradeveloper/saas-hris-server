import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { HolidayRepository } from '@features/shared/domain/repositories/holiday.repository';
import { Holiday } from '@features/shared/domain/models/holiday.model';

@Injectable()
export class FindHolidayPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Holiday[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const result = await this.holidayRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}

