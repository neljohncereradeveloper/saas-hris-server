import { Test, TestingModule } from '@nestjs/testing';
import { CreateWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/create-workexp-jobtitle.use-case';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateWorkExpJobTitleCommand } from '@features/201-files/application/commands/workexp-jobtitle/create-workexp-jobtitle.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('CreateWorkExpJobTitleUseCase', () => {
  let useCase: CreateWorkExpJobTitleUseCase;
  let workExpJobTitleRepository: jest.Mocked<WorkExpJobTitleRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCreateCommand: CreateWorkExpJobTitleCommand = {
    desc1: 'Software Engineer',
  };

  const mockCreatedWorkExpJobTitle = new WorkExpJobTitle({
    id: 1,
    desc1: 'Software Engineer',
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
    const mockWorkExpJobTitleRepository = {
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
        CreateWorkExpJobTitleUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
          useValue: mockWorkExpJobTitleRepository,
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

    useCase = module.get<CreateWorkExpJobTitleUseCase>(
      CreateWorkExpJobTitleUseCase,
    );
    workExpJobTitleRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
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
    it('should successfully create a work experience job title and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.create.mockResolvedValue(
        mockCreatedWorkExpJobTitle,
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
        CONSTANTS_LOG_ACTION.CREATE_WORKEXPJOBTITLE,
        expect.any(Function),
      );
      expect(workExpJobTitleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_WORKEXPJOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPJOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            workexpjobtitleData: {
              id: mockCreatedWorkExpJobTitle.id,
              desc1: mockCreatedWorkExpJobTitle.desc1,
              isActive: mockCreatedWorkExpJobTitle.isActive,
            },
          }),
          description: `Created new workexpjobtitle: ${mockCreatedWorkExpJobTitle.desc1}`,
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
      expect(result).toEqual(mockCreatedWorkExpJobTitle);
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
      workExpJobTitleRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(workExpJobTitleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_WORKEXPJOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPJOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create workexpjobtitle: ${mockCreateCommand.desc1}`,
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
      workExpJobTitleRepository.create.mockResolvedValue(
        mockCreatedWorkExpJobTitle,
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(workExpJobTitleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
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
      expect(result).toEqual(mockCreatedWorkExpJobTitle);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.create.mockRejectedValue('Unknown error');
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

    it('should handle empty job title', async () => {
      // Arrange
      const emptyCommand: CreateWorkExpJobTitleCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.create.mockResolvedValue(
        new WorkExpJobTitle({
          id: 1,
          desc1: '',
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(emptyCommand, mockUserId);

      // Assert
      expect(workExpJobTitleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: '',
        }),
        mockManager,
      );
      expect(result.desc1).toBe('');
    });

    it('should handle long job title', async () => {
      // Arrange
      const longJobTitle = 'A'.repeat(1000);
      const longCommand: CreateWorkExpJobTitleCommand = {
        desc1: longJobTitle,
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.create.mockResolvedValue(
        new WorkExpJobTitle({
          id: 1,
          desc1: longJobTitle,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(longCommand, mockUserId);

      // Assert
      expect(workExpJobTitleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: longJobTitle,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(longJobTitle);
    });

    it('should handle special characters in job title', async () => {
      // Arrange
      const specialCommand: CreateWorkExpJobTitleCommand = {
        desc1: 'Software Engineer® - Special Characters!@#$%^&*()',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.create.mockResolvedValue(
        new WorkExpJobTitle({
          id: 1,
          desc1: specialCommand.desc1,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(specialCommand, mockUserId);

      // Assert
      expect(workExpJobTitleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: specialCommand.desc1,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(specialCommand.desc1);
    });

    it('should handle job title with numbers', async () => {
      // Arrange
      const numberCommand: CreateWorkExpJobTitleCommand = {
        desc1: 'Software Engineer Level 2',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.create.mockResolvedValue(
        new WorkExpJobTitle({
          id: 1,
          desc1: numberCommand.desc1,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(numberCommand, mockUserId);

      // Assert
      expect(workExpJobTitleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: numberCommand.desc1,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(numberCommand.desc1);
    });

    it('should handle job title with spaces', async () => {
      // Arrange
      const spacedCommand: CreateWorkExpJobTitleCommand = {
        desc1: '  Software Engineer  ',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.create.mockResolvedValue(
        new WorkExpJobTitle({
          id: 1,
          desc1: spacedCommand.desc1,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(spacedCommand, mockUserId);

      // Assert
      expect(workExpJobTitleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: spacedCommand.desc1,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(spacedCommand.desc1);
    });
  });
});
