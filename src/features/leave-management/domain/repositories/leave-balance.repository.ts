import { LeaveBalance } from '../models/leave-balance.model';

export interface LeaveBalanceRepository<Context = unknown> {
  create(balance: LeaveBalance, context: Context): Promise<LeaveBalance>;
  update(
    id: number,
    dto: Partial<LeaveBalance>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<LeaveBalance | null>;
  findByEmployeeYear(employeeId: number, year: string): Promise<LeaveBalance[]>;
  findByLeaveType(
    employeeId: number,
    leaveTypeId: number,
    year: string,
    context: Context,
  ): Promise<LeaveBalance | null>;
  closeBalance(id: number, context: Context): Promise<boolean>;
  resetBalancesForYear(year: string, context: Context): Promise<boolean>;
}
