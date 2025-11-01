import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/soft-delete-workexp-jobtitle.use-case';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('SoftDeleteWorkExpJobTitleUseCase', () => {
  let useCase: SoftDeleteWorkExpJobTitleUseCase;
  let workExpJobTitleRepository: jest.Mocked<WorkExpJobTitleRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockWorkExpJobTitleId = 1;
  const mockExistingWorkExpJobTitle = new WorkExpJobTitle({
    id: mockWorkExpJobTitleId,
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
        SoftDeleteWorkExpJobTitleUseCase,
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

    useCase = module.get<SoftDeleteWorkExpJobTitleUseCase>(
      SoftDeleteWorkExpJobTitleUseCase,
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
    it('should successfully deactivate a work experience job title and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXPJOBTITLE,
        expect.any(Function),
      );
      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXPJOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPJOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            workexpjobtitleData: {
              id: mockExistingWorkExpJobTitle.id,
              desc1: mockExistingWorkExpJobTitle.desc1,
              previousStatus: mockExistingWorkExpJobTitle.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockExistingWorkExpJobTitle.desc1} has been deactivated`,
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

    it('should successfully activate a work experience job title and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(workExpJobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `${mockExistingWorkExpJobTitle.desc1} has been activated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when work experience job title does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpJobTitleId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXPJOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPJOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({ id: mockWorkExpJobTitleId, isActive }),
          description: `Failed to deactivate workexpjobtitle with ID: ${mockWorkExpJobTitleId}`,
          isSuccess: false,
          errorMessage: 'WorkexpJobtitle not found',
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
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpJobTitleId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'WorkexpJobtitle soft delete failed',
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
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpJobTitleId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        isActive,
        mockManager,
      );
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
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
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
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpJobTitleId,
          isActive,
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

    it('should handle activation with correct log message', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `Software Engineer has been activated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should handle deactivation with correct log message', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `Software Engineer has been deactivated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should handle zero work experience job title ID', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(0, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        0,
        mockManager,
      );
    });

    it('should handle negative work experience job title ID', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(-1, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        -1,
        mockManager,
      );
    });

    it('should handle large work experience job title ID', async () => {
      // Arrange
      const isActive = false;
      const largeId = 999999;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(largeId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        largeId,
        mockManager,
      );
    });
  });
});
