import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEmployeeUseCase } from '@features/201-files/application/use-cases/employee/update-employee.use-case';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { Employee } from '@features/shared/domain/models/employee.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateEmployeeCommand } from '@features/201-files/application/commands/employee/update-employee.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { CityRepository } from '@features/201-files/domain/repositories/city.repository';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared';

describe('UpdateEmployeeUseCase', () => {
  let useCase: UpdateEmployeeUseCase;
  let employeeRepository: jest.Mocked<EmployeeRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;
  let branchRepository: jest.Mocked<BranchRepository>;
  let employeeStatusRepository: jest.Mocked<EmpStatusRepository>;
  let jobTitleRepository: jest.Mocked<JobTitleRepository>;
  let departmentRepository: jest.Mocked<DepartmentRepository>;
  let religionRepository: jest.Mocked<ReligionRepository>;
  let civilStatusRepository: jest.Mocked<CivilStatusRepository>;
  let addressCityRepository: jest.Mocked<CityRepository>;
  let addressProvinceRepository: jest.Mocked<ProvinceRepository>;
  let citizenshipRepository: jest.Mocked<CitizenShipRepository>;

  const mockEmployee = new Employee({
    id: 1,
    /** employment information */
    jobTitleId: 1,
    jobTitle: 'Software Developer',
    employeeStatusId: 1,
    employeeStatus: 'Active',
    branchId: 1,
    branch: 'Main Branch',
    departmentId: 1,
    department: 'IT Department',
    hireDate: new Date('2023-01-01'),
    endDate: undefined,
    regularizationDate: new Date('2023-07-01'),
    idNumber: 'EMP001',
    bioNumber: 'BIO001',
    imagePath: '/uploads/employees/emp001.jpg',

    /** personal information */
    fname: 'John',
    mname: 'Michael',
    lname: 'Doe',
    suffix: 'Jr.',
    birthDate: new Date('1990-01-01'),
    religionId: 1,
    religion: 'Christian',
    civilStatusId: 1,
    civilStatus: 'Single',
    age: 33,
    gender: 'Male' as any,
    citizenShipId: 1,
    citizenShip: 'Filipino',
    height: 175,
    weight: 70,

    /** address information */
    homeAddressStreet: '123 Main St',
    homeAddressCityId: 1,
    homeAddressCity: 'New York',
    homeAddressProvinceId: 1,
    homeAddressProvince: 'NY',
    homeAddressZipCode: '10001',
    presentAddressStreet: '456 Oak Ave',
    presentAddressBarangayId: 1,
    presentAddressBarangay: 'Barangay 1',
    presentAddressCityId: 1,
    presentAddressCity: 'New York',
    presentAddressProvinceId: 1,
    presentAddressZipCode: '10002',

    /** contact information */
    cellphoneNumber: '+1234567890',
    telephoneNumber: '+1234567891',
    email: 'john.doe@company.com',

    /** emergency contact information */
    emergencyContactName: 'Jane Doe',
    emergencyContactNumber: '+1234567892',
    emergencyContactRelationship: 'Sister',
    emergencyContactAddress: '789 Pine St, New York, NY 10003',

    /** family information */
    husbandOrWifeName: 'Mary Doe',
    husbandOrWifeBirthDate: new Date('1992-05-15'),
    husbandOrWifeOccupation: 'Teacher',
    numberOfChildren: 2,
    fathersName: 'Robert Doe',
    fathersBirthDate: new Date('1965-03-20'),
    fathersOccupation: 'Engineer',
    mothersName: 'Susan Doe',
    mothersBirthDate: new Date('1968-08-10'),
    mothersOccupation: 'Nurse',

    /** bank account information */
    bankAccountNumber: '1234567890',
    bankAccountName: 'John Michael Doe Jr.',
    bankName: 'Bank of America',
    bankBranch: 'Main Branch',

    /** salary information */
    monthlySalary: 6250,
    dailyRate: 288.46,
    hourlyRate: 36.06,

    /** government information */
    phic: 'PHIC001',
    hdmf: 'HDMF001',
    sssNo: 'SSS001',
    tinNo: 'TIN001',
    taxExemptCode: 'TAX001',
  });

  const mockUpdatedEmployee = new Employee({
    ...mockEmployee,
    /** employment information */
    jobTitle: 'Senior Software Developer',
    department: 'IT Department',

    /** personal information */
    fname: 'Jane',
    mname: 'Elizabeth',
    lname: 'Smith',
    suffix: 'Sr.',
    civilStatus: 'Married',
    gender: 'Female' as any,
    height: 165,
    weight: 60,

    /** address information */
    homeAddressStreet: '789 Pine St',
    presentAddressBarangay: 'Barangay 2',

    /** contact information */
    cellphoneNumber: '+1234567893',
    telephoneNumber: '+1234567894',
    email: 'jane.smith@company.com',

    /** emergency contact information */
    emergencyContactName: 'John Smith',
    emergencyContactNumber: '+1234567895',
    emergencyContactRelationship: 'Husband',
    emergencyContactAddress: '789 Pine St, New York, NY 10001',

    /** family information */
    husbandOrWifeName: 'John Smith',
    husbandOrWifeBirthDate: new Date('1988-03-15'),
    husbandOrWifeOccupation: 'Engineer',
    numberOfChildren: 1,
    fathersName: 'Robert Smith',
    fathersBirthDate: new Date('1960-05-20'),
    fathersOccupation: 'Doctor',
    mothersName: 'Susan Smith',
    mothersBirthDate: new Date('1963-09-10'),
    mothersOccupation: 'Teacher',

    /** bank account information */
    bankAccountNumber: '0987654321',
    bankAccountName: 'Jane Elizabeth Smith Sr.',
    bankName: 'Chase Bank',
    bankBranch: 'Downtown Branch',

    /** salary information */
    monthlySalary: 7500,
    dailyRate: 346.15,
    hourlyRate: 43.27,

    /** government information */
    phic: 'PHIC002',
    hdmf: 'HDMF002',
    sssNo: 'SSS002',
    tinNo: 'TIN002',
    taxExemptCode: 'TAX002',
  });

  const mockUpdateCommand: UpdateEmployeeCommand = {
    /** employment information */
    jobTitle: 'Senior Software Developer',
    employeeStatus: 'Active',
    branch: 'Main Branch',
    department: 'IT Department',
    hireDate: new Date('2023-01-01'),
    endDate: undefined,
    regularizationDate: new Date('2023-07-01'),
    idNumber: 'EMP001',
    bioNumber: 'BIO001',
    imagePath: '/uploads/employees/emp001.jpg',

    /** personal information */
    fname: 'Jane',
    mname: 'Elizabeth',
    lname: 'Smith',
    suffix: 'Sr.',
    birthDate: new Date('1990-01-01'),
    religion: 'Christian',
    civilStatus: 'Married',
    age: 33,
    gender: 'Female' as any,
    citizenShip: 'Filipino',
    height: 165,
    weight: 60,

    /** address information */
    homeAddressStreet: '789 Pine St',
    homeAddressCity: 'New York',
    homeAddressProvince: 'NY',
    homeAddressZipCode: '10001',
    presentAddressStreet: '456 Oak Ave',
    presentAddressBarangay: 'Barangay 2',
    presentAddressCity: 'New York',
    presentAddressProvince: 'NY',
    presentAddressZipCode: '10002',

    /** contact information */
    cellphoneNumber: '+1234567893',
    telephoneNumber: '+1234567894',
    email: 'jane.smith@company.com',

    /** emergency contact information */
    emergencyContactName: 'John Smith',
    emergencyContactNumber: '+1234567895',
    emergencyContactRelationship: 'Husband',
    emergencyContactAddress: '789 Pine St, New York, NY 10001',

    /** family information */
    husbandOrWifeName: 'John Smith',
    husbandOrWifeBirthDate: new Date('1988-03-15'),
    husbandOrWifeOccupation: 'Engineer',
    numberOfChildren: 1,
    fathersName: 'Robert Smith',
    fathersBirthDate: new Date('1960-05-20'),
    fathersOccupation: 'Doctor',
    mothersName: 'Susan Smith',
    mothersBirthDate: new Date('1963-09-10'),
    mothersOccupation: 'Teacher',

    /** bank account information */
    bankAccountNumber: '0987654321',
    bankAccountName: 'Jane Elizabeth Smith Sr.',
    bankName: 'Chase Bank',
    bankBranch: 'Downtown Branch',

    /** salary information */
    monthlySalary: 7500,
    dailyRate: 346.15,
    hourlyRate: 43.27,

    /** government information */
    phic: 'PHIC002',
    hdmf: 'HDMF002',
    sssNo: 'SSS002',
    tinNo: 'TIN002',
    taxExemptCode: 'TAX002',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  const mockEntities = {
    branch: { id: 1, desc1: 'Main Branch', brCode: 'MB001' },
    citizenship: { id: 1, desc1: 'Filipino' },
    jobTitle: { id: 1, desc1: 'Senior Software Developer' },
    employeeStatus: { id: 1, desc1: 'Active' },
    religion: { id: 1, desc1: 'Christian' },
    civilStatus: { id: 1, desc1: 'Married' },
    homeAddressCity: { id: 1, desc1: 'New York' },
    homeAddressProvince: { id: 1, desc1: 'NY' },
    department: {
      id: 1,
      desc1: 'IT Department',
      code: 'IT',
      designation: 'Information Technology',
    },
  };

  beforeEach(async () => {
    const mockEmployeeRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      findByIdNumber: jest.fn(),
      findByBioNumber: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const mockBranchRepository = {
      findByDescription: jest.fn(),
    };

    const mockEmployeeStatusRepository = {
      findByDescription: jest.fn(),
    };

    const mockJobTitleRepository = {
      findByDescription: jest.fn(),
    };

    const mockDepartmentRepository = {
      findByDescription: jest.fn(),
    };

    const mockReligionRepository = {
      findByDescription: jest.fn(),
    };

    const mockCivilStatusRepository = {
      findByDescription: jest.fn(),
    };

    const mockAddressCityRepository = {
      findByDescription: jest.fn(),
    };

    const mockAddressProvinceRepository = {
      findByDescription: jest.fn(),
    };

    const mockCitizenshipRepository = {
      findByDescription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEmployeeUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE,
          useValue: mockEmployeeRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.BRANCH,
          useValue: mockBranchRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS,
          useValue: mockEmployeeStatusRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.JOBTITLE,
          useValue: mockJobTitleRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT,
          useValue: mockDepartmentRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.RELIGION,
          useValue: mockReligionRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS,
          useValue: mockCivilStatusRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CITY,
          useValue: mockAddressCityRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.PROVINCE,
          useValue: mockAddressProvinceRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP,
          useValue: mockCitizenshipRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateEmployeeUseCase>(UpdateEmployeeUseCase);
    employeeRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
    branchRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.BRANCH);
    employeeStatusRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS,
    );
    jobTitleRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE);
    departmentRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT);
    religionRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.RELIGION);
    civilStatusRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS);
    addressCityRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CITY);
    addressProvinceRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.PROVINCE,
    );
    citizenshipRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update an employee and log the activity', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      // Mock employee existence
      employeeRepository.findById.mockResolvedValue(mockEmployee);

      // Mock unique validation (no duplicates)
      employeeRepository.findByIdNumber.mockResolvedValue(null);
      employeeRepository.findByBioNumber.mockResolvedValue(null);

      // Mock entity validations
      branchRepository.findByDescription.mockResolvedValue(mockEntities.branch);
      citizenshipRepository.findByDescription.mockResolvedValue(
        mockEntities.citizenship,
      );
      jobTitleRepository.findByDescription.mockResolvedValue(
        mockEntities.jobTitle,
      );
      employeeStatusRepository.findByDescription.mockResolvedValue(
        mockEntities.employeeStatus,
      );
      religionRepository.findByDescription.mockResolvedValue(
        mockEntities.religion,
      );
      civilStatusRepository.findByDescription.mockResolvedValue(
        mockEntities.civilStatus,
      );
      addressCityRepository.findByDescription.mockResolvedValue(
        mockEntities.homeAddressCity,
      );
      addressProvinceRepository.findByDescription.mockResolvedValue(
        mockEntities.homeAddressProvince,
      );
      departmentRepository.findByDescription.mockResolvedValue(
        mockEntities.department,
      );

      employeeRepository.update.mockResolvedValue(true);
      employeeRepository.findById
        .mockResolvedValueOnce(mockEmployee)
        .mockResolvedValueOnce(mockUpdatedEmployee);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        employeeId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE,
        expect.any(Function),
      );
      expect(employeeRepository.findById).toHaveBeenCalledWith(
        employeeId,
        mockManager,
      );
      expect(employeeRepository.update).toHaveBeenCalledWith(
        employeeId,
        expect.objectContaining({
          fname: 'Jane',
          lname: 'Smith',
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockEmployee.id,
              fname: mockEmployee.fname,
              lname: mockEmployee.lname,
              idNumber: mockEmployee.idNumber,
              bioNumber: mockEmployee.bioNumber,
              branch: mockEmployee.branch,
              jobTitle: mockEmployee.jobTitle,
              employeeStatus: mockEmployee.employeeStatus,
            },
            newData: {
              id: mockUpdatedEmployee.id,
              fname: mockUpdatedEmployee.fname,
              lname: mockUpdatedEmployee.lname,
              idNumber: mockUpdatedEmployee.idNumber,
              bioNumber: mockUpdatedEmployee.bioNumber,
              branch: mockUpdatedEmployee.branch,
              jobTitle: mockUpdatedEmployee.jobTitle,
              employeeStatus: mockUpdatedEmployee.employeeStatus,
            },
          }),
          description: `Updated employee: ${mockUpdatedEmployee.fname} ${mockUpdatedEmployee.lname}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: true,
          statusCode: 200,
          createdBy: mockUserId,
        }),
        mockManager,
      );
      expect(result).toEqual(mockUpdatedEmployee);
    });

    it('should throw NotFoundException when employee is not found', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute(
          employeeId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepository.findById).toHaveBeenCalledWith(
        employeeId,
        mockManager,
      );
      expect(employeeRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when employee with same idNumber exists (different employee)', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      const duplicateEmployee = { ...mockEmployee, id: 2 };
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.findByIdNumber.mockResolvedValue(duplicateEmployee);

      // Act & Assert
      await expect(
        useCase.execute(
          employeeId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepository.findByIdNumber).toHaveBeenCalledWith(
        'EMP001',
        mockManager,
      );
      expect(employeeRepository.update).not.toHaveBeenCalled();
    });

    it('should throw SomethinWentWrongException when update fails', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.findByIdNumber.mockResolvedValue(null);
      employeeRepository.findByBioNumber.mockResolvedValue(null);
      branchRepository.findByDescription.mockResolvedValue(mockEntities.branch);
      citizenshipRepository.findByDescription.mockResolvedValue(
        mockEntities.citizenship,
      );
      jobTitleRepository.findByDescription.mockResolvedValue(
        mockEntities.jobTitle,
      );
      employeeStatusRepository.findByDescription.mockResolvedValue(
        mockEntities.employeeStatus,
      );
      religionRepository.findByDescription.mockResolvedValue(
        mockEntities.religion,
      );
      civilStatusRepository.findByDescription.mockResolvedValue(
        mockEntities.civilStatus,
      );
      addressCityRepository.findByDescription.mockResolvedValue(
        mockEntities.homeAddressCity,
      );
      addressProvinceRepository.findByDescription.mockResolvedValue(
        mockEntities.homeAddressProvince,
      );
      departmentRepository.findByDescription.mockResolvedValue(
        mockEntities.department,
      );

      employeeRepository.update.mockResolvedValue(false);

      // Act & Assert
      await expect(
        useCase.execute(
          employeeId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(employeeRepository.update).toHaveBeenCalledWith(
        employeeId,
        expect.any(Object),
        mockManager,
      );
    });

    it('should handle update failure and log error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.findByIdNumber.mockResolvedValue(null);
      employeeRepository.findByBioNumber.mockResolvedValue(null);
      branchRepository.findByDescription.mockResolvedValue(mockEntities.branch);
      citizenshipRepository.findByDescription.mockResolvedValue(
        mockEntities.citizenship,
      );
      jobTitleRepository.findByDescription.mockResolvedValue(
        mockEntities.jobTitle,
      );
      employeeStatusRepository.findByDescription.mockResolvedValue(
        mockEntities.employeeStatus,
      );
      religionRepository.findByDescription.mockResolvedValue(
        mockEntities.religion,
      );
      civilStatusRepository.findByDescription.mockResolvedValue(
        mockEntities.civilStatus,
      );
      addressCityRepository.findByDescription.mockResolvedValue(
        mockEntities.homeAddressCity,
      );
      addressProvinceRepository.findByDescription.mockResolvedValue(
        mockEntities.homeAddressProvince,
      );
      departmentRepository.findByDescription.mockResolvedValue(
        mockEntities.department,
      );

      employeeRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          employeeId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({ id: employeeId, dto: mockUpdateCommand }),
          description: `Failed to update employee with ID: ${employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: false,
          errorMessage: 'Database connection failed',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.findByIdNumber.mockResolvedValue(null);
      employeeRepository.findByBioNumber.mockResolvedValue(null);
      branchRepository.findByDescription.mockResolvedValue(mockEntities.branch);
      citizenshipRepository.findByDescription.mockResolvedValue(
        mockEntities.citizenship,
      );
      jobTitleRepository.findByDescription.mockResolvedValue(
        mockEntities.jobTitle,
      );
      employeeStatusRepository.findByDescription.mockResolvedValue(
        mockEntities.employeeStatus,
      );
      religionRepository.findByDescription.mockResolvedValue(
        mockEntities.religion,
      );
      civilStatusRepository.findByDescription.mockResolvedValue(
        mockEntities.civilStatus,
      );
      addressCityRepository.findByDescription.mockResolvedValue(
        mockEntities.homeAddressCity,
      );
      addressProvinceRepository.findByDescription.mockResolvedValue(
        mockEntities.homeAddressProvince,
      );
      departmentRepository.findByDescription.mockResolvedValue(
        mockEntities.department,
      );

      employeeRepository.update.mockResolvedValue(true);
      employeeRepository.findById
        .mockResolvedValueOnce(mockEmployee)
        .mockResolvedValueOnce(mockUpdatedEmployee);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        employeeId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null,
          userAgent: null,
          sessionId: null,
          username: null,
        }),
        mockManager,
      );
      expect(result).toEqual(mockUpdatedEmployee);
    });
  });
});
