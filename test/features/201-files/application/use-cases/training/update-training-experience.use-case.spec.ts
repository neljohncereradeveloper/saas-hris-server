import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTrainingUseCase } from '@features/201-files/application/use-cases/training/update-training-experience.use-case';
import { TrainingRepository } from '@features/201-files/domain/repositories/training.repository';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { Training } from '@features/201-files/domain/models/training.model';
import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateTrainingCommand } from '@features/201-files/application/commands/training/update-training.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateTrainingUseCase', () => {
  let useCase: UpdateTrainingUseCase;
  let trainingRepository: jest.Mocked<TrainingRepository>;
  let trainingCertRepository: jest.Mocked<TrainingCertRepository>;
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

  const mockUpdatedTraining = new Training({
    id: mockTrainingId,
    employeeId: 1,
    trainingDate: new Date('2023-02-15'),
    trainingsCertId: 2,
    trainingTitle: 'AWS Solutions Architect',
    desc1: 'Advanced cloud architecture',
    isActive: true,
  });

  const mockTrainingCert = new TrainingCert({
    id: 2,
    desc1: 'AWS Solutions Architect Certification',
    isActive: true,
  });

  const mockUpdateCommand: UpdateTrainingCommand = {
    trainingDate: new Date('2023-02-15'),
    empTrainingsCertificate: 'AWS Solutions Architect Certification',
    trainingTitle: 'AWS Solutions Architect',
    employeeId: 1,
    desc1: 'Advanced cloud architecture',
  };

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
      update: jest.fn(),
    };

    const mockTrainingCertRepository = {
      findByDescription: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTrainingUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRAINING,
          useValue: mockTrainingRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
          useValue: mockTrainingCertRepository,
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

    useCase = module.get<UpdateTrainingUseCase>(UpdateTrainingUseCase);
    trainingRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.TRAINING);
    trainingCertRepository = module.get(
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
    it('should successfully update a training record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingRepository.findById
        .mockResolvedValueOnce(mockExistingTraining) // First call for validation
        .mockResolvedValueOnce(mockUpdatedTraining); // Second call after update
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_TRAINING,
        expect.any(Function),
      );
      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.update).toHaveBeenCalledWith(
        mockTrainingId,
        expect.objectContaining({
          trainingDate: mockUpdateCommand.trainingDate,
          trainingsCertId: mockTrainingCert.id,
          trainingTitle: mockUpdateCommand.trainingTitle,
          desc1: mockUpdateCommand.desc1,
          employeeId: mockUpdateCommand.employeeId,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_TRAINING,
          entity: CONSTANTS_DATABASE_MODELS.TRAINING,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingTraining.id,
              desc1: mockExistingTraining.desc1,
              employeeId: mockExistingTraining.employeeId,
              trainingsCertId: mockExistingTraining.trainingsCertId,
              trainingTitle: mockExistingTraining.trainingTitle,
              imagePath: mockExistingTraining.imagePath,
              isActive: mockExistingTraining.isActive,
            },
            newData: {
              id: mockUpdatedTraining.id,
              desc1: mockUpdatedTraining.desc1,
              employeeId: mockUpdatedTraining.employeeId,
              trainingsCertId: mockUpdatedTraining.trainingsCertId,
              trainingTitle: mockUpdatedTraining.trainingTitle,
              imagePath: mockUpdatedTraining.imagePath,
              isActive: mockUpdatedTraining.isActive,
            },
          }),
          description: `Updated training: ${mockUpdatedTraining.id}`,
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
      expect(result).toEqual(mockUpdatedTraining);
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
        useCase.execute(
          mockTrainingId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingCertRepository.findByDescription).not.toHaveBeenCalled();
      expect(trainingRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_TRAINING,
          entity: CONSTANTS_DATABASE_MODELS.TRAINING,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockTrainingId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update training with ID: ${mockTrainingId}`,
          isSuccess: false,
          errorMessage: 'Training not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should throw NotFoundException when training certificate does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingRepository.findById.mockResolvedValue(mockExistingTraining);
      trainingCertRepository.findByDescription.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_TRAINING,
          entity: CONSTANTS_DATABASE_MODELS.TRAINING,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockTrainingId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update training with ID: ${mockTrainingId}`,
          isSuccess: false,
          errorMessage: 'Training certificate not found',
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
      trainingRepository.findById.mockResolvedValue(mockExistingTraining);
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.update).toHaveBeenCalledWith(
        mockTrainingId,
        expect.objectContaining({
          trainingDate: mockUpdateCommand.trainingDate,
          trainingsCertId: mockTrainingCert.id,
          trainingTitle: mockUpdateCommand.trainingTitle,
          desc1: mockUpdateCommand.desc1,
          employeeId: mockUpdateCommand.employeeId,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Training update failed',
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
      trainingRepository.findById.mockResolvedValue(mockExistingTraining);
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.update).toHaveBeenCalledWith(
        mockTrainingId,
        expect.objectContaining({
          trainingDate: mockUpdateCommand.trainingDate,
          trainingsCertId: mockTrainingCert.id,
          trainingTitle: mockUpdateCommand.trainingTitle,
          desc1: mockUpdateCommand.desc1,
          employeeId: mockUpdateCommand.employeeId,
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
      trainingRepository.findById
        .mockResolvedValueOnce(mockExistingTraining)
        .mockResolvedValueOnce(mockUpdatedTraining);
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockTrainingId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(trainingRepository.findById).toHaveBeenCalledWith(
        mockTrainingId,
        mockManager,
      );
      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.update).toHaveBeenCalledWith(
        mockTrainingId,
        expect.objectContaining({
          trainingDate: mockUpdateCommand.trainingDate,
          trainingsCertId: mockTrainingCert.id,
          trainingTitle: mockUpdateCommand.trainingTitle,
          desc1: mockUpdateCommand.desc1,
          employeeId: mockUpdateCommand.employeeId,
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
      expect(result).toEqual(mockUpdatedTraining);
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
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockTrainingId,
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
  });
});
