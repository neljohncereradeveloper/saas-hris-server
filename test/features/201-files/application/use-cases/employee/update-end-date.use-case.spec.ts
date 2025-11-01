import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEndDateUseCase } from '@features/201-files/application/use-cases/employee/update-end-date.use-case';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { Employee } from '@features/shared/domain/models/employee.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateEndDateCommand } from '@features/201-files/application/commands/employee/update-end-date.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared';

describe('UpdateEndDateUseCase', () => {
  let useCase: UpdateEndDateUseCase;
  let employeeRepository: jest.Mocked<EmployeeRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

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
    endDate: new Date('2024-12-31'),
  });

  const mockUpdateCommand: UpdateEndDateCommand = {
    endDate: new Date('2024-12-31'),
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockEmployeeRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEndDateUseCase,
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
      ],
    }).compile();

    useCase = module.get<UpdateEndDateUseCase>(UpdateEndDateUseCase);
    employeeRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update end date and log the activity', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
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
        CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_END_DATE,
        expect.any(Function),
      );
      expect(employeeRepository.findById).toHaveBeenCalledWith(
        employeeId,
        mockManager,
      );
      expect(employeeRepository.update).toHaveBeenCalledWith(
        employeeId,
        { endDate: mockUpdateCommand.endDate },
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_END_DATE,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({
            id: employeeId,
            oldEndDate: mockEmployee.endDate,
            newEndDate: mockUpdatedEmployee.endDate,
          }),
          description: `Updated end date for employee: ${mockUpdatedEmployee.fname} ${mockUpdatedEmployee.lname}`,
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
        { endDate: mockUpdateCommand.endDate },
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
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_END_DATE,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({
            id: employeeId,
            endDate: mockUpdateCommand,
          }),
          description: `Failed to update end date for employee with ID: ${employeeId}`,
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

    it('should handle setting end date to null', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      const nullEndDateCommand: UpdateEndDateCommand = {
        endDate: null,
      };
      const employeeWithNullEndDate = new Employee({
        ...mockEmployee,
        endDate: undefined,
      });

      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.update.mockResolvedValue(true);
      employeeRepository.findById
        .mockResolvedValueOnce(mockEmployee)
        .mockResolvedValueOnce(employeeWithNullEndDate);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        employeeId,
        nullEndDateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(employeeRepository.update).toHaveBeenCalledWith(
        employeeId,
        { endDate: undefined },
        mockManager,
      );
      expect(result).toEqual(employeeWithNullEndDate);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          employeeId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toBe('Unknown error');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Unknown error',
        }),
        mockManager,
      );
    });

    it('should handle future end date', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      const futureDate = new Date('2025-12-31');
      const futureEndDateCommand: UpdateEndDateCommand = {
        endDate: futureDate,
      };
      const employeeWithFutureEndDate = new Employee({
        ...mockEmployee,
        endDate: futureDate,
      });

      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.update.mockResolvedValue(true);
      employeeRepository.findById
        .mockResolvedValueOnce(mockEmployee)
        .mockResolvedValueOnce(employeeWithFutureEndDate);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        employeeId,
        futureEndDateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(employeeRepository.update).toHaveBeenCalledWith(
        employeeId,
        { endDate: futureDate },
        mockManager,
      );
      expect(result).toEqual(employeeWithFutureEndDate);
    });
  });
});
