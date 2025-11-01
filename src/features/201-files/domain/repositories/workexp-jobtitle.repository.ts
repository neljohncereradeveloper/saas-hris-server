import { WorkExpJobTitle } from '../models/workexp-jobtitle.model';

export interface WorkExpJobTitleRepository<Context = unknown> {
  create(
    workexpJobtitle: WorkExpJobTitle,
    context: Context,
  ): Promise<WorkExpJobTitle>;
  update(
    id: number,
    dto: Partial<WorkExpJobTitle>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<WorkExpJobTitle | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: WorkExpJobTitle[];
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
  ): Promise<WorkExpJobTitle | null>;
  retrieveForCombobox(): Promise<WorkExpJobTitle[]>;
}
