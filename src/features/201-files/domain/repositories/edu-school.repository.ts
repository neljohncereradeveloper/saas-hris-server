import { EduSchool } from '../models/edu-school.model';

export interface EduSchoolRepository<Context = unknown> {
  create(school: EduSchool, context: Context): Promise<EduSchool>;
  update(
    id: number,
    dto: Partial<EduSchool>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<EduSchool | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EduSchool[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<EduSchool | null>;
  retrieveForCombobox(): Promise<EduSchool[]>;
}
