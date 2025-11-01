import { Test, TestingModule } from '@nestjs/testing';
import { CreateEduLevelUseCase } from '@features/201-files/application/use-cases/edu-level/create-edu-level.use-case';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { EduLevel } from '@features/201-files/domain/models/edu-level.model';
import { CreateEduLevelCommand } from '@features/201-files/application/commands/edu-level/create-edu-level.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';

describe('CreateEduLevelUseCase', () => {
  let useCase: CreateEduLevelUseCase;
  let eduLevelRepository: jest.Mocked<EduLevelRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCreateCommand: CreateEduLevelCommand = {
    desc1: 'Elementary',
  };

  const mockCreatedEduLevel = new EduLevel({
    id: 1,
    desc1: 'Elementary',
    isActive: true,
  });

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockEduLevelRepository = {
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
        CreateEduLevelUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDULEVEL,
          useValue: mockEduLevelRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateEduLevelUseCase>(CreateEduLevelUseCase);
    eduLevelRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create an edu level and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.create.mockResolvedValue(mockCreatedEduLevel);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_EDULEVEL,
        expect.any(Function),
      );
      expect(eduLevelRepository.create).toHaveBeenCalledWith(
        mockCreateCommand,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDULEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDULEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            edulevelData: {
              id: mockCreatedEduLevel.id,
              desc1: mockCreatedEduLevel.desc1,
              isActive: mockCreatedEduLevel.isActive,
            },
          }),
          description: `Created new edulevel: ${mockCreatedEduLevel.desc1}`,
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
      expect(result).toBe(mockCreatedEduLevel);
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.create.mockResolvedValue(mockCreatedEduLevel);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(eduLevelRepository.create).toHaveBeenCalledWith(
        mockCreateCommand,
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
      expect(result).toBe(mockCreatedEduLevel);
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
      eduLevelRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDULEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDULEVEL,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create edulevel: ${mockCreateCommand.desc1}`,
          isSuccess: false,
          errorMessage: 'Database connection failed',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.create.mockRejectedValue('Unknown error');
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

    it('should handle empty desc1', async () => {
      // Arrange
      const emptyDescCommand: CreateEduLevelCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.create.mockResolvedValue(mockCreatedEduLevel);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        emptyDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduLevelRepository.create).toHaveBeenCalledWith(
        emptyDescCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduLevel);
    });

    it('should handle special characters in desc1', async () => {
      // Arrange
      const specialCharCommand: CreateEduLevelCommand = {
        desc1: 'Pre-School & Kindergarten',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.create.mockResolvedValue(mockCreatedEduLevel);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        specialCharCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduLevelRepository.create).toHaveBeenCalledWith(
        specialCharCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduLevel);
    });

    it('should handle very long desc1', async () => {
      // Arrange
      const longDescCommand: CreateEduLevelCommand = {
        desc1:
          'Very Long Education Level Description That Exceeds Normal Length Limits and Should Still Be Handled Properly',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.create.mockResolvedValue(mockCreatedEduLevel);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        longDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduLevelRepository.create).toHaveBeenCalledWith(
        longDescCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduLevel);
    });
  });
});
