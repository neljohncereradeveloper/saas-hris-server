import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteReferenceUseCase } from '@features/201-files/application/use-cases/reference/soft-delete-reference.use-case';
import { ReferenceRepository } from '@features/201-files/domain/repositories/reference.repository';
import { Reference } from '@features/201-files/domain/models/reference.model';
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

describe('SoftDeleteReferenceUseCase', () => {
  let useCase: SoftDeleteReferenceUseCase;
  let referenceRepository: jest.Mocked<ReferenceRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockReferenceId = 1;
  const mockReference = new Reference({
    id: mockReferenceId,
    employeeId: 1,
    fname: 'John',
    mname: 'Michael',
    lname: 'Doe',
    suffix: 'Jr.',
    cellphoneNumber: '+1234567890',
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
    const mockReferenceRepository = {
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
        SoftDeleteReferenceUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.REFERENCE,
          useValue: mockReferenceRepository,
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

    useCase = module.get<SoftDeleteReferenceUseCase>(
      SoftDeleteReferenceUseCase,
    );
    referenceRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.REFERENCE);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully soft delete a reference record and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.findById.mockResolvedValue(mockReference);
      referenceRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockReferenceId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_REFERENCE,
        expect.any(Function),
      );
      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.softDelete).toHaveBeenCalledWith(
        mockReferenceId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_REFERENCE,
          entity: CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId: mockUserId,
          details: JSON.stringify({
            referenceData: {
              id: mockReference.id,
              previousStatus: mockReference.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockReference.id} has been deactivated`,
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

    it('should successfully activate a reference record and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.findById.mockResolvedValue(mockReference);
      referenceRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockReferenceId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_REFERENCE,
        expect.any(Function),
      );
      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.softDelete).toHaveBeenCalledWith(
        mockReferenceId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_REFERENCE,
          entity: CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId: mockUserId,
          details: JSON.stringify({
            referenceData: {
              id: mockReference.id,
              previousStatus: mockReference.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockReference.id} has been activated`,
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

    it('should throw NotFoundException when reference record does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockReferenceId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_REFERENCE,
          entity: CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockReferenceId,
            isActive,
          }),
          description: `Failed to deactivate reference with ID: ${mockReferenceId}`,
          isSuccess: false,
          errorMessage: 'Reference not found',
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
      referenceRepository.findById.mockResolvedValue(mockReference);
      referenceRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockReferenceId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.softDelete).toHaveBeenCalledWith(
        mockReferenceId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Reference soft delete failed',
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
      referenceRepository.findById.mockResolvedValue(mockReference);
      referenceRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockReferenceId, isActive, mockUserId, mockRequestInfo),
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
      referenceRepository.findById.mockResolvedValue(mockReference);
      referenceRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockReferenceId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.softDelete).toHaveBeenCalledWith(
        mockReferenceId,
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
      referenceRepository.findById.mockResolvedValue(mockReference);
      referenceRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockReferenceId, isActive, mockUserId, mockRequestInfo),
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
