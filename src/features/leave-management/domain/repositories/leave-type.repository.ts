import { LeaveType } from '../models/leave-type.model';

export interface LeaveTypeRepository<Context = unknown> {
  create(type: LeaveType, context: Context): Promise<LeaveType>;
  update(
    id: number,
    dto: Partial<LeaveType>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<LeaveType | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: LeaveType[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByName(name: string, context: Context): Promise<LeaveType | null>;
  findByCode(code: string, context: Context): Promise<LeaveType | null>;
  retrieveForCombobox(): Promise<LeaveType[]>;
}
