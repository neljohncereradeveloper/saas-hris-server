import { EmployeeMovementType } from '../models/employee-movement-type.model';

export interface EmployeeMovementTypeRepository<Context = unknown> {
  create(
    employeeMovementType: EmployeeMovementType,
    context: Context,
  ): Promise<EmployeeMovementType>;
  update(
    id: number,
    dto: Partial<EmployeeMovementType>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<EmployeeMovementType | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: EmployeeMovementType[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(
    desc1: string,
    context: Context,
  ): Promise<EmployeeMovementType | null>;
  retrieveForCombobox(): Promise<EmployeeMovementType[]>;
}
