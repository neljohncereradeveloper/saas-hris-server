import { Test, TestingModule } from '@nestjs/testing';
import { CreateTrainingUseCase } from '@features/201-files/application/use-cases/training/create-training.use-case';
import { TrainingRepository } from '@features/201-files/domain/repositories/training.repository';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { Training } from '@features/201-files/domain/models/training.model';
import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateTrainingCommand } from '@features/201-files/application/commands/training/create-training.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { NotFoundException } from '@features/shared/exceptions/shared';

describe('CreateTrainingUseCase', () => {
  let useCase: CreateTrainingUseCase;
  let trainingRepository: jest.Mocked<TrainingRepository>;
  let trainingCertRepository: jest.Mocked<TrainingCertRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockTrainingCert = new TrainingCert({
    id: 1,
    desc1: 'AWS Certification',
    isActive: true,
  });

  const mockTraining = new Training({
    id: 1,
    employeeId: 1,
    trainingDate: new Date('2023-01-15'),
    trainingsCertId: 1,
    trainingTitle: 'AWS Cloud Practitioner',
    desc1: 'Cloud computing fundamentals',
    isActive: true,
  });

  const mockCreateCommand: CreateTrainingCommand = {
    trainingDate: new Date('2023-01-15'),
    empTrainingsCertificate: 'AWS Certification',
    employeeId: 1,
    trainingTitle: 'AWS Cloud Practitioner',
    desc1: 'Cloud computing fundamentals',
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
      create: jest.fn(),
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
        CreateTrainingUseCase,
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

    useCase = module.get<CreateTrainingUseCase>(CreateTrainingUseCase);
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
    it('should successfully create a training record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.create.mockResolvedValue(mockTraining);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_TRAINING,
        expect.any(Function),
      );
      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trainingDate: mockCreateCommand.trainingDate,
          trainingsCertId: mockTrainingCert.id,
          trainingTitle: mockCreateCommand.trainingTitle,
          desc1: mockCreateCommand.desc1,
          employeeId: mockCreateCommand.employeeId,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_TRAINING,
          entity: CONSTANTS_DATABASE_MODELS.TRAINING,
          userId: mockUserId,
          details: JSON.stringify({
            trainingData: {
              id: mockTraining.id,
              employeeId: mockTraining.employeeId,
              trainingsCertId: mockTraining.trainingsCertId,
              trainingTitle: mockTraining.trainingTitle,
              desc1: mockTraining.desc1,
              imagePath: mockTraining.imagePath,
              isActive: mockTraining.isActive,
            },
          }),
          description: `Created new training For Employee: ${mockTraining.employeeId}`,
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
      expect(result).toEqual(mockTraining);
    });

    it('should throw NotFoundException when training certificate does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingCertRepository.findByDescription.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.create).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_TRAINING,
          entity: CONSTANTS_DATABASE_MODELS.TRAINING,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create training For Employee: ${mockCreateCommand.employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: false,
          errorMessage: 'Training certificate not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
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
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trainingDate: mockCreateCommand.trainingDate,
          trainingsCertId: mockTrainingCert.id,
          trainingTitle: mockCreateCommand.trainingTitle,
          desc1: mockCreateCommand.desc1,
          employeeId: mockCreateCommand.employeeId,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_TRAINING,
          entity: CONSTANTS_DATABASE_MODELS.TRAINING,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create training For Employee: ${mockCreateCommand.employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
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
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.create.mockResolvedValue(mockTraining);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trainingDate: mockCreateCommand.trainingDate,
          trainingsCertId: mockTrainingCert.id,
          trainingTitle: mockCreateCommand.trainingTitle,
          desc1: mockCreateCommand.desc1,
          employeeId: mockCreateCommand.employeeId,
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
      expect(result).toEqual(mockTraining);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.create.mockRejectedValue('Unknown error');
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

    it('should handle training creation with minimal data', async () => {
      // Arrange
      const minimalCommand: CreateTrainingCommand = {
        trainingDate: new Date('2023-01-15'),
        empTrainingsCertificate: 'AWS Certification',
        employeeId: 1,
      };
      const minimalTraining = new Training({
        id: 2,
        employeeId: 1,
        trainingDate: new Date('2023-01-15'),
        trainingsCertId: 1,
        isActive: true,
      });
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingCertRepository.findByDescription.mockResolvedValue(
        mockTrainingCert,
      );
      trainingRepository.create.mockResolvedValue(minimalTraining);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(minimalCommand, mockUserId);

      // Assert
      expect(trainingCertRepository.findByDescription).toHaveBeenCalledWith(
        minimalCommand.empTrainingsCertificate,
        mockManager,
      );
      expect(trainingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trainingDate: minimalCommand.trainingDate,
          trainingsCertId: mockTrainingCert.id,
          employeeId: minimalCommand.employeeId,
        }),
        mockManager,
      );
      expect(result).toEqual(minimalTraining);
    });
  });
});
