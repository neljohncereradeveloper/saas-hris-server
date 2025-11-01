import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/update-trainingcert.use-case';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateTrainingCertificateCommand } from '@features/201-files/application/commands/training-certificate/update-training-certificate.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateTrainingcertUseCase', () => {
  let useCase: UpdateTrainingCertUseCase;
  let trainingcertRepository: jest.Mocked<TrainingCertRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockTrainingcertId = 1;
  const mockExistingTrainingcert = new TrainingCert({
    id: mockTrainingcertId,
    desc1: 'AWS Cloud Practitioner',
    isActive: true,
  });

  const mockUpdatedTrainingcert = new TrainingCert({
    id: mockTrainingcertId,
    desc1: 'AWS Solutions Architect',
    isActive: true,
  });

  const mockUpdateCommand: UpdateTrainingCertificateCommand = {
    desc1: 'AWS Solutions Architect',
  };

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
      update: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTrainingCertUseCase,
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

    useCase = module.get<UpdateTrainingCertUseCase>(UpdateTrainingCertUseCase);
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
    it('should successfully update a training certificate and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.findById
        .mockResolvedValueOnce(mockExistingTrainingcert) // First call for validation
        .mockResolvedValueOnce(mockUpdatedTrainingcert); // Second call after update
      trainingcertRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_TRAININGCERT,
        expect.any(Function),
      );
      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.update).toHaveBeenCalledWith(
        mockTrainingcertId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_TRAININGCERT,
          entity: CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingTrainingcert.id,
              desc1: mockExistingTrainingcert.desc1,
              isActive: mockExistingTrainingcert.isActive,
            },
            newData: {
              id: mockUpdatedTrainingcert.id,
              desc1: mockUpdatedTrainingcert.desc1,
              isActive: mockUpdatedTrainingcert.isActive,
            },
          }),
          description: `Updated training certificate: ${mockUpdatedTrainingcert.desc1}`,
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
      expect(result).toEqual(mockUpdatedTrainingcert);
    });

    it('should throw NotFoundException when training certificate does not exist', async () => {
      // Arrange
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
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_TRAININGCERT,
          entity: CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockTrainingcertId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update training certificate with ID: ${mockTrainingcertId}`,
          isSuccess: false,
          errorMessage: 'Trainingcert not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should throw SomethinWentWrongException when update fails', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingcertId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.update).toHaveBeenCalledWith(
        mockTrainingcertId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Trainingcert update failed',
        }),
        mockManager,
      );
    });

    it('should handle update failure and log error', async () => {
      // Arrange
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
      trainingcertRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingcertId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.update).toHaveBeenCalledWith(
        mockTrainingcertId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
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
      trainingcertRepository.findById
        .mockResolvedValueOnce(mockExistingTrainingcert)
        .mockResolvedValueOnce(mockUpdatedTrainingcert);
      trainingcertRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(trainingcertRepository.findById).toHaveBeenCalledWith(
        mockTrainingcertId,
        mockManager,
      );
      expect(trainingcertRepository.update).toHaveBeenCalledWith(
        mockTrainingcertId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
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
      expect(result).toEqual(mockUpdatedTrainingcert);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.findById.mockResolvedValue(
        mockExistingTrainingcert,
      );
      trainingcertRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingcertId,
          mockUpdateCommand,
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

    it('should handle empty description update', async () => {
      // Arrange
      const emptyUpdateCommand: UpdateTrainingCertificateCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.findById
        .mockResolvedValueOnce(mockExistingTrainingcert)
        .mockResolvedValueOnce(
          new TrainingCert({
            id: mockTrainingcertId,
            desc1: '',
            isActive: true,
          }),
        );
      trainingcertRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        emptyUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(trainingcertRepository.update).toHaveBeenCalledWith(
        mockTrainingcertId,
        expect.objectContaining({
          desc1: '',
        }),
        mockManager,
      );
      expect(result?.desc1).toBe('');
    });

    it('should handle long description update', async () => {
      // Arrange
      const longDescription = 'A'.repeat(1000);
      const longUpdateCommand: UpdateTrainingCertificateCommand = {
        desc1: longDescription,
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.findById
        .mockResolvedValueOnce(mockExistingTrainingcert)
        .mockResolvedValueOnce(
          new TrainingCert({
            id: mockTrainingcertId,
            desc1: longDescription,
            isActive: true,
          }),
        );
      trainingcertRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingcertId,
        longUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(trainingcertRepository.update).toHaveBeenCalledWith(
        mockTrainingcertId,
        expect.objectContaining({
          desc1: longDescription,
        }),
        mockManager,
      );
      expect(result?.desc1).toBe(longDescription);
    });
  });
});
