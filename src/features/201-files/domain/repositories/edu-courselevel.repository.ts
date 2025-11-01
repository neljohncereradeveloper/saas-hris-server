import { EduCourseLevel } from '../models/edu-courselevel.model';

export interface EduCourseLevelRepository<Context = unknown> {
  create(
    courseLevel: EduCourseLevel,
    context: Context,
  ): Promise<EduCourseLevel>;
  update(
    id: number,
    dto: Partial<EduCourseLevel>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<EduCourseLevel | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EduCourseLevel[];
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
  ): Promise<EduCourseLevel | null>;
  retrieveForCombobox(): Promise<EduCourseLevel[]>;
}
