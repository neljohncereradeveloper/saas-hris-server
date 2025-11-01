import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/soft-delete-workexp.use-case';
import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
import { WorkExp } from '@features/201-files/domain/models/workexp.model';
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

describe('SoftDeleteWorkexpUseCase', () => {
  let useCase: SoftDeleteWorkExpUseCase;
  let workexpRepository: jest.Mocked<WorkExpRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockWorkExpId = 1;
  const mockExistingWorkExp = new WorkExp({
    id: mockWorkExpId,
    employeeId: 1,
    desc1: 'Software Engineer at Tech Corp',
    companyId: 1,
    workexpJobTitleId: 1,
    years: '2020-2023',
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
    const mockWorkexpRepository = {
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
        SoftDeleteWorkExpUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXP,
          useValue: mockWorkexpRepository,
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

    useCase = module.get<SoftDeleteWorkExpUseCase>(SoftDeleteWorkExpUseCase);
    workexpRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.WORKEXP);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully deactivate a work experience and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workexpRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXP,
        expect.any(Function),
      );
      expect(workexpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workexpRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXP,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId: mockUserId,
          details: JSON.stringify({
            workexpData: {
              id: mockExistingWorkExp.id,
              previousStatus: mockExistingWorkExp.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockExistingWorkExp.desc1} has been deactivated`,
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

    it('should successfully activate a work experience and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workexpRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(workexpRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `${mockExistingWorkExp.desc1} has been activated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when work experience does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockWorkExpId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workexpRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXP,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId: mockUserId,
          details: JSON.stringify({ id: mockWorkExpId, isActive }),
          description: `Failed to deactivate workexp with ID: ${mockWorkExpId}`,
          isSuccess: false,
          errorMessage: 'Workexp not found',
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
      workexpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workexpRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockWorkExpId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(workexpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workexpRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Workexp soft delete failed',
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
      workexpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workexpRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockWorkExpId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(workexpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workexpRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpId,
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
      workexpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workexpRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockWorkExpId, isActive, mockUserId);

      // Assert
      expect(workexpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workexpRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpId,
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
      workexpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workexpRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockWorkExpId, isActive, mockUserId, mockRequestInfo),
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
      workexpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workexpRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `Software Engineer at Tech Corp has been activated`,
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
      workexpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workexpRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `Software Engineer at Tech Corp has been deactivated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should handle zero work experience ID', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(0, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpRepository.findById).toHaveBeenCalledWith(0, mockManager);
    });

    it('should handle negative work experience ID', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(-1, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpRepository.findById).toHaveBeenCalledWith(-1, mockManager);
    });

    it('should handle large work experience ID', async () => {
      // Arrange
      const isActive = false;
      const largeId = 999999;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(largeId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpRepository.findById).toHaveBeenCalledWith(
        largeId,
        mockManager,
      );
    });
  });
});
