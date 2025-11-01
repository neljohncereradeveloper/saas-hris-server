import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteEduUseCase } from '@features/201-files/application/use-cases/edu/soft-delete-edu.use-case';
import { EduRepository } from '@features/201-files/domain/repositories/edu';
import { Edu } from '@features/201-files/domain/models/edu';
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

describe('SoftDeleteEduUseCase', () => {
  let useCase: SoftDeleteEduUseCase;
  let eduRepository: jest.Mocked<EduRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduId = 1;
  const mockEdu = new Edu({
    id: mockEduId,
    employeeId: 1,
    eduSchoolId: 1,
    eduLevelId: 1,
    eduCourseId: 1,
    eduCourseLevelId: 1,
    schoolYear: '2020-2021',
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
    const mockEduRepository = {
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
        SoftDeleteEduUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDU,
          useValue: mockEduRepository,
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

    useCase = module.get<SoftDeleteEduUseCase>(SoftDeleteEduUseCase);
    eduRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDU);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully soft delete an edu record and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduRepository.findById.mockResolvedValue(mockEdu);
      eduRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EDU,
        expect.any(Function),
      );
      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduRepository.softDelete).toHaveBeenCalledWith(
        mockEduId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDU,
          entity: CONSTANTS_DATABASE_MODELS.EDU,
          userId: mockUserId,
          details: JSON.stringify({
            eduData: {
              id: mockEdu.id,
              previousStatus: mockEdu.isActive,
              newStatus: isActive,
            },
          }),
          description: `Edu with ID: ${mockEdu.id} has been deactivated`,
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

    it('should successfully activate an edu record and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduRepository.findById.mockResolvedValue(mockEdu);
      eduRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EDU,
        expect.any(Function),
      );
      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduRepository.softDelete).toHaveBeenCalledWith(
        mockEduId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDU,
          entity: CONSTANTS_DATABASE_MODELS.EDU,
          userId: mockUserId,
          details: JSON.stringify({
            eduData: {
              id: mockEdu.id,
              previousStatus: mockEdu.isActive,
              newStatus: isActive,
            },
          }),
          description: `Edu with ID: ${mockEdu.id} has been activated`,
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

    it('should throw NotFoundException when edu record does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDU,
          entity: CONSTANTS_DATABASE_MODELS.EDU,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduId,
            isActive,
          }),
          description: `Failed to deactivate edu with ID: ${mockEduId}`,
          isSuccess: false,
          errorMessage: 'Edu not found',
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
      eduRepository.findById.mockResolvedValue(mockEdu);
      eduRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduRepository.softDelete).toHaveBeenCalledWith(
        mockEduId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Edu soft delete failed',
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
      eduRepository.findById.mockResolvedValue(mockEdu);
      eduRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduId, isActive, mockUserId, mockRequestInfo),
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
      eduRepository.findById.mockResolvedValue(mockEdu);
      eduRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockEduId, isActive, mockUserId);

      // Assert
      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduRepository.softDelete).toHaveBeenCalledWith(
        mockEduId,
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
      eduRepository.findById.mockResolvedValue(mockEdu);
      eduRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduId, isActive, mockUserId, mockRequestInfo),
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
