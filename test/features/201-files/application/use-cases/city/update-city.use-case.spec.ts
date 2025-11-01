import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCityUseCase } from '@features/201-files/application/use-cases/city/update-city.use-case';
import { CityRepository } from '@features/201-files/domain/repositories/city.repository';
import { City } from '@features/201-files/domain/models/city.model';
import { UpdateCityCommand } from '@features/201-files/application/commands/city/update-city.command';
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

describe('UpdateCityUseCase', () => {
  let useCase: UpdateCityUseCase;
  let cityRepository: jest.Mocked<CityRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCityId = 1;
  const mockExistingCity = new City({
    id: mockCityId,
    desc1: 'Manila',
    isActive: true,
  });

  const mockUpdatedCity = new City({
    id: mockCityId,
    desc1: 'Quezon City',
    isActive: true,
  });

  const mockUpdateCommand: UpdateCityCommand = {
    desc1: 'Quezon City',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockCityRepository = {
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
        UpdateCityUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CITY,
          useValue: mockCityRepository,
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

    useCase = module.get<UpdateCityUseCase>(UpdateCityUseCase);
    cityRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CITY);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update a city and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      cityRepository.findById
        .mockResolvedValueOnce(mockExistingCity) // First call for validation
        .mockResolvedValueOnce(mockUpdatedCity); // Second call after update
      cityRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCityId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_CITY,
        expect.any(Function),
      );
      expect(cityRepository.findById).toHaveBeenCalledWith(
        mockCityId,
        mockManager,
      );
      expect(cityRepository.update).toHaveBeenCalledWith(
        mockCityId,
        new City(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_CITY,
          entity: CONSTANTS_DATABASE_MODELS.CITY,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingCity.id,
              desc1: mockExistingCity.desc1,
              isActive: mockExistingCity.isActive,
            },
            newData: {
              id: mockUpdatedCity.id,
              desc1: mockUpdatedCity.desc1,
              isActive: mockUpdatedCity.isActive,
            },
          }),
          description: `Updated city: ${mockUpdatedCity.desc1}`,
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
      expect(result).toEqual(mockUpdatedCity);
    });

    it('should throw NotFoundException when city does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      cityRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCityId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(cityRepository.findById).toHaveBeenCalledWith(
        mockCityId,
        mockManager,
      );
      expect(cityRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_CITY,
          entity: CONSTANTS_DATABASE_MODELS.CITY,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockCityId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update city with ID: ${mockCityId}`,
          isSuccess: false,
          errorMessage: 'City not found',
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
      cityRepository.findById.mockResolvedValue(mockExistingCity);
      cityRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCityId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(cityRepository.findById).toHaveBeenCalledWith(
        mockCityId,
        mockManager,
      );
      expect(cityRepository.update).toHaveBeenCalledWith(
        mockCityId,
        new City(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'City update failed',
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
      cityRepository.findById.mockResolvedValue(mockExistingCity);
      cityRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCityId,
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
      cityRepository.findById
        .mockResolvedValueOnce(mockExistingCity)
        .mockResolvedValueOnce(mockUpdatedCity);
      cityRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCityId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(cityRepository.findById).toHaveBeenCalledWith(
        mockCityId,
        mockManager,
      );
      expect(cityRepository.update).toHaveBeenCalledWith(
        mockCityId,
        new City(mockUpdateCommand),
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
      expect(result).toEqual(mockUpdatedCity);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      cityRepository.findById.mockResolvedValue(mockExistingCity);
      cityRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockCityId,
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
