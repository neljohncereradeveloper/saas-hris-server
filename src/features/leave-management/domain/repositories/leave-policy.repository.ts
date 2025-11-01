import { LeavePolicy } from '../models/leave-policy.model';

export interface LeavePolicyRepository<Context = unknown> {
  create(policy: LeavePolicy, context: Context): Promise<LeavePolicy>;
  update(
    id: number,
    dto: Partial<LeavePolicy>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<LeavePolicy | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: LeavePolicy[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  retrieveActivePolicies(context: Context): Promise<LeavePolicy[]>;
  getActivePolicy(leaveTypeId: number): Promise<LeavePolicy | null>;
  activatePolicy(id: number, context: Context): Promise<boolean>;
  retirePolicy(id: number, context: Context): Promise<boolean>;
}
