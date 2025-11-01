import { Test, TestingModule } from '@nestjs/testing';
import {
  UploadEmployeeImageUseCase,
  UploadEmployeeImageCommand,
} from '@features/201-files/application/use-cases/employee/upload-employee-image.use-case';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('UploadEmployeeImageUseCase', () => {
  let useCase: UploadEmployeeImageUseCase;
  let employeeRepository: jest.Mocked<EmployeeRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockUploadCommand: UploadEmployeeImageCommand = {
    employeeId: 1,
    imagePath: '/uploads/employees/employee-1.jpg',
    userId: 'user-123',
    requestInfo: {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      sessionId: 'session-123',
      username: 'testuser',
    },
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
      updateEmployeeImagePath: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadEmployeeImageUseCase,
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

    useCase = module.get<UploadEmployeeImageUseCase>(
      UploadEmployeeImageUseCase,
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
    it('should successfully upload employee image and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.updateEmployeeImagePath.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockUploadCommand);

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_IMAGE_PATH,
        expect.any(Function),
      );
      expect(employeeRepository.updateEmployeeImagePath).toHaveBeenCalledWith(
        mockUploadCommand.employeeId,
        mockUploadCommand.imagePath,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_IMAGE_PATH,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUploadCommand.userId,
          details: JSON.stringify({
            employeeId: mockUploadCommand.employeeId,
            imagePath: mockUploadCommand.imagePath,
          }),
          description: `Updated image for employee with ID: ${mockUploadCommand.employeeId}`,
          ipAddress: mockUploadCommand.requestInfo?.ipAddress,
          userAgent: mockUploadCommand.requestInfo?.userAgent,
          sessionId: mockUploadCommand.requestInfo?.sessionId,
          username: mockUploadCommand.requestInfo?.username,
          isSuccess: true,
          statusCode: 200,
          createdBy: mockUploadCommand.userId,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should return false when update fails', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.updateEmployeeImagePath.mockResolvedValue(false);

      // Act
      const result = await useCase.execute(mockUploadCommand);

      // Assert
      expect(employeeRepository.updateEmployeeImagePath).toHaveBeenCalledWith(
        mockUploadCommand.employeeId,
        mockUploadCommand.imagePath,
        mockManager,
      );
      expect(result).toBe(false);
      expect(activityLogRepository.create).not.toHaveBeenCalled();
    });

    it('should handle upload failure and log error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.updateEmployeeImagePath.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(useCase.execute(mockUploadCommand)).rejects.toThrow(
        'Database connection failed',
      );

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_IMAGE_PATH,
          entity: CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId: mockUploadCommand.userId,
          details: JSON.stringify({
            employeeId: mockUploadCommand.employeeId,
            imagePath: mockUploadCommand.imagePath,
          }),
          description: `Failed to update image for employee with ID: ${mockUploadCommand.employeeId}`,
          ipAddress: mockUploadCommand.requestInfo?.ipAddress,
          userAgent: mockUploadCommand.requestInfo?.userAgent,
          sessionId: mockUploadCommand.requestInfo?.sessionId,
          username: mockUploadCommand.requestInfo?.username,
          isSuccess: false,
          errorMessage: 'Database connection failed',
          statusCode: 500,
          createdBy: mockUploadCommand.userId,
        }),
        mockManager,
      );
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      const commandWithoutRequestInfo: UploadEmployeeImageCommand = {
        employeeId: 1,
        imagePath: '/uploads/employees/employee-1.jpg',
        userId: 'user-123',
      };

      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.updateEmployeeImagePath.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(commandWithoutRequestInfo);

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
      expect(result).toBe(true);
    });

    it('should handle different image paths', async () => {
      // Arrange
      const mockManager = {};
      const commandWithDifferentPath: UploadEmployeeImageCommand = {
        employeeId: 2,
        imagePath: '/uploads/employees/employee-2.png',
        userId: 'user-456',
        requestInfo: {
          ipAddress: '192.168.1.2',
          userAgent: 'Chrome/91.0',
          sessionId: 'session-456',
          username: 'testuser2',
        },
      };

      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.updateEmployeeImagePath.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(commandWithDifferentPath);

      // Assert
      expect(employeeRepository.updateEmployeeImagePath).toHaveBeenCalledWith(
        commandWithDifferentPath.employeeId,
        commandWithDifferentPath.imagePath,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: commandWithDifferentPath.userId,
          details: JSON.stringify({
            employeeId: commandWithDifferentPath.employeeId,
            imagePath: commandWithDifferentPath.imagePath,
          }),
          ipAddress: commandWithDifferentPath.requestInfo?.ipAddress,
          userAgent: commandWithDifferentPath.requestInfo?.userAgent,
          sessionId: commandWithDifferentPath.requestInfo?.sessionId,
          username: commandWithDifferentPath.requestInfo?.username,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.updateEmployeeImagePath.mockRejectedValue(
        'Unknown error',
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(useCase.execute(mockUploadCommand)).rejects.toBe(
        'Unknown error',
      );

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Unknown error',
        }),
        mockManager,
      );
    });

    it('should handle empty image path', async () => {
      // Arrange
      const mockManager = {};
      const commandWithEmptyPath: UploadEmployeeImageCommand = {
        employeeId: 1,
        imagePath: '',
        userId: 'user-123',
        requestInfo: mockRequestInfo,
      };

      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.updateEmployeeImagePath.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(commandWithEmptyPath);

      // Assert
      expect(employeeRepository.updateEmployeeImagePath).toHaveBeenCalledWith(
        commandWithEmptyPath.employeeId,
        commandWithEmptyPath.imagePath,
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should handle null image path', async () => {
      // Arrange
      const mockManager = {};
      const commandWithNullPath: UploadEmployeeImageCommand = {
        employeeId: 1,
        imagePath: null as any,
        userId: 'user-123',
        requestInfo: mockRequestInfo,
      };

      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );

      employeeRepository.updateEmployeeImagePath.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(commandWithNullPath);

      // Assert
      expect(employeeRepository.updateEmployeeImagePath).toHaveBeenCalledWith(
        commandWithNullPath.employeeId,
        commandWithNullPath.imagePath,
        mockManager,
      );
      expect(result).toBe(true);
    });
  });
});
