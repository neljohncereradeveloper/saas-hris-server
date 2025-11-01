import { Test, TestingModule } from '@nestjs/testing';
import { CreateWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/create-workexp-company.use-case';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { WorkExpCompany } from '@features/201-files/domain/models/workexp-company.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateWorkExpCompanyCommand } from '@features/201-files/application/commands/workexp-company/create-workexp-company.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('CreateWorkexpCompanyUseCase', () => {
  let useCase: CreateWorkExpCompanyUseCase;
  let workexpCompanyRepository: jest.Mocked<WorkexpCompanyRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCreateCommand: CreateWorkExpCompanyCommand = {
    desc1: 'Tech Corp',
  };

  const mockCreatedWorkexpCompany = new WorkExpCompany({
    id: 1,
    desc1: 'Tech Corp',
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
    const mockWorkexpCompanyRepository = {
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
        CreateWorkExpCompanyUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
          useValue: mockWorkexpCompanyRepository,
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

    useCase = module.get<CreateWorkExpCompanyUseCase>(
      CreateWorkExpCompanyUseCase,
    );
    workexpCompanyRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
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
    it('should successfully create a work experience company and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.create.mockResolvedValue(
        mockCreatedWorkexpCompany,
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_WORKEXPCOMPANY,
        expect.any(Function),
      );
      expect(workexpCompanyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_WORKEXPCOMPANY,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPCOMPANY,
          userId: mockUserId,
          details: JSON.stringify({
            workexpcompanyData: {
              id: mockCreatedWorkexpCompany.id,
              desc1: mockCreatedWorkexpCompany.desc1,
              isActive: mockCreatedWorkexpCompany.isActive,
            },
          }),
          description: `Created new workexpcompany: ${mockCreatedWorkexpCompany.desc1}`,
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
      expect(result).toEqual(mockCreatedWorkexpCompany);
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
      workexpCompanyRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(workexpCompanyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_WORKEXPCOMPANY,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPCOMPANY,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create workexpcompany: ${mockCreateCommand.desc1}`,
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
      workexpCompanyRepository.create.mockResolvedValue(
        mockCreatedWorkexpCompany,
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(workexpCompanyRepository.create).toHaveBeenCalledWith(
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
      expect(result).toEqual(mockCreatedWorkexpCompany);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.create.mockRejectedValue('Unknown error');
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

    it('should handle empty company name', async () => {
      // Arrange
      const emptyCommand: CreateWorkExpCompanyCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.create.mockResolvedValue(
        new WorkExpCompany({
          id: 1,
          desc1: '',
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(emptyCommand, mockUserId);

      // Assert
      expect(workexpCompanyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: '',
        }),
        mockManager,
      );
      expect(result.desc1).toBe('');
    });

    it('should handle long company name', async () => {
      // Arrange
      const longCompanyName = 'A'.repeat(1000);
      const longCommand: CreateWorkExpCompanyCommand = {
        desc1: longCompanyName,
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.create.mockResolvedValue(
        new WorkExpCompany({
          id: 1,
          desc1: longCompanyName,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(longCommand, mockUserId);

      // Assert
      expect(workexpCompanyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: longCompanyName,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(longCompanyName);
    });

    it('should handle special characters in company name', async () => {
      // Arrange
      const specialCommand: CreateWorkExpCompanyCommand = {
        desc1: 'Tech Corp® - Special Characters!@#$%^&*()',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.create.mockResolvedValue(
        new WorkExpCompany({
          id: 1,
          desc1: specialCommand.desc1,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(specialCommand, mockUserId);

      // Assert
      expect(workexpCompanyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: specialCommand.desc1,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(specialCommand.desc1);
    });

    it('should handle company name with numbers', async () => {
      // Arrange
      const numberCommand: CreateWorkExpCompanyCommand = {
        desc1: 'Tech Corp 2023',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.create.mockResolvedValue(
        new WorkExpCompany({
          id: 1,
          desc1: numberCommand.desc1,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(numberCommand, mockUserId);

      // Assert
      expect(workexpCompanyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: numberCommand.desc1,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(numberCommand.desc1);
    });

    it('should handle company name with spaces', async () => {
      // Arrange
      const spacedCommand: CreateWorkExpCompanyCommand = {
        desc1: '  Tech Corp  ',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.create.mockResolvedValue(
        new WorkExpCompany({
          id: 1,
          desc1: spacedCommand.desc1,
          isActive: true,
        }),
      );
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(spacedCommand, mockUserId);

      // Assert
      expect(workexpCompanyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: spacedCommand.desc1,
        }),
        mockManager,
      );
      expect(result.desc1).toBe(spacedCommand.desc1);
    });
  });
});
