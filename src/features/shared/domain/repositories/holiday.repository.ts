import { Holiday } from '../models/holiday.model';

export interface HolidayRepository<Context = unknown> {
  create(holiday: Holiday, context: Context): Promise<Holiday>;
  update(
    id: number,
    dto: Partial<Holiday>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Holiday | null>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
    context: Context,
  ): Promise<Holiday[]>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    context?: Context,
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
  }>;
  findByYear(year: number, context: Context): Promise<Holiday[]>;
}

