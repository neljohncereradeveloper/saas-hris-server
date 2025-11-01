import { LeaveEncashment } from '../models/leave-encashment.model';

export interface LeaveEncashmentRepository<Context = unknown> {
  create(encash: LeaveEncashment, context: Context): Promise<LeaveEncashment>;
  update(
    id: number,
    dto: Partial<LeaveEncashment>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context: Context): Promise<LeaveEncashment | null>;
  findPending(context: Context): Promise<LeaveEncashment[]>;
  markAsPaid(
    id: number,
    payrollRef: string,
    context: Context,
  ): Promise<boolean>;
  findByEmployee(
    employeeId: number,
    context: Context,
  ): Promise<LeaveEncashment[]>;
}
