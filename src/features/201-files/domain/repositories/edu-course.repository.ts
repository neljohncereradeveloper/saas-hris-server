import { EduCourse } from '../models/edu-course.model';

export interface EduCourseRepository<Context = unknown> {
  create(course: EduCourse, context: Context): Promise<EduCourse>;
  update(
    id: number,
    dto: Partial<EduCourse>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<EduCourse | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EduCourse[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<EduCourse | null>;
  retrieveForCombobox(): Promise<EduCourse[]>;
}
