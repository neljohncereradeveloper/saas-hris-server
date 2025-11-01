import { Religion } from '../models/religion.model';

export interface ReligionRepository<Context = unknown> {
  create(religion: Religion, context: Context): Promise<Religion>;
  update(
    id: number,
    dto: Partial<Religion>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Religion | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Religion[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<Religion | null>;
  retrieveForCombobox(): Promise<Religion[]>;
}
