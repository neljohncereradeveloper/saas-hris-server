import { Test, TestingModule } from '@nestjs/testing';
import { UpdateReligionUseCase } from '@features/201-files/application/use-cases/religion/update-religion.use-case';
import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
import { Religion } from '@features/201-files/domain/models/religion.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateReligionCommand } from '@features/201-files/application/commands/religion/update-religion.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateReligionUseCase', () => {
  let useCase: UpdateReligionUseCase;
  let religionRepository: jest.Mocked<ReligionRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockReligionId = 1;
  const mockExistingReligion = new Religion({
    id: mockReligionId,
    desc1: 'Catholic',
    isActive: true,
  });

  const mockUpdatedReligion = new Religion({
    id: mockReligionId,
    desc1: 'Roman Catholic',
    isActive: true,
  });

  const mockUpdateCommand: UpdateReligionCommand = {
    desc1: 'Roman Catholic',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockReligionRepository = {
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
        UpdateReligionUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.RELIGION,
          useValue: mockReligionRepository,
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

    useCase = module.get<UpdateReligionUseCase>(UpdateReligionUseCase);
    religionRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.RELIGION);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update a religion record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      religionRepository.findById
        .mockResolvedValueOnce(mockExistingReligion) // First call for validation
        .mockResolvedValueOnce(mockUpdatedReligion); // Second call after update
      religionRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockReligionId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_RELIGION,
        expect.any(Function),
      );
      expect(religionRepository.findById).toHaveBeenCalledWith(
        mockReligionId,
        mockManager,
      );
      expect(religionRepository.update).toHaveBeenCalledWith(
        mockReligionId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_RELIGION,
          entity: CONSTANTS_DATABASE_MODELS.RELIGION,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingReligion.id,
              desc1: mockExistingReligion.desc1,
              isActive: mockExistingReligion.isActive,
            },
            newData: {
              id: mockUpdatedReligion.id,
              desc1: mockUpdatedReligion.desc1,
              isActive: mockUpdatedReligion.isActive,
            },
          }),
          description: `Updated religion: ${mockUpdatedReligion.desc1}`,
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
      expect(result).toEqual(mockUpdatedReligion);
    });

    it('should throw NotFoundException when religion record does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      religionRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockReligionId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(religionRepository.findById).toHaveBeenCalledWith(
        mockReligionId,
        mockManager,
      );
      expect(religionRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_RELIGION,
          entity: CONSTANTS_DATABASE_MODELS.RELIGION,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockReligionId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update religion with ID: ${mockReligionId}`,
          isSuccess: false,
          errorMessage: 'Religion not found',
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
      religionRepository.findById.mockResolvedValue(mockExistingReligion);
      religionRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockReligionId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(religionRepository.findById).toHaveBeenCalledWith(
        mockReligionId,
        mockManager,
      );
      expect(religionRepository.update).toHaveBeenCalledWith(
        mockReligionId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Religion update failed',
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
      religionRepository.findById.mockResolvedValue(mockExistingReligion);
      religionRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockReligionId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(religionRepository.findById).toHaveBeenCalledWith(
        mockReligionId,
        mockManager,
      );
      expect(religionRepository.update).toHaveBeenCalledWith(
        mockReligionId,
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
      religionRepository.findById
        .mockResolvedValueOnce(mockExistingReligion)
        .mockResolvedValueOnce(mockUpdatedReligion);
      religionRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockReligionId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(religionRepository.findById).toHaveBeenCalledWith(
        mockReligionId,
        mockManager,
      );
      expect(religionRepository.update).toHaveBeenCalledWith(
        mockReligionId,
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
      expect(result).toEqual(mockUpdatedReligion);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      religionRepository.findById.mockResolvedValue(mockExistingReligion);
      religionRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockReligionId,
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
