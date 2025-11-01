import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteCitizenshipUseCase } from '@features/201-files/application/use-cases/citizenship/soft-delete-citizenship.use-case';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
import { CitizenShip } from '@features/201-files/domain/models/citizenship.model';
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

describe('SoftDeleteCitizenshipUseCase', () => {
  let useCase: SoftDeleteCitizenshipUseCase;
  let citizenshipRepository: jest.Mocked<CitizenShipRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCitizenshipId = 1;
  const mockCitizenship = new CitizenShip({
    id: mockCitizenshipId,
    desc1: 'Filipino',
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
    const mockCitizenshipRepository = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftDeleteCitizenshipUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP,
          useValue: mockCitizenshipRepository,
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

    useCase = module.get<SoftDeleteCitizenshipUseCase>(
      SoftDeleteCitizenshipUseCase,
    );
    citizenshipRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully deactivate a citizenship and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById.mockResolvedValue(mockCitizenship);
      citizenshipRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCitizenshipId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_CITIZENSHIP,
        expect.any(Function),
      );
      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.softDelete).toHaveBeenCalledWith(
        mockCitizenshipId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_CITIZENSHIP,
          entity: CONSTANTS_DATABASE_MODELS.CITIZENSHIP,
          userId: mockUserId,
          details: JSON.stringify({
            citizenshipData: {
              id: mockCitizenship.id,
              desc1: mockCitizenship.desc1,
              previousStatus: mockCitizenship.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockCitizenship.desc1} has been deactivated`,
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
      expect(result).toBe(true);
    });

    it('should successfully activate a citizenship and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById.mockResolvedValue(mockCitizenship);
      citizenshipRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCitizenshipId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.softDelete).toHaveBeenCalledWith(
        mockCitizenshipId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `${mockCitizenship.desc1} has been activated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when citizenship does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCitizenshipId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_CITIZENSHIP,
          entity: CONSTANTS_DATABASE_MODELS.CITIZENSHIP,
          userId: mockUserId,
          details: JSON.stringify({ id: mockCitizenshipId, isActive }),
          description: `Failed to deactivate citizenship with ID: ${mockCitizenshipId}`,
          isSuccess: false,
          errorMessage: 'Citizenship not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should throw SomethinWentWrongException when soft delete fails', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById.mockResolvedValue(mockCitizenship);
      citizenshipRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCitizenshipId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.softDelete).toHaveBeenCalledWith(
        mockCitizenshipId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Citizenship soft delete failed',
        }),
        mockManager,
      );
    });

    it('should handle soft delete failure and log error', async () => {
      // Arrange
      const isActive = false;
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById.mockResolvedValue(mockCitizenship);
      citizenshipRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCitizenshipId,
          isActive,
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
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById.mockResolvedValue(mockCitizenship);
      citizenshipRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCitizenshipId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.softDelete).toHaveBeenCalledWith(
        mockCitizenshipId,
        isActive,
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
      expect(result).toBe(true);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById.mockResolvedValue(mockCitizenship);
      citizenshipRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCitizenshipId,
          isActive,
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
