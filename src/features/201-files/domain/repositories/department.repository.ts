import { Dept } from '../models/dept';

export interface DepartmentRepository<Context = unknown> {
  create(department: Dept, context: Context): Promise<Dept>;
  update(id: number, dto: Partial<Dept>, context?: Context): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Dept | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Dept[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<Dept | null>;
  retrieveForCombobox(): Promise<Dept[]>;
}
