import { EduLevel } from '../models/edu-level.model';

export interface EduLevelRepository<Context = unknown> {
  create(educationLevel: EduLevel, context: Context): Promise<EduLevel>;
  update(
    id: number,
    dto: Partial<EduLevel>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<EduLevel | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EduLevel[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<EduLevel | null>;
  retrieveForCombobox(): Promise<EduLevel[]>;
}
