import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/soft-delete-trainingcert.use-case';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';
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

describe('SoftDeleteTrainingcertUseCase', () => {
  let useCase: SoftDeleteTrainingCertUseCase;
  let trainingcertRepository: jest.Mocked<TrainingCertRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockTrainingcertId = 1;
  const mockExistingTrainingcert = new TrainingCert({
    id: mockTrainingcertId,
    desc1: 'AWS Cloud Practitioner',
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
    const mockTrainingcertRepository = {
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
        SoftDeleteTrainingCertUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
          useValue: mockTrainingcertRepository,
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

    useCase = module.get<SoftDeleteTrainingCertUseCase>(
      SoftDeleteTrainingCertUseCase,
    );
    trainingcertRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
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
    it('should successfully deactivate a training certificate and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_TRAININGCERT,
        expect.any(Function),
      );
      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingcertId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_TRAININGCERT,
          entity: CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId: mockUserId,
          details: JSON.stringify({
            trainingCertData: {
              id: mockExistingTrainingcert.id,
              desc1: mockExistingTrainingcert.desc1,
              previousStatus: mockExistingTrainingcert.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockExistingTrainingcert.desc1} has been deactivated`,
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

    it('should successfully activate a training certificate and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(trainingcertRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingcertId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `${mockExistingTrainingcert.desc1} has been activated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when training certificate does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingcertId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_TRAININGCERT,
          entity: CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId: mockUserId,
          details: JSON.stringify({ id: mockTrainingcertId, isActive }),
          description: `Failed to deactivate training certificate with ID: ${mockTrainingcertId}`,
          isSuccess: false,
          errorMessage: 'Trainingcert not found',
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
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingcertId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingcertId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Trainingcert soft delete failed',
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
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingcertId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingcertId,
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
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.softDelete).toHaveBeenCalledWith(
        mockTrainingcertId,
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
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingcertId,
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
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `AWS Cloud Practitioner has been activated`,
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
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `AWS Cloud Practitioner has been deactivated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });
  });
});
