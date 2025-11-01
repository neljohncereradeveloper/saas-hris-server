import { Edu } from '../models/edu';

export interface EduRepository<Context = unknown> {
  create(edu: Edu, context: Context): Promise<Edu>;
  update(id: number, dto: Partial<Edu>, context?: Context): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Edu | null>;
  findEmployeesEducation(employeeId: number): Promise<{
    data: Edu[];
  }>;
}
