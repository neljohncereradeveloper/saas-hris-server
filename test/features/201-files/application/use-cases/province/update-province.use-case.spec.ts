import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProvinceUseCase } from '@features/201-files/application/use-cases/province/update-province.use-case';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { Province } from '@features/201-files/domain/models/province.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateProvinceCommand } from '@features/201-files/application/commands/province/update-province.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateProvinceUseCase', () => {
  let useCase: UpdateProvinceUseCase;
  let provinceRepository: jest.Mocked<ProvinceRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockProvinceId = 1;
  const mockExistingProvince = new Province({
    id: mockProvinceId,
    desc1: 'Metro Manila',
    isActive: true,
  });

  const mockUpdatedProvince = new Province({
    id: mockProvinceId,
    desc1: 'National Capital Region',
    isActive: true,
  });

  const mockUpdateCommand: UpdateProvinceCommand = {
    desc1: 'National Capital Region',
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
        UpdateProvinceUseCase,
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

    useCase = module.get<UpdateProvinceUseCase>(UpdateProvinceUseCase);
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
    it('should successfully update a province record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      provinceRepository.findById
        .mockResolvedValueOnce(mockExistingProvince) // First call for validation
        .mockResolvedValueOnce(mockUpdatedProvince); // Second call after update
      provinceRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockProvinceId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_PROVINCE,
        expect.any(Function),
      );
      expect(provinceRepository.findById).toHaveBeenCalledWith(
        mockProvinceId,
        mockManager,
      );
      expect(provinceRepository.update).toHaveBeenCalledWith(
        mockProvinceId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_PROVINCE,
          entity: CONSTANTS_DATABASE_MODELS.PROVINCE,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingProvince.id,
              desc1: mockExistingProvince.desc1,
              isActive: mockExistingProvince.isActive,
            },
            newData: {
              id: mockUpdatedProvince.id,
              desc1: mockUpdatedProvince.desc1,
              isActive: mockUpdatedProvince.isActive,
            },
          }),
          description: `Updated province: ${mockUpdatedProvince.desc1}`,
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
      expect(result).toEqual(mockUpdatedProvince);
    });

    it('should throw NotFoundException when province record does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      provinceRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockProvinceId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(provinceRepository.findById).toHaveBeenCalledWith(
        mockProvinceId,
        mockManager,
      );
      expect(provinceRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_PROVINCE,
          entity: CONSTANTS_DATABASE_MODELS.PROVINCE,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockProvinceId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update province with ID: ${mockProvinceId}`,
          isSuccess: false,
          errorMessage: 'Province not found',
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
      provinceRepository.findById.mockResolvedValue(mockExistingProvince);
      provinceRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockProvinceId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(provinceRepository.findById).toHaveBeenCalledWith(
        mockProvinceId,
        mockManager,
      );
      expect(provinceRepository.update).toHaveBeenCalledWith(
        mockProvinceId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Province update failed',
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
      provinceRepository.findById.mockResolvedValue(mockExistingProvince);
      provinceRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockProvinceId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(provinceRepository.findById).toHaveBeenCalledWith(
        mockProvinceId,
        mockManager,
      );
      expect(provinceRepository.update).toHaveBeenCalledWith(
        mockProvinceId,
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
      provinceRepository.findById
        .mockResolvedValueOnce(mockExistingProvince)
        .mockResolvedValueOnce(mockUpdatedProvince);
      provinceRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockProvinceId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(provinceRepository.findById).toHaveBeenCalledWith(
        mockProvinceId,
        mockManager,
      );
      expect(provinceRepository.update).toHaveBeenCalledWith(
        mockProvinceId,
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
      expect(result).toEqual(mockUpdatedProvince);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      provinceRepository.findById.mockResolvedValue(mockExistingProvince);
      provinceRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockProvinceId,
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
