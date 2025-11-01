import { LeaveRequest } from '../models/leave-request.model';

export interface LeaveRequestRepository<Context = unknown> {
  create(request: LeaveRequest, context: Context): Promise<LeaveRequest>;
  update(
    id: number,
    dto: Partial<LeaveRequest>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<LeaveRequest | null>;
  findByEmployee(employeeId: number, context: Context): Promise<LeaveRequest[]>;
  findPending(context: Context): Promise<LeaveRequest[]>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    context?: Context,
  ): Promise<{
    data: LeaveRequest[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  updateStatus(
    id: number,
    status: string,
    approverId: number,
    remarks: string,
    context: Context,
  ): Promise<boolean>;
  findOverlappingRequests(
    employeeId: number,
    startDate: Date,
    endDate: Date,
    excludeId?: number,
    context?: Context,
  ): Promise<LeaveRequest[]>;
}
