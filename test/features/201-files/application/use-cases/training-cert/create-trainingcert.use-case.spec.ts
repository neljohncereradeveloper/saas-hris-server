import { Test, TestingModule } from '@nestjs/testing';
import { CreateTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/create-trainingcert.use-case';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateTrainingCertificateCommand } from '@features/201-files/application/commands/training-certificate/create-training-certificate.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('CreateTrainingcertUseCase', () => {
  let useCase: CreateTrainingCertUseCase;
  let trainingcertRepository: jest.Mocked<TrainingCertRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCreateCommand: CreateTrainingCertificateCommand = {
    desc1: 'AWS Cloud Practitioner',
  };

  const mockCreatedTrainingcert = new TrainingCert({
    id: 1,
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
      create: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTrainingCertUseCase,
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

    useCase = module.get<CreateTrainingCertUseCase>(CreateTrainingCertUseCase);
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
    it('should successfully create a training certificate and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.create.mockResolvedValue(mockCreatedTrainingcert);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_TRAININGCERT,
        expect.any(Function),
      );
      expect(trainingcertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_TRAININGCERT,
          entity: CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId: mockUserId,
          details: JSON.stringify({
            trainingCertData: {
              id: mockCreatedTrainingcert.id,
              desc1: mockCreatedTrainingcert.desc1,
              isActive: mockCreatedTrainingcert.isActive,
            },
          }),
          description: `Created new training certificate: ${mockCreatedTrainingcert.desc1}`,
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
      expect(result).toEqual(mockCreatedTrainingcert);
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
      trainingcertRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(trainingcertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_TRAININGCERT,
          entity: CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create training certificate: ${mockCreateCommand.desc1}`,
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
      trainingcertRepository.create.mockResolvedValue(mockCreatedTrainingcert);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(trainingcertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
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
      expect(result).toEqual(mockCreatedTrainingcert);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.create.mockRejectedValue('Unknown error');
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

    it('should handle empty description', async () => {
      // Arrange
      const emptyCommand: CreateTrainingCertificateCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.create.mockResolvedValue(
        new TrainingCert({
          id: 1,
          desc1: '',
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(emptyCommand, mockUserId);

      // Assert
      expect(trainingcertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: '',
        }),
        mockManager,
      );
      expect(result.desc1).toBe('');
    });

    it('should handle long description', async () => {
      // Arrange
      const longDescription = 'A'.repeat(1000);
      const longCommand: CreateTrainingCertificateCommand = {
        desc1: longDescription,
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.create.mockResolvedValue(
        new TrainingCert({
          id: 1,
          desc1: longDescription,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(longCommand, mockUserId);

      // Assert
      expect(trainingcertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: longDescription,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(longDescription);
    });

    it('should handle special characters in description', async () => {
      // Arrange
      const specialCommand: CreateTrainingCertificateCommand = {
        desc1: 'AWS® Cloud Practitioner™ - Special Characters!@#$%^&*()',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      trainingcertRepository.create.mockResolvedValue(
        new TrainingCert({
          id: 1,
          desc1: specialCommand.desc1,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(specialCommand, mockUserId);

      // Assert
      expect(trainingcertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: specialCommand.desc1,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(specialCommand.desc1);
    });
  });
});
