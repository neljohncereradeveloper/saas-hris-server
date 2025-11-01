import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCitizenshipUseCase } from '@features/201-files/application/use-cases/citizenship/update-citizenship.use-case';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
import { CitizenShip } from '@features/201-files/domain/models/citizenship.model';
import { UpdateCitizenShipCommand } from '@features/201-files/application/commands/citizenship/update-citizenship.command';
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

describe('UpdateCitizenshipUseCase', () => {
  let useCase: UpdateCitizenshipUseCase;
  let citizenshipRepository: jest.Mocked<CitizenShipRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCitizenshipId = 1;
  const mockExistingCitizenship = new CitizenShip({
    id: mockCitizenshipId,
    desc1: 'Filipino',
    isActive: true,
  });

  const mockUpdatedCitizenship = new CitizenShip({
    id: mockCitizenshipId,
    desc1: 'American',
    isActive: true,
  });

  const mockUpdateCommand: UpdateCitizenShipCommand = {
    desc1: 'American',
  };

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
        UpdateCitizenshipUseCase,
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

    useCase = module.get<UpdateCitizenshipUseCase>(UpdateCitizenshipUseCase);
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
    it('should successfully update a citizenship and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById
        .mockResolvedValueOnce(mockExistingCitizenship) // First call for validation
        .mockResolvedValueOnce(mockUpdatedCitizenship); // Second call after update
      citizenshipRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCitizenshipId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_CITIZENSHIP,
        expect.any(Function),
      );
      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.update).toHaveBeenCalledWith(
        mockCitizenshipId,
        new CitizenShip(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_CITIZENSHIP,
          entity: CONSTANTS_DATABASE_MODELS.CITIZENSHIP,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingCitizenship.id,
              desc1: mockExistingCitizenship.desc1,
              isActive: mockExistingCitizenship.isActive,
            },
            newData: {
              id: mockUpdatedCitizenship.id,
              desc1: mockUpdatedCitizenship.desc1,
              isActive: mockUpdatedCitizenship.isActive,
            },
          }),
          description: `Updated citizenship: ${mockUpdatedCitizenship.desc1}`,
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
      expect(result).toEqual(mockUpdatedCitizenship);
    });

    it('should throw NotFoundException when citizenship does not exist', async () => {
      // Arrange
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
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_CITIZENSHIP,
          entity: CONSTANTS_DATABASE_MODELS.CITIZENSHIP,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockCitizenshipId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update citizenship with ID: ${mockCitizenshipId}`,
          isSuccess: false,
          errorMessage: 'Citizenship not found',
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
      citizenshipRepository.findById.mockResolvedValue(mockExistingCitizenship);
      citizenshipRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCitizenshipId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.update).toHaveBeenCalledWith(
        mockCitizenshipId,
        new CitizenShip(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Citizenship update failed',
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
      citizenshipRepository.findById.mockResolvedValue(mockExistingCitizenship);
      citizenshipRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCitizenshipId,
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
      citizenshipRepository.findById
        .mockResolvedValueOnce(mockExistingCitizenship)
        .mockResolvedValueOnce(mockUpdatedCitizenship);
      citizenshipRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCitizenshipId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(citizenshipRepository.findById).toHaveBeenCalledWith(
        mockCitizenshipId,
        mockManager,
      );
      expect(citizenshipRepository.update).toHaveBeenCalledWith(
        mockCitizenshipId,
        new CitizenShip(mockUpdateCommand),
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
      expect(result).toEqual(mockUpdatedCitizenship);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      citizenshipRepository.findById.mockResolvedValue(mockExistingCitizenship);
      citizenshipRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCitizenshipId,
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
