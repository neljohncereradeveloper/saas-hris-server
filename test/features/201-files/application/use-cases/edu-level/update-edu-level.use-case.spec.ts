import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEduLevelUseCase } from '@features/201-files/application/use-cases/edu-level/update-edu-level.use-case';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { EduLevel } from '@features/201-files/domain/models/edu-level.model';
import { UpdateEduLevelCommand } from '@features/201-files/application/commands/edu-level/update-edu-level.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateEduLevelUseCase', () => {
  let useCase: UpdateEduLevelUseCase;
  let eduLevelRepository: jest.Mocked<EduLevelRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduLevelId = 1;
  const mockExistingEduLevel = new EduLevel({
    id: mockEduLevelId,
    desc1: 'Elementary',
    isActive: true,
  });

  const mockUpdateCommand: UpdateEduLevelCommand = {
    desc1: 'Primary',
  };

  const mockUpdatedEduLevel = new EduLevel({
    id: mockEduLevelId,
    desc1: 'Primary',
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
    const mockEduLevelRepository = {
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
        UpdateEduLevelUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDULEVEL,
          useValue: mockEduLevelRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateEduLevelUseCase>(UpdateEduLevelUseCase);
    eduLevelRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update an edu level and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.findById
        .mockResolvedValueOnce(mockExistingEduLevel)
        .mockResolvedValueOnce(mockUpdatedEduLevel);
      eduLevelRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduLevelId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_EDULEVEL,
        expect.any(Function),
      );
      expect(eduLevelRepository.findById).toHaveBeenCalledWith(
        mockEduLevelId,
        mockManager,
      );
      expect(eduLevelRepository.update).toHaveBeenCalledWith(
        mockEduLevelId,
        expect.any(EduLevel),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDULEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDULEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingEduLevel.id,
              desc1: mockExistingEduLevel.desc1,
              isActive: mockExistingEduLevel.isActive,
            },
            newData: {
              id: mockUpdatedEduLevel.id,
              desc1: mockUpdatedEduLevel.desc1,
              isActive: mockUpdatedEduLevel.isActive,
            },
          }),
          description: `Updated edulevel: ${mockUpdatedEduLevel.desc1}`,
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
      expect(result).toBe(mockUpdatedEduLevel);
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.findById
        .mockResolvedValueOnce(mockExistingEduLevel)
        .mockResolvedValueOnce(mockUpdatedEduLevel);
      eduLevelRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduLevelId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(eduLevelRepository.findById).toHaveBeenCalledWith(
        mockEduLevelId,
        mockManager,
      );
      expect(eduLevelRepository.update).toHaveBeenCalledWith(
        mockEduLevelId,
        expect.any(EduLevel),
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
      expect(result).toBe(mockUpdatedEduLevel);
    });

    it('should throw NotFoundException when edu level does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduLevelId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(eduLevelRepository.findById).toHaveBeenCalledWith(
        mockEduLevelId,
        mockManager,
      );
      expect(eduLevelRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDULEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDULEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduLevelId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update edulevel with ID: ${mockEduLevelId}`,
          isSuccess: false,
          errorMessage: 'EduLevel not found',
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
      eduLevelRepository.findById.mockResolvedValue(mockExistingEduLevel);
      eduLevelRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduLevelId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(eduLevelRepository.findById).toHaveBeenCalledWith(
        mockEduLevelId,
        mockManager,
      );
      expect(eduLevelRepository.update).toHaveBeenCalledWith(
        mockEduLevelId,
        expect.any(EduLevel),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'EduLevel update failed',
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
      eduLevelRepository.findById.mockResolvedValue(mockExistingEduLevel);
      eduLevelRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduLevelId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Database connection failed',
        }),
        mockManager,
      );
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.findById.mockResolvedValue(mockExistingEduLevel);
      eduLevelRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduLevelId,
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

    it('should handle empty desc1 update', async () => {
      // Arrange
      const emptyDescCommand: UpdateEduLevelCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.findById
        .mockResolvedValueOnce(mockExistingEduLevel)
        .mockResolvedValueOnce(mockUpdatedEduLevel);
      eduLevelRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduLevelId,
        emptyDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduLevelRepository.update).toHaveBeenCalledWith(
        mockEduLevelId,
        expect.any(EduLevel),
        mockManager,
      );
      expect(result).toBe(mockUpdatedEduLevel);
    });

    it('should handle special characters in desc1 update', async () => {
      // Arrange
      const specialCharCommand: UpdateEduLevelCommand = {
        desc1: 'Pre-School & Kindergarten',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduLevelRepository.findById
        .mockResolvedValueOnce(mockExistingEduLevel)
        .mockResolvedValueOnce(mockUpdatedEduLevel);
      eduLevelRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduLevelId,
        specialCharCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduLevelRepository.update).toHaveBeenCalledWith(
        mockEduLevelId,
        expect.any(EduLevel),
        mockManager,
      );
      expect(result).toBe(mockUpdatedEduLevel);
    });
  });
});
