import { JobTitle } from '../models/jobtitle.model';

export interface JobTitleRepository<Context = unknown> {
  create(jobTitle: JobTitle, context: Context): Promise<JobTitle>;
  update(
    id: number,
    dto: Partial<JobTitle>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<JobTitle | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: JobTitle[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<JobTitle | null>;
  retrieveForCombobox(): Promise<JobTitle[]>;
}
