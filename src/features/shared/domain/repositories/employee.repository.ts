import { Employee } from 'src/features/shared/domain/models/employee.model';

export interface EmployeeRepository<Context = unknown> {
  create(employee: Employee, context: Context): Promise<Employee>;
  update(
    id: number,
    dto: Partial<Employee>,
    context: Context,
  ): Promise<boolean>;

  findById(id: number, context: Context): Promise<Employee | null>;
  findByIdNumber(idNumber: string, context: Context): Promise<Employee | null>;
  findByBioNumber(
    bioNumber: string,
    context: Context,
  ): Promise<Employee | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    employeeStatus: Array<string>,
  ): Promise<{
    data: Employee[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  updateEmployeeImagePath(
    employeeId: number,
    imagePath: string,
    context: Context,
  ): Promise<boolean>;
  updateEmployeeGovernmentDetails(
    employeeId: number,
    governmentDetails: Partial<Employee>,
    context: Context,
  ): Promise<boolean>;
  retrieveActiveEmployees(context: Context): Promise<Employee[]>;
}
