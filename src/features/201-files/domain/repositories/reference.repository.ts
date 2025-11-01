import { Reference } from '../models/reference.model';

export interface ReferenceRepository<Context = unknown> {
  create(reference: Reference, context: Context): Promise<Reference>;
  update(
    id: number,
    dto: Partial<Reference>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Reference | null>;
  findEmployeesReference(employeeId: number): Promise<{
    data: Reference[];
  }>;
}
