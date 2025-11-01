import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/update-edu-school.use-case';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';
import { UpdateEduSchoolCommand } from '@features/201-files/application/commands/edu-school/update-edu-school.command';
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

describe('UpdateEduSchoolUseCase', () => {
  let useCase: UpdateEduSchoolUseCase;
  let eduSchoolRepository: jest.Mocked<EduSchoolRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduSchoolId = 1;
  const mockExistingEduSchool = new EduSchool({
    id: mockEduSchoolId,
    desc1: 'University of the Philippines',
    isActive: true,
  });

  const mockUpdateCommand: UpdateEduSchoolCommand = {
    desc1: 'UP Diliman',
  };

  const mockUpdatedEduSchool = new EduSchool({
    id: mockEduSchoolId,
    desc1: 'UP Diliman',
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
    const mockEduSchoolRepository = {
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
        UpdateEduSchoolUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL,
          useValue: mockEduSchoolRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateEduSchoolUseCase>(UpdateEduSchoolUseCase);
    eduSchoolRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update an edu school and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findById
        .mockResolvedValueOnce(mockExistingEduSchool)
        .mockResolvedValueOnce(mockUpdatedEduSchool);
      eduSchoolRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduSchoolId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_EDUSCHOOL,
        expect.any(Function),
      );
      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.update).toHaveBeenCalledWith(
        mockEduSchoolId,
        expect.any(EduSchool),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDUSCHOOL,
          entity: CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingEduSchool.id,
              desc1: mockExistingEduSchool.desc1,
              isActive: mockExistingEduSchool.isActive,
            },
            newData: {
              id: mockUpdatedEduSchool.id,
              desc1: mockUpdatedEduSchool.desc1,
              isActive: mockUpdatedEduSchool.isActive,
            },
          }),
          description: `Updated eduschool: ${mockUpdatedEduSchool.desc1}`,
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
      expect(result).toBe(mockUpdatedEduSchool);
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findById
        .mockResolvedValueOnce(mockExistingEduSchool)
        .mockResolvedValueOnce(mockUpdatedEduSchool);
      eduSchoolRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduSchoolId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.update).toHaveBeenCalledWith(
        mockEduSchoolId,
        expect.any(EduSchool),
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
      expect(result).toBe(mockUpdatedEduSchool);
    });

    it('should throw NotFoundException when edu school does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduSchoolId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDUSCHOOL,
          entity: CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduSchoolId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update eduschool with ID: ${mockEduSchoolId}`,
          isSuccess: false,
          errorMessage: 'EduSchool not found',
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
      eduSchoolRepository.findById.mockResolvedValue(mockExistingEduSchool);
      eduSchoolRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduSchoolId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.update).toHaveBeenCalledWith(
        mockEduSchoolId,
        expect.any(EduSchool),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'EduSchool update failed',
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
      eduSchoolRepository.findById.mockResolvedValue(mockExistingEduSchool);
      eduSchoolRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduSchoolId,
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
      eduSchoolRepository.findById.mockResolvedValue(mockExistingEduSchool);
      eduSchoolRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduSchoolId,
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
      const emptyDescCommand: UpdateEduSchoolCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findById
        .mockResolvedValueOnce(mockExistingEduSchool)
        .mockResolvedValueOnce(mockUpdatedEduSchool);
      eduSchoolRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduSchoolId,
        emptyDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduSchoolRepository.update).toHaveBeenCalledWith(
        mockEduSchoolId,
        expect.any(EduSchool),
        mockManager,
      );
      expect(result).toBe(mockUpdatedEduSchool);
    });

    it('should handle special characters in desc1 update', async () => {
      // Arrange
      const specialCharCommand: UpdateEduSchoolCommand = {
        desc1: "St. Mary's College & University",
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findById
        .mockResolvedValueOnce(mockExistingEduSchool)
        .mockResolvedValueOnce(mockUpdatedEduSchool);
      eduSchoolRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduSchoolId,
        specialCharCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduSchoolRepository.update).toHaveBeenCalledWith(
        mockEduSchoolId,
        expect.any(EduSchool),
        mockManager,
      );
      expect(result).toBe(mockUpdatedEduSchool);
    });
  });
});
