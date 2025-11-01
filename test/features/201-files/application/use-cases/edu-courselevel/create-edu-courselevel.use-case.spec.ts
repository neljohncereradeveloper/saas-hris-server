import { Test, TestingModule } from '@nestjs/testing';
import { CreateEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/create-edu-courselevel.use-case';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { EduCourseLevel } from '@features/201-files/domain/models/edu-courselevel.model';
import { CreateEduCourseLevelCommand } from '@features/201-files/application/commands/edu-course-level/create-edu-course-level.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';

describe('CreateEduCourseLevelUseCase', () => {
  let useCase: CreateEduCourseLevelUseCase;
  let eduCourseLevelRepository: jest.Mocked<EduCourseLevelRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCreateCommand: CreateEduCourseLevelCommand = {
    desc1: 'Bachelor',
  };

  const mockCreatedEduCourseLevel = new EduCourseLevel({
    id: 1,
    desc1: 'Bachelor',
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
    const mockEduCourseLevelRepository = {
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
        CreateEduCourseLevelUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
          useValue: mockEduCourseLevelRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateEduCourseLevelUseCase>(
      CreateEduCourseLevelUseCase,
    );
    eduCourseLevelRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
    );
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create an edu course level and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.create.mockResolvedValue(
        mockCreatedEduCourseLevel,
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_EDUCOURSELEVEL,
        expect.any(Function),
      );
      expect(eduCourseLevelRepository.create).toHaveBeenCalledWith(
        mockCreateCommand,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDUCOURSELEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            educourselevelData: {
              id: mockCreatedEduCourseLevel.id,
              desc1: mockCreatedEduCourseLevel.desc1,
              isActive: mockCreatedEduCourseLevel.isActive,
            },
          }),
          description: `Created new educourselevel: ${mockCreatedEduCourseLevel.desc1}`,
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
      expect(result).toBe(mockCreatedEduCourseLevel);
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.create.mockResolvedValue(
        mockCreatedEduCourseLevel,
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(eduCourseLevelRepository.create).toHaveBeenCalledWith(
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
      expect(result).toBe(mockCreatedEduCourseLevel);
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
      eduCourseLevelRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDUCOURSELEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create educourselevel: ${mockCreateCommand.desc1}`,
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
      eduCourseLevelRepository.create.mockRejectedValue('Unknown error');
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
      const emptyDescCommand: CreateEduCourseLevelCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.create.mockResolvedValue(
        mockCreatedEduCourseLevel,
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        emptyDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduCourseLevelRepository.create).toHaveBeenCalledWith(
        emptyDescCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduCourseLevel);
    });

    it('should handle special characters in desc1', async () => {
      // Arrange
      const specialCharCommand: CreateEduCourseLevelCommand = {
        desc1: "Master's Degree & PhD",
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.create.mockResolvedValue(
        mockCreatedEduCourseLevel,
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        specialCharCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduCourseLevelRepository.create).toHaveBeenCalledWith(
        specialCharCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduCourseLevel);
    });

    it('should handle very long desc1', async () => {
      // Arrange
      const longDescCommand: CreateEduCourseLevelCommand = {
        desc1:
          'Very Long Course Level Description That Exceeds Normal Length Limits and Should Still Be Handled Properly',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.create.mockResolvedValue(
        mockCreatedEduCourseLevel,
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        longDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduCourseLevelRepository.create).toHaveBeenCalledWith(
        longDescCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduCourseLevel);
    });
  });
});
