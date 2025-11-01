import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCivilStatusUseCase } from '@features/201-files/application/use-cases/civilstatus/update-civil-status.use-case';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { CivilStatus } from '@features/201-files/domain/models/civilstatus.model';
import { UpdateCivilStatusCommand } from '@features/201-files/application/commands/civilstatus/update-civilstatus.command';
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

describe('UpdateCivilStatusUseCase', () => {
  let useCase: UpdateCivilStatusUseCase;
  let civilStatusRepository: jest.Mocked<CivilStatusRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCivilStatusId = 1;
  const mockExistingCivilStatus = new CivilStatus({
    id: mockCivilStatusId,
    desc1: 'Single',
    isActive: true,
  });

  const mockUpdatedCivilStatus = new CivilStatus({
    id: mockCivilStatusId,
    desc1: 'Married',
    isActive: true,
  });

  const mockUpdateCommand: UpdateCivilStatusCommand = {
    desc1: 'Married',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockCivilStatusRepository = {
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
        UpdateCivilStatusUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS,
          useValue: mockCivilStatusRepository,
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

    useCase = module.get<UpdateCivilStatusUseCase>(UpdateCivilStatusUseCase);
    civilStatusRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update a civil status and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      civilStatusRepository.findById
        .mockResolvedValueOnce(mockExistingCivilStatus) // First call for validation
        .mockResolvedValueOnce(mockUpdatedCivilStatus); // Second call after update
      civilStatusRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCivilStatusId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_CIVILSTATUS,
        expect.any(Function),
      );
      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.update).toHaveBeenCalledWith(
        mockCivilStatusId,
        new CivilStatus(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_CIVILSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.CIVILSTATUS,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingCivilStatus.id,
              desc1: mockExistingCivilStatus.desc1,
              isActive: mockExistingCivilStatus.isActive,
            },
            newData: {
              id: mockUpdatedCivilStatus.id,
              desc1: mockUpdatedCivilStatus.desc1,
              isActive: mockUpdatedCivilStatus.isActive,
            },
          }),
          description: `Updated civil status: ${mockUpdatedCivilStatus.desc1}`,
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
      expect(result).toEqual(mockUpdatedCivilStatus);
    });

    it('should throw NotFoundException when civil status does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      civilStatusRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCivilStatusId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_CIVILSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.CIVILSTATUS,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockCivilStatusId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update civil status with ID: ${mockCivilStatusId}`,
          isSuccess: false,
          errorMessage: 'CivilStatus not found',
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
      civilStatusRepository.findById.mockResolvedValue(mockExistingCivilStatus);
      civilStatusRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCivilStatusId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.update).toHaveBeenCalledWith(
        mockCivilStatusId,
        new CivilStatus(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'CivilStatus update failed',
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
      civilStatusRepository.findById.mockResolvedValue(mockExistingCivilStatus);
      civilStatusRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCivilStatusId,
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

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      civilStatusRepository.findById
        .mockResolvedValueOnce(mockExistingCivilStatus)
        .mockResolvedValueOnce(mockUpdatedCivilStatus);
      civilStatusRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCivilStatusId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(civilStatusRepository.findById).toHaveBeenCalledWith(
        mockCivilStatusId,
        mockManager,
      );
      expect(civilStatusRepository.update).toHaveBeenCalledWith(
        mockCivilStatusId,
        new CivilStatus(mockUpdateCommand),
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
      expect(result).toEqual(mockUpdatedCivilStatus);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      civilStatusRepository.findById.mockResolvedValue(mockExistingCivilStatus);
      civilStatusRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCivilStatusId,
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
