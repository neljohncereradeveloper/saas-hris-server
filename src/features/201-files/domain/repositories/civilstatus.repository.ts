import { CivilStatus } from '../models/civilstatus.model';

export interface CivilStatusRepository<Context = unknown> {
  create(civilStatus: CivilStatus, context: Context): Promise<CivilStatus>;
  update(
    id: number,
    dto: Partial<CivilStatus>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<CivilStatus | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: CivilStatus[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(
    desc1: string,
    context: Context,
  ): Promise<CivilStatus | null>;
  retrieveForCombobox(): Promise<CivilStatus[]>;
}
