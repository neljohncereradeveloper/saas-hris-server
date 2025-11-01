import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBarangayUseCase } from '@features/201-files/application/use-cases/barangay/update-barangay.use-case';
import { BarangayRepository } from '@features/201-files/domain/repositories/barangay.repository';
import { Barangay } from '@features/201-files/domain/models/barangay.model';
import { UpdateBarangayCommand } from '@features/201-files/application/commands/barangay/update-barangay.command';
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

describe('UpdateAddressBarangayUseCase', () => {
  let useCase: UpdateBarangayUseCase;
  let barangayRepository: jest.Mocked<BarangayRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockBarangayId = 1;
  const mockExistingBarangay = new Barangay({
    id: mockBarangayId,
    desc1: 'Old Barangay Name',
    isActive: true,
  });

  const mockUpdatedBarangay = new Barangay({
    id: mockBarangayId,
    desc1: 'Updated Barangay Name',
    isActive: true,
  });

  const mockUpdateCommand: UpdateBarangayCommand = {
    desc1: 'Updated Barangay Name',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockBarangayRepository = {
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
        UpdateBarangayUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.BARANGAY,
          useValue: mockBarangayRepository,
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

    useCase = module.get<UpdateBarangayUseCase>(UpdateBarangayUseCase);
    barangayRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.BARANGAY);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update a barangay and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      barangayRepository.findById
        .mockResolvedValueOnce(mockExistingBarangay) // First call for validation
        .mockResolvedValueOnce(mockUpdatedBarangay); // Second call after update
      barangayRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockBarangayId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_BARANGAY,
        expect.any(Function),
      );
      expect(barangayRepository.findById).toHaveBeenCalledWith(
        mockBarangayId,
        mockManager,
      );
      expect(barangayRepository.update).toHaveBeenCalledWith(
        mockBarangayId,
        new Barangay(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_BARANGAY,
          entity: CONSTANTS_DATABASE_MODELS.BARANGAY,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingBarangay.id,
              desc1: mockExistingBarangay.desc1,
              isActive: mockExistingBarangay.isActive,
            },
            newData: {
              id: mockUpdatedBarangay.id,
              desc1: mockUpdatedBarangay.desc1,
              isActive: mockUpdatedBarangay.isActive,
            },
          }),
          description: `Updated barangay: ${mockUpdatedBarangay.desc1}`,
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
      expect(result).toEqual(mockUpdatedBarangay);
    });

    it('should throw NotFoundException when barangay does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      barangayRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockBarangayId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(barangayRepository.findById).toHaveBeenCalledWith(
        mockBarangayId,
        mockManager,
      );
      expect(barangayRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_BARANGAY,
          entity: CONSTANTS_DATABASE_MODELS.BARANGAY,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockBarangayId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update barangay with ID: ${mockBarangayId}`,
          isSuccess: false,
          errorMessage: 'Barangay not found',
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
      barangayRepository.findById.mockResolvedValue(mockExistingBarangay);
      barangayRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockBarangayId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(barangayRepository.findById).toHaveBeenCalledWith(
        mockBarangayId,
        mockManager,
      );
      expect(barangayRepository.update).toHaveBeenCalledWith(
        mockBarangayId,
        new Barangay(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Barangay update failed',
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
      barangayRepository.findById.mockResolvedValue(mockExistingBarangay);
      barangayRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockBarangayId,
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
      barangayRepository.findById
        .mockResolvedValueOnce(mockExistingBarangay)
        .mockResolvedValueOnce(mockUpdatedBarangay);
      barangayRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockBarangayId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(barangayRepository.findById).toHaveBeenCalledWith(
        mockBarangayId,
        mockManager,
      );
      expect(barangayRepository.update).toHaveBeenCalledWith(
        mockBarangayId,
        new Barangay(mockUpdateCommand),
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
      expect(result).toEqual(mockUpdatedBarangay);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      barangayRepository.findById.mockResolvedValue(mockExistingBarangay);
      barangayRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockBarangayId,
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
