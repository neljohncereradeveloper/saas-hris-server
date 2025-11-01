import { Test, TestingModule } from '@nestjs/testing';
import { CreateEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/create-edu-school.use-case';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';
import { CreateEduSchoolCommand } from '@features/201-files/application/commands/edu-school/create-edu-school.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';

describe('CreateEduSchoolUseCase', () => {
  let useCase: CreateEduSchoolUseCase;
  let eduSchoolRepository: jest.Mocked<EduSchoolRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCreateCommand: CreateEduSchoolCommand = {
    desc1: 'University of the Philippines',
  };

  const mockCreatedEduSchool = new EduSchool({
    id: 1,
    desc1: 'University of the Philippines',
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
    const mockEduSchoolRepository = {
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
        CreateEduSchoolUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL,
          useValue: mockEduSchoolRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateEduSchoolUseCase>(CreateEduSchoolUseCase);
    eduSchoolRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create an edu school and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.create.mockResolvedValue(mockCreatedEduSchool);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_EDUSCHOOL,
        expect.any(Function),
      );
      expect(eduSchoolRepository.create).toHaveBeenCalledWith(
        mockCreateCommand,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDUSCHOOL,
          entity: CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId: mockUserId,
          details: JSON.stringify({
            eduschoolData: {
              id: mockCreatedEduSchool.id,
              desc1: mockCreatedEduSchool.desc1,
              isActive: mockCreatedEduSchool.isActive,
            },
          }),
          description: `Created new eduschool: ${mockCreatedEduSchool.desc1}`,
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
      expect(result).toBe(mockCreatedEduSchool);
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.create.mockResolvedValue(mockCreatedEduSchool);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(eduSchoolRepository.create).toHaveBeenCalledWith(
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
      expect(result).toBe(mockCreatedEduSchool);
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
      eduSchoolRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDUSCHOOL,
          entity: CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create eduschool: ${mockCreateCommand.desc1}`,
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
      eduSchoolRepository.create.mockRejectedValue('Unknown error');
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
      const emptyDescCommand: CreateEduSchoolCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.create.mockResolvedValue(mockCreatedEduSchool);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        emptyDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduSchoolRepository.create).toHaveBeenCalledWith(
        emptyDescCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduSchool);
    });

    it('should handle special characters in desc1', async () => {
      // Arrange
      const specialCharCommand: CreateEduSchoolCommand = {
        desc1: "St. Mary's College & University",
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.create.mockResolvedValue(mockCreatedEduSchool);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        specialCharCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduSchoolRepository.create).toHaveBeenCalledWith(
        specialCharCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduSchool);
    });

    it('should handle very long desc1', async () => {
      // Arrange
      const longDescCommand: CreateEduSchoolCommand = {
        desc1:
          'Very Long Education School Name That Exceeds Normal Length Limits and Should Still Be Handled Properly',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.create.mockResolvedValue(mockCreatedEduSchool);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        longDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduSchoolRepository.create).toHaveBeenCalledWith(
        longDescCommand,
        mockManager,
      );
      expect(result).toBe(mockCreatedEduSchool);
    });
  });
});
