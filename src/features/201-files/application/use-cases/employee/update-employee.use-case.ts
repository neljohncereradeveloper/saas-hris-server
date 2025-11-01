import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { UpdateEmployeeCommand } from '@features/201-files/application/commands/employee/update-employee.command';
import { Employee } from '@features/shared/domain/models/employee.model';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
import { CityRepository } from '@features/201-files/domain/repositories/city.repository';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT)
    private readonly departmentRepository: DepartmentRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BRANCH)
    private readonly branchRepository: BranchRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE)
    private readonly jobTitleRepository: JobTitleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS)
    private readonly employeeStatusRepository: EmpStatusRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.RELIGION)
    private readonly religionRepository: ReligionRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS)
    private readonly civilStatusRepository: CivilStatusRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITY)
    private readonly addressCityRepository: CityRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.PROVINCE)
    private readonly addressProvinceRepository: ProvinceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP)
    private readonly citizenshipRepository: CitizenShipRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateEmployeeCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Employee | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId,
          { id, dto },
          requestInfo,
          `Updated employee: ${dto.fname} ${dto.lname}`,
          `Failed to update employee with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate employee existence
            const employeeResult = await this.employeeRepository.findById(
              id,
              manager,
            );
            if (!employeeResult) {
              throw new NotFoundException('Employee not found');
            }

            // Check for duplicate employees (excluding current employee)
            await this.validateUniqueEmployee(id, dto, manager);

            // Validate all required entities in parallel
            const [
              branch,
              citizenShip,
              jobTitle,
              employeeStatus,
              religion,
              civilStatus,
              homeAddressCity,
              homeAddressProvince,
              department,
              presentAddressCity,
              presentAddressProvince,
            ] = await Promise.all([
              this.validateBranch(dto.branch!, manager),
              this.validateCitizenship(dto.citizenShip!, manager),
              this.validateJobTitle(dto.jobTitle!, manager),
              this.validateEmployeeStatus(dto.employeeStatus!, manager),
              this.validateReligion(dto.religion!, manager),
              this.validateCivilStatus(dto.civilStatus!, manager),
              this.validateCity(dto.homeAddressCity!, manager),
              this.validateProvince(dto.homeAddressProvince!, manager),
              dto.department
                ? this.validateDepartment(dto.department, manager)
                : Promise.resolve(null),
              dto.presentAddressCity
                ? this.validateCity(dto.presentAddressCity, manager)
                : Promise.resolve(null),
              dto.presentAddressProvince
                ? this.validateProvince(dto.presentAddressProvince, manager)
                : Promise.resolve(null),
            ]);

            // Update the employee
            const updateSuccessfull = await this.employeeRepository.update(
              id,
              {
                ...dto,
                branchId: branch.id!,
                jobTitleId: jobTitle.id!,
                employeeStatusId: employeeStatus.id!,
                religionId: religion.id!,
                civilStatusId: civilStatus.id!,
                homeAddressCityId: homeAddressCity.id!,
                homeAddressProvinceId: homeAddressProvince.id!,
                presentAddressCityId: presentAddressCity?.id,
                presentAddressProvinceId: presentAddressProvince?.id,
                departmentId: department?.id,
                citizenShipId: citizenShip?.id,
              },
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Employee update failed');
            }

            // Retrieve the updated employee
            const employee = await this.employeeRepository.findById(
              id,
              manager,
            );

            return employee!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }

  private async validateUniqueEmployee(
    currentEmployeeId: number,
    dto: UpdateEmployeeCommand,
    manager: any,
  ): Promise<void> {
    if (dto.idNumber) {
      const existingByIdNumber = await this.employeeRepository.findByIdNumber(
        dto.idNumber,
        manager,
      );
      if (existingByIdNumber && existingByIdNumber.id !== currentEmployeeId) {
        throw new NotFoundException(
          `Employee with ID number ${dto.idNumber} already exists`,
        );
      }
    }

    if (dto.bioNumber) {
      const existingByBioNumber = await this.employeeRepository.findByBioNumber(
        dto.bioNumber,
        manager,
      );
      if (existingByBioNumber && existingByBioNumber.id !== currentEmployeeId) {
        throw new NotFoundException(
          `Employee with bio number ${dto.bioNumber} already exists`,
        );
      }
    }
  }

  private async validateBranch(description: string, manager: any) {
    const branch = await this.branchRepository.findByDescription(
      description,
      manager,
    );
    if (!branch) {
      throw new NotFoundException(`Branch '${description}' not found`);
    }
    return branch;
  }

  private async validateCitizenship(description: string, manager: any) {
    const citizenship = await this.citizenshipRepository.findByDescription(
      description,
      manager,
    );
    if (!citizenship) {
      throw new NotFoundException(`Citizenship '${description}' not found`);
    }
    return citizenship;
  }

  private async validateJobTitle(description: string, manager: any) {
    const jobTitle = await this.jobTitleRepository.findByDescription(
      description,
      manager,
    );
    if (!jobTitle) {
      throw new NotFoundException(`Job title '${description}' not found`);
    }
    return jobTitle;
  }

  private async validateEmployeeStatus(description: string, manager: any) {
    const employeeStatus =
      await this.employeeStatusRepository.findByDescription(
        description,
        manager,
      );
    if (!employeeStatus) {
      throw new NotFoundException(`Employee status '${description}' not found`);
    }
    return employeeStatus;
  }

  private async validateReligion(description: string, manager: any) {
    const religion = await this.religionRepository.findByDescription(
      description,
      manager,
    );
    if (!religion) {
      throw new NotFoundException(`Religion '${description}' not found`);
    }
    return religion;
  }

  private async validateCivilStatus(description: string, manager: any) {
    const civilStatus = await this.civilStatusRepository.findByDescription(
      description,
      manager,
    );
    if (!civilStatus) {
      throw new NotFoundException(`Civil status '${description}' not found`);
    }
    return civilStatus;
  }

  private async validateCity(description: string, manager: any) {
    const city = await this.addressCityRepository.findByDescription(
      description,
      manager,
    );
    if (!city) {
      throw new NotFoundException(`City '${description}' not found`);
    }
    return city;
  }

  private async validateProvince(description: string, manager: any) {
    const province = await this.addressProvinceRepository.findByDescription(
      description,
      manager,
    );
    if (!province) {
      throw new NotFoundException(`Province '${description}' not found`);
    }
    return province;
  }

  private async validateDepartment(description: string, manager: any) {
    const department = await this.departmentRepository.findByDescription(
      description,
      manager,
    );
    if (!department) {
      throw new NotFoundException(`Department '${description}' not found`);
    }
    return department;
  }
}
