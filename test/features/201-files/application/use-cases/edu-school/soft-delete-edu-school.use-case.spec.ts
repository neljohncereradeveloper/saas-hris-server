import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/soft-delete-edu-school.use-case';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';
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

describe('SoftDeleteEduSchoolUseCase', () => {
  let useCase: SoftDeleteEduSchoolUseCase;
  let eduSchoolRepository: jest.Mocked<EduSchoolRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduSchoolId = 1;
  const mockEduSchool = new EduSchool({
    id: mockEduSchoolId,
    desc1: 'University of the Philippines',
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
        SoftDeleteEduSchoolUseCase,
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

    useCase = module.get<SoftDeleteEduSchoolUseCase>(
      SoftDeleteEduSchoolUseCase,
    );
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
    it('should successfully soft delete an edu school and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findById.mockResolvedValue(mockEduSchool);
      eduSchoolRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduSchoolId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUSCHOOL,
        expect.any(Function),
      );
      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.softDelete).toHaveBeenCalledWith(
        mockEduSchoolId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUSCHOOL,
          entity: CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId: mockUserId,
          details: JSON.stringify({
            eduschoolData: {
              id: mockEduSchool.id,
              desc1: mockEduSchool.desc1,
              previousStatus: mockEduSchool.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockEduSchool.desc1} has been ${isActive ? 'activated' : 'deactivated'}`,
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

    it('should successfully activate an edu school and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findById.mockResolvedValue(mockEduSchool);
      eduSchoolRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduSchoolId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUSCHOOL,
        expect.any(Function),
      );
      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.softDelete).toHaveBeenCalledWith(
        mockEduSchoolId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUSCHOOL,
          entity: CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId: mockUserId,
          details: JSON.stringify({
            eduschoolData: {
              id: mockEduSchool.id,
              desc1: mockEduSchool.desc1,
              previousStatus: mockEduSchool.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockEduSchool.desc1} has been ${isActive ? 'activated' : 'deactivated'}`,
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

    it('should throw NotFoundException when edu school does not exist', async () => {
      // Arrange
      const isActive = false;
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
        useCase.execute(mockEduSchoolId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUSCHOOL,
          entity: CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduSchoolId,
            isActive,
          }),
          description: `Failed to deactivate eduschool with ID: ${mockEduSchoolId}`,
          isSuccess: false,
          errorMessage: 'EduSchool not found',
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
      eduSchoolRepository.findById.mockResolvedValue(mockEduSchool);
      eduSchoolRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduSchoolId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.softDelete).toHaveBeenCalledWith(
        mockEduSchoolId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'EduSchool soft delete failed',
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
      eduSchoolRepository.findById.mockResolvedValue(mockEduSchool);
      eduSchoolRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduSchoolId, isActive, mockUserId, mockRequestInfo),
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
      eduSchoolRepository.findById.mockResolvedValue(mockEduSchool);
      eduSchoolRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduSchoolId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(eduSchoolRepository.findById).toHaveBeenCalledWith(
        mockEduSchoolId,
        mockManager,
      );
      expect(eduSchoolRepository.softDelete).toHaveBeenCalledWith(
        mockEduSchoolId,
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
      eduSchoolRepository.findById.mockResolvedValue(mockEduSchool);
      eduSchoolRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduSchoolId, isActive, mockUserId, mockRequestInfo),
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
