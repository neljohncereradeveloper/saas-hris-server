import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteTrainingUseCase } from '@features/201-files/application/use-cases/training/soft-delete-training.use-case';
import { TrainingRepository } from '@features/201-files/domain/repositories/training.repository';
import { Training } from '@features/201-files/domain/models/training.model';
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

describe('SoftDeleteTrainingUseCase', () => {
  let useCase: SoftDeleteTrainingUseCase;
  let trainingRepository: jest.Mocked<TrainingRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockTrainingId = 1;
  const mockExistingTraining = new Training({
    id: mockTrainingId,
    employeeId: 1,
    trainingDate: new Date('2023-01-15'),
    trainingsCertId: 1,
    trainingTitle: 'AWS Cloud Practitioner',
    desc1: 'Cloud computing fundamentals',
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
    const mockTrainingRepository = {
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
        SoftDeleteTrainingUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRAINING,
          useValue: mockTrainingRepository,
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

    useCase = module.get<SoftDeleteTrainingUseCase>(SoftDeleteTrainingUseCase);
    trainingRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.TRAINING);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully soft delete a training record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingRepository.findById.mockResolvedValue(mockExistingTraining);
      trainingRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingId,
        false,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_TRAINING,
        expect.any(Function),
      );
      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingId,
        false,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_TRAINING,
          entity: CONSTANTS_DATABASE_MODELS.TRAINING,
          userId: mockUserId,
          details: JSON.stringify({
            trainingData: {
              id: mockTrainingId,
              previousStatus: mockExistingTraining.isActive,
              newStatus: false,
            },
          }),
          description: `${mockTrainingId} has been deactivated`,
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

    it('should throw NotFoundException when training record does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockTrainingId, false, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_TRAINING,
          entity: CONSTANTS_DATABASE_MODELS.TRAINING,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockTrainingId,
            isActive: false,
          }),
          description: `Failed to deactivate training with ID: ${mockTrainingId}`,
          isSuccess: false,
          errorMessage: 'Training not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should throw SomethinWentWrongException when soft delete fails', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingRepository.findById.mockResolvedValue(mockExistingTraining);
      trainingRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockTrainingId, false, mockUserId, mockRequestInfo),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingId,
        false,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Training soft delete failed',
        }),
        mockManager,
      );
    });

    it('should handle soft delete failure and log error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingRepository.findById.mockResolvedValue(mockExistingTraining);
      trainingRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockTrainingId, false, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingId,
        false,
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
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingRepository.findById.mockResolvedValue(mockExistingTraining);
      trainingRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockTrainingId, false, mockUserId);

      // Assert
      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingId,
        false,
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
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingRepository.findById.mockResolvedValue(mockExistingTraining);
      trainingRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockTrainingId, false, mockUserId, mockRequestInfo),
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
