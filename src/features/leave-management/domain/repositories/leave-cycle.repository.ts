import { LeaveCycle } from '../models/leave-cycle.model';

export interface LeaveCycleRepository<Context = unknown> {
  create(cycle: LeaveCycle, context: Context): Promise<LeaveCycle>;
  update(
    id: number,
    dto: Partial<LeaveCycle>,
    context?: Context,
  ): Promise<boolean>;
  findByEmployee(employeeId: number, context: Context): Promise<LeaveCycle[]>;
  getActiveCycle(
    employeeId: number,
    leaveTypeId: number,
    context: Context,
  ): Promise<LeaveCycle | null>;
  findOverlappingCycle(
    employeeId: number,
    leaveTypeId: number,
    cycleStartYear: number,
    cycleEndYear: number,
    context: Context,
  ): Promise<LeaveCycle | null>;
  findById(id: number, context: Context): Promise<LeaveCycle | null>;
  closeCycle(id: number, context: Context): Promise<boolean>;
}
