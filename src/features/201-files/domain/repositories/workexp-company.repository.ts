import { WorkExpCompany } from '../models/workexp-company.model';

export interface WorkexpCompanyRepository<Context = unknown> {
  create(
    workexpCompany: WorkExpCompany,
    context: Context,
  ): Promise<WorkExpCompany>;
  update(
    id: number,
    dto: Partial<WorkExpCompany>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<WorkExpCompany | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: WorkExpCompany[];
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
  ): Promise<WorkExpCompany | null>;
  retrieveForCombobox(): Promise<WorkExpCompany[]>;
}
