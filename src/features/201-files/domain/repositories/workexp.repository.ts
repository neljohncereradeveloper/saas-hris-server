import { WorkExp } from '../models/workexp.model';

export interface WorkExpRepository<Context = unknown> {
  create(workExp: WorkExp, context: Context): Promise<WorkExp>;
  update(
    id: number,
    dto: Partial<WorkExp>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<WorkExp | null>;
  findEmployeesWorkExp(employeeId: number): Promise<{
    data: WorkExp[];
  }>;
}
