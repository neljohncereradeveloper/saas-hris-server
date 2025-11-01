import { EmpStatus } from '../models/empstatus';

export interface EmpStatusRepository<Context = unknown> {
  create(empStatus: EmpStatus, context: Context): Promise<EmpStatus>;
  update(
    id: number,
    dto: Partial<EmpStatus>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<EmpStatus | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EmpStatus[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<EmpStatus | null>;
  retrieveForCombobox(): Promise<EmpStatus[]>;
}
