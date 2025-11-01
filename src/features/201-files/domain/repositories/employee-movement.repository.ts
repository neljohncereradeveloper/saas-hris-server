import { EmployeeMovement } from '../models/employee-movement.model';

export interface EmployeeMovementRepository<T = any> {
  create(movement: EmployeeMovement, manager?: T): Promise<EmployeeMovement>;
  update(
    id: number,
    movement: Partial<EmployeeMovement>,
    manager?: T,
  ): Promise<boolean>;
  findById(id: number, manager: T): Promise<EmployeeMovement | null>;
  findByEmployeeId(employeeId: number, manager: T): Promise<EmployeeMovement[]>;
  findWithPagination(
    page: number,
    limit: number,
    manager: T,
    filters?: {
      employeeId?: number;
      movementType?: string;
      effectiveDateFrom?: Date;
      effectiveDateTo?: Date;
      searchTerm?: string;
    },
  ): Promise<{
    data: EmployeeMovement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  softDelete(id: number, isActive: boolean, context: T): Promise<boolean>;
}
