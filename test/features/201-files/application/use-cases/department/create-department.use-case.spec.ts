import { Test, TestingModule } from '@nestjs/testing';
import { CreateDepartmentUseCase } from '@features/201-files/application/use-cases/department/create-department.use-case';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { Dept } from '@features/201-files/domain/models/dept';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateDepartmentCommand } from '@features/201-files/application/commands/department/create-department.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('CreateDepartmentUseCase', () => {
  let useCase: CreateDepartmentUseCase;
  let departmentRepository: jest.Mocked<DepartmentRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockDepartment = new Dept({
    id: 1,
    desc1: 'IT Department',
    code: 'IT',
    designation: 'Information Technology',
    isActive: true,
  });

  const mockCreateCommand: CreateDepartmentCommand = {
    desc1: 'IT Department',
    costPerCent: 10.5,
    code: 'IT',
    designation: 'Information Technology',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockDepartmentRepository = {
      create: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDepartmentUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT,
          useValue: mockDepartmentRepository,
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

    useCase = module.get<CreateDepartmentUseCase>(CreateDepartmentUseCase);
    departmentRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create a department and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.create.mockResolvedValue(mockDepartment);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_DEPARTMENT,
        expect.any(Function),
      );
      expect(departmentRepository.create).toHaveBeenCalledWith(
        new Dept(mockCreateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_DEPARTMENT,
          entity: CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId: mockUserId,
          details: JSON.stringify({
            departmentData: {
              id: mockDepartment.id,
              desc1: mockDepartment.desc1,
              code: mockDepartment.code,
              designation: mockDepartment.designation,
              isActive: mockDepartment.isActive,
            },
          }),
          description: `Created new department: ${mockDepartment.desc1}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: true,
          statusCode: 201,
          createdBy: mockUserId,
        }),
        mockManager,
      );
      expect(result).toEqual(mockDepartment);
    });

    it('should handle creation failure and log error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(departmentRepository.create).toHaveBeenCalledWith(
        new Dept(mockCreateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_DEPARTMENT,
          entity: CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create department: ${mockCreateCommand.desc1}`,
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
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.create.mockResolvedValue(mockDepartment);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(departmentRepository.create).toHaveBeenCalledWith(
        new Dept(mockCreateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null,
          userAgent: null,
          sessionId: null,
          username: null,
        }),
        mockManager,
      );
      expect(result).toEqual(mockDepartment);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.create.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
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
