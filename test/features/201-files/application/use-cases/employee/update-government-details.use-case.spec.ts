import { Test, TestingModule } from '@nestjs/testing';
import { UpdateGovernmentDetailsUseCase } from '@features/201-files/application/use-cases/employee/update-government-details.use-case';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { Employee } from '@features/shared/domain/models/employee.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateGovernmentDetailsCommand } from '@features/201-files/application/commands/employee/update-government-details.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared';

describe('UpdateGovernmentDetailsUseCase', () => {
  let useCase: UpdateGovernmentDetailsUseCase;
  let employeeRepository: jest.Mocked<EmployeeRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEmployee = new Employee({
    id: 1,
    fname: 'John',
    lname: 'Doe',
    idNumber: 'EMP001',
    bioNumber: 'BIO001',
    branch: 'Main Branch',
    jobTitle: 'Software Developer',
    employeeStatus: 'Active',
    jobTitleId: 1,
    employeeStatusId: 1,
    branchId: 1,
    hireDate: new Date('2023-01-01'),
    birthDate: new Date('1990-01-01'),
    homeAddressStreet: '123 Main St',
    homeAddressCity: 'New York',
    homeAddressProvince: 'NY',
    homeAddressZipCode: '10001',
    religion: 'Christian',
    civilStatus: 'Single',
    religionId: 1,
    civilStatusId: 1,
    homeAddressCityId: 1,
    homeAddressProvinceId: 1,
    phic: 'PHIC001',
    hdmf: 'HDMF001',
    sssNo: 'SSS001',
    tinNo: 'TIN001',
    taxExemptCode: 'TAX001',
  });

  const mockUpdatedEmployee = new Employee({
    ...mockEmployee,
    phic: 'PHIC002',
    hdmf: 'HDMF002',
    sssNo: 'SSS002',
    tinNo: 'TIN002',
    taxExemptCode: 'TAX002',
  });

  const mockUpdateCommand: UpdateGovernmentDetailsCommand = {
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

  beforeEach(async () => {
    const mockEmployeeRepository = {
      findById: jest.fn(),
      updateEmployeeGovernmentDetails: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGovernmentDetailsUseCase,
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

    useCase = module.get<UpdateGovernmentDetailsUseCase>(
      UpdateGovernmentDetailsUseCase,
    );
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
    it('should successfully update government details and log the activity', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.updateEmployeeGovernmentDetails.mockResolvedValue(
        true,
      );
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
        CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_GOVERNMENT_DETAILS,
        expect.any(Function),
      );
      expect(employeeRepository.findById).toHaveBeenCalledWith(
        employeeId,
        mockManager,
      );
      expect(
        employeeRepository.updateEmployeeGovernmentDetails,
      ).toHaveBeenCalledWith(
        employeeId,
        {
          phic: 'PHIC002',
          hdmf: 'HDMF002',
          sssNo: 'SSS002',
          tinNo: 'TIN002',
          taxExemptCode: 'TAX002',
        },
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_GOVERNMENT_DETAILS,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({
            id: employeeId,
            oldPhic: mockEmployee.phic,
            newPhic: mockUpdatedEmployee.phic,
            oldHdmf: mockEmployee.hdmf,
            newHdmf: mockUpdatedEmployee.hdmf,
            oldSssNo: mockEmployee.sssNo,
            newSssNo: mockUpdatedEmployee.sssNo,
            oldTinNo: mockEmployee.tinNo,
            newTinNo: mockUpdatedEmployee.tinNo,
            oldTaxExemptCode: mockEmployee.taxExemptCode,
            newTaxExemptCode: mockUpdatedEmployee.taxExemptCode,
          }),
          description: `Updated government details for employee: ${mockUpdatedEmployee.fname} ${mockUpdatedEmployee.lname}`,
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
      expect(
        employeeRepository.updateEmployeeGovernmentDetails,
      ).not.toHaveBeenCalled();
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
      employeeRepository.updateEmployeeGovernmentDetails.mockResolvedValue(
        false,
      );

      // Act & Assert
      await expect(
        useCase.execute(
          employeeId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(
        employeeRepository.updateEmployeeGovernmentDetails,
      ).toHaveBeenCalledWith(
        employeeId,
        {
          phic: 'PHIC002',
          hdmf: 'HDMF002',
          sssNo: 'SSS002',
          tinNo: 'TIN002',
          taxExemptCode: 'TAX002',
        },
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
      employeeRepository.updateEmployeeGovernmentDetails.mockRejectedValue(
        mockError,
      );
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
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_GOVERNMENT_DETAILS,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({
            id: employeeId,
            governmentDetails: mockUpdateCommand,
          }),
          description: `Failed to update government details for employee with ID: ${employeeId}`,
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
      employeeRepository.updateEmployeeGovernmentDetails.mockResolvedValue(
        true,
      );
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

    it('should handle partial government details update', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      const partialUpdateCommand: UpdateGovernmentDetailsCommand = {
        phic: 'PHIC003',
        hdmf: 'HDMF003',
      };
      const partiallyUpdatedEmployee = new Employee({
        ...mockEmployee,
        phic: 'PHIC003',
        hdmf: 'HDMF003',
      });

      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.updateEmployeeGovernmentDetails.mockResolvedValue(
        true,
      );
      employeeRepository.findById
        .mockResolvedValueOnce(mockEmployee)
        .mockResolvedValueOnce(partiallyUpdatedEmployee);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        employeeId,
        partialUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(
        employeeRepository.updateEmployeeGovernmentDetails,
      ).toHaveBeenCalledWith(
        employeeId,
        {
          phic: 'PHIC003',
          hdmf: 'HDMF003',
        },
        mockManager,
      );
      expect(result).toEqual(partiallyUpdatedEmployee);
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
      employeeRepository.updateEmployeeGovernmentDetails.mockRejectedValue(
        'Unknown error',
      );
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
  });
});
