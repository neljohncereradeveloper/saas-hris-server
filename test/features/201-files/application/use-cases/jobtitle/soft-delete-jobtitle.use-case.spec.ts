import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteJobTitleUseCase } from '@features/201-files/application/use-cases/jobtitle/soft-delete-jobtitle.use-case';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { JobTitle } from '@features/201-files/domain/models/jobtitle.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('SoftDeleteJobTitleUseCase', () => {
  let useCase: SoftDeleteJobTitleUseCase;
  let jobTitleRepository: jest.Mocked<JobTitleRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockJobTitleId = 1;
  const mockJobTitle = new JobTitle({
    id: mockJobTitleId,
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
    const mockJobTitleRepository = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftDeleteJobTitleUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.JOBTITLE,
          useValue: mockJobTitleRepository,
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

    useCase = module.get<SoftDeleteJobTitleUseCase>(SoftDeleteJobTitleUseCase);
    jobTitleRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully soft delete a jobtitle record and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(mockJobTitle);
      jobTitleRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockJobTitleId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_JOBTITLE,
        expect.any(Function),
      );
      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockJobTitleId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_JOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.JOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            jobtitleData: {
              id: mockJobTitle.id,
              desc1: mockJobTitle.desc1,
              previousStatus: mockJobTitle.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockJobTitle.desc1} has been deactivated`,
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
      expect(result).toBe(true);
    });

    it('should successfully activate a jobtitle record and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(mockJobTitle);
      jobTitleRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockJobTitleId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_JOBTITLE,
        expect.any(Function),
      );
      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockJobTitleId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_JOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.JOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            jobtitleData: {
              id: mockJobTitle.id,
              desc1: mockJobTitle.desc1,
              previousStatus: mockJobTitle.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockJobTitle.desc1} has been activated`,
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
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when jobtitle record does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockJobTitleId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_JOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.JOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockJobTitleId,
            isActive,
          }),
          description: `Failed to deactivate jobtitle with ID: ${mockJobTitleId}`,
          isSuccess: false,
          errorMessage: 'Jobtitle not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should throw SomethinWentWrongException when soft delete fails', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(mockJobTitle);
      jobTitleRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockJobTitleId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockJobTitleId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Jobtitle soft delete failed',
        }),
        mockManager,
      );
    });

    it('should handle soft delete failure and log error', async () => {
      // Arrange
      const isActive = false;
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(mockJobTitle);
      jobTitleRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockJobTitleId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Database connection failed',
        }),
        mockManager,
      );
    });

    it('should work without request info', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(mockJobTitle);
      jobTitleRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockJobTitleId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockJobTitleId,
        isActive,
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
      expect(result).toBe(true);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(mockJobTitle);
      jobTitleRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockJobTitleId, isActive, mockUserId, mockRequestInfo),
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
