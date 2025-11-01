import { Test, TestingModule } from '@nestjs/testing';
import { CreateProvinceUseCase } from '@features/201-files/application/use-cases/province/create-province.use-case';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { Province } from '@features/201-files/domain/models/province.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateProvinceCommand } from '@features/201-files/application/commands/province/create-province.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('CreateProvinceUseCase', () => {
  let useCase: CreateProvinceUseCase;
  let provinceRepository: jest.Mocked<ProvinceRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockProvince = new Province({
    id: 1,
    desc1: 'Metro Manila',
    isActive: true,
  });

  const mockCreateCommand: CreateProvinceCommand = {
    desc1: 'Metro Manila',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockProvinceRepository = {
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
        CreateProvinceUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.PROVINCE,
          useValue: mockProvinceRepository,
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

    useCase = module.get<CreateProvinceUseCase>(CreateProvinceUseCase);
    provinceRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.PROVINCE);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create a province record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      provinceRepository.create.mockResolvedValue(mockProvince);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_PROVINCE,
        expect.any(Function),
      );
      expect(provinceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_PROVINCE,
          entity: CONSTANTS_DATABASE_MODELS.PROVINCE,
          userId: mockUserId,
          details: JSON.stringify({
            provinceData: {
              id: mockProvince.id,
              desc1: mockProvince.desc1,
              isActive: mockProvince.isActive,
            },
          }),
          description: `Created new province: ${mockProvince.desc1}`,
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
      expect(result).toEqual(mockProvince);
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
      provinceRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(provinceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          desc1: mockCreateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_PROVINCE,
          entity: CONSTANTS_DATABASE_MODELS.PROVINCE,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create province: ${mockCreateCommand.desc1}`,
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
      provinceRepository.create.mockResolvedValue(mockProvince);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(provinceRepository.create).toHaveBeenCalledWith(
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
      expect(result).toEqual(mockProvince);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      provinceRepository.create.mockRejectedValue('Unknown error');
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
  });
});
