import { Module } from '@nestjs/common';
import { EmployeeController } from './controller/employee.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateEmployeeUseCase } from '@features/201-files/application/use-cases/employee/create-employee.use-case';
import { UpdateEmployeeUseCase } from '@features/201-files/application/use-cases/employee/update-employee.use-case';
import { UpdateGovernmentDetailsUseCase } from '@features/201-files/application/use-cases/employee/update-government-details.use-case';
import { FindEmployeeByIdUseCase } from '@features/201-files/application/use-cases/employee/find-employee-by-id.use-case';
import { FindWithPaginatedListEmployeeUseCase } from '@features/201-files/application/use-cases/employee/find-with-paginated-list-employee.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { EmployeeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/employee.repository';
import { BarangayRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/barangay.repository';
import { CityRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/city.repository';
import { ProvinceRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/province.repository';
import { CitizenShipRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/citizenship.repository';
import { CivilStatusRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/civilstatus.repository';
import { JobTitleRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/jobtitle.repository';
import { EmpStatusRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/empstatus.repository';
import { ReligionRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/religion.repository';
import { BranchRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/branch.repository';
import { DepartmentRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/department.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EmployeeController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE,
      useClass: EmployeeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.BARANGAY,
      useClass: BarangayRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.CITY,
      useClass: CityRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.PROVINCE,
      useClass: ProvinceRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP,
      useClass: CitizenShipRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS,
      useClass: CivilStatusRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.JOBTITLE,
      useClass: JobTitleRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS,
      useClass: EmpStatusRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.RELIGION,
      useClass: ReligionRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.BRANCH,
      useClass: BranchRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT,
      useClass: DepartmentRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateEmployeeUseCase,
    UpdateEmployeeUseCase,
    UpdateGovernmentDetailsUseCase,
    FindEmployeeByIdUseCase,
    FindWithPaginatedListEmployeeUseCase,
  ],
  exports: [
    CreateEmployeeUseCase,
    UpdateEmployeeUseCase,
    UpdateGovernmentDetailsUseCase,
    FindEmployeeByIdUseCase,
    FindWithPaginatedListEmployeeUseCase,
  ],
})
export class EmployeeModule {}
