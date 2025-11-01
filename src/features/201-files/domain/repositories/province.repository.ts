import { Province } from '../models/province.model';

export interface ProvinceRepository<Context = unknown> {
  create(province: Province, context: Context): Promise<Province>;
  update(
    id: number,
    dto: Partial<Province>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Province | null>;
  findPaginatedList(
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
  }>;
  findByDescription(desc1: string, context: Context): Promise<Province | null>;
  retrieveForCombobox(): Promise<Province[]>;
}
