import { Test, TestingModule } from '@nestjs/testing';
import { FindEmployeeByIdUseCase } from '@features/201-files/application/use-cases/employee/find-employee-by-id.use-case';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { Employee } from '@features/shared/domain/models/employee.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';

describe('FindEmployeeByIdUseCase', () => {
  let useCase: FindEmployeeByIdUseCase;
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
  });

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
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEmployeeByIdUseCase,
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

    useCase = module.get<FindEmployeeByIdUseCase>(FindEmployeeByIdUseCase);
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
    it('should successfully find an employee and log the activity', async () => {
      // Arrange
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        employeeId,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
        expect.any(Function),
      );
      expect(employeeRepository.findById).toHaveBeenCalledWith(
        employeeId,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({
            employeeId: employeeId,
            employeeName: `${mockEmployee.fname} ${mockEmployee.lname}`,
          }),
          description: `Retrieved employee: ${mockEmployee.fname} ${mockEmployee.lname}`,
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
      expect(result).toEqual(mockEmployee);
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
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(employeeId, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepository.findById).toHaveBeenCalledWith(
        employeeId,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({ employeeId: employeeId }),
          description: `Failed to find employee with ID: ${employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: false,
          errorMessage: 'Employee not found',
          statusCode: 404,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should handle find failure and log error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      const employeeId = 1;
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.findById.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(employeeId, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUserId,
          details: JSON.stringify({ employeeId: employeeId }),
          description: `Failed to find employee with ID: ${employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: false,
          errorMessage: 'Database connection failed',
          statusCode: 404,
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
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(employeeId, mockUserId);

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
      expect(result).toEqual(mockEmployee);
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

      employeeRepository.findById.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(employeeId, mockUserId, mockRequestInfo),
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
