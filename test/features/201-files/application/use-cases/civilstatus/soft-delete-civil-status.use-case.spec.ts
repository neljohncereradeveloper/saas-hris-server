import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteCivilStatusUseCase } from '@features/201-files/application/use-cases/civilstatus/soft-delete-civil-status.use-case';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { CivilStatus } from '@features/201-files/domain/models/civilstatus.model';
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

describe('SoftDeleteCivilStatusUseCase', () => {
  let useCase: SoftDeleteCivilStatusUseCase;
  let civilStatusRepository: jest.Mocked<CivilStatusRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCivilStatusId = 1;
  const mockCivilStatus = new CivilStatus({
    id: mockCivilStatusId,
    desc1: 'Single',
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
    const mockCivilStatusRepository = {
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
        SoftDeleteCivilStatusUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS,
          useValue: mockCivilStatusRepository,
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

    useCase = module.get<SoftDeleteCivilStatusUseCase>(
      SoftDeleteCivilStatusUseCase,
    );
    civilStatusRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully deactivate a civil status and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      civilStatusRepository.findById.mockResolvedValue(mockCivilStatus);
      civilStatusRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCivilStatusId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_CIVILSTATUS,
        expect.any(Function),
      );
      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.softDelete).toHaveBeenCalledWith(
        mockCivilStatusId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_CIVILSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.CIVILSTATUS,
          userId: mockUserId,
          details: JSON.stringify({
            civilStatusData: {
              id: mockCivilStatus.id,
              desc1: mockCivilStatus.desc1,
              previousStatus: mockCivilStatus.isActive,
              newStatus: isActive,
            },
          }),
          description: `Soft deleted civil status: ${mockCivilStatus.desc1}`,
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

    it('should successfully activate a civil status and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      civilStatusRepository.findById.mockResolvedValue(mockCivilStatus);
      civilStatusRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCivilStatusId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.softDelete).toHaveBeenCalledWith(
        mockCivilStatusId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `Soft deleted civil status: ${mockCivilStatus.desc1}`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when civil status does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      civilStatusRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCivilStatusId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_CIVILSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.CIVILSTATUS,
          userId: mockUserId,
          details: JSON.stringify({ id: mockCivilStatusId, isActive }),
          description: `Failed to soft delete civil status with ID: ${mockCivilStatusId}`,
          isSuccess: false,
          errorMessage: 'CivilStatus not found',
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
      civilStatusRepository.findById.mockResolvedValue(mockCivilStatus);
      civilStatusRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCivilStatusId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.softDelete).toHaveBeenCalledWith(
        mockCivilStatusId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'CivilStatus soft delete failed',
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
      civilStatusRepository.findById.mockResolvedValue(mockCivilStatus);
      civilStatusRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCivilStatusId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
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
      civilStatusRepository.findById.mockResolvedValue(mockCivilStatus);
      civilStatusRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCivilStatusId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.softDelete).toHaveBeenCalledWith(
        mockCivilStatusId,
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
      civilStatusRepository.findById.mockResolvedValue(mockCivilStatus);
      civilStatusRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCivilStatusId,
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
  });
});
