import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/soft-delete-edu-courselevel.use-case';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { EduCourseLevel } from '@features/201-files/domain/models/edu-courselevel.model';
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

describe('SoftDeleteEduCourseLevelUseCase', () => {
  let useCase: SoftDeleteEduCourseLevelUseCase;
  let eduCourseLevelRepository: jest.Mocked<EduCourseLevelRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduCourseLevelId = 1;
  const mockEduCourseLevel = new EduCourseLevel({
    id: mockEduCourseLevelId,
    desc1: 'Bachelor',
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
    const mockEduCourseLevelRepository = {
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
        SoftDeleteEduCourseLevelUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
          useValue: mockEduCourseLevelRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<SoftDeleteEduCourseLevelUseCase>(
      SoftDeleteEduCourseLevelUseCase,
    );
    eduCourseLevelRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
    );
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully soft delete an edu course level and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById.mockResolvedValue(mockEduCourseLevel);
      eduCourseLevelRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseLevelId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSELEVEL,
        expect.any(Function),
      );
      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.softDelete).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSELEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            educourselevelData: {
              id: mockEduCourseLevel.id,
              desc1: mockEduCourseLevel.desc1,
              previousStatus: mockEduCourseLevel.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockEduCourseLevel.desc1} has been ${isActive ? 'activated' : 'deactivated'}`,
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

    it('should successfully activate an edu course level and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById.mockResolvedValue(mockEduCourseLevel);
      eduCourseLevelRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseLevelId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSELEVEL,
        expect.any(Function),
      );
      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.softDelete).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSELEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            educourselevelData: {
              id: mockEduCourseLevel.id,
              desc1: mockEduCourseLevel.desc1,
              previousStatus: mockEduCourseLevel.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockEduCourseLevel.desc1} has been ${isActive ? 'activated' : 'deactivated'}`,
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

    it('should throw NotFoundException when edu course level does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseLevelId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSELEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduCourseLevelId,
            isActive,
          }),
          description: `Failed to deactivate educourselevel with ID: ${mockEduCourseLevelId}`,
          isSuccess: false,
          errorMessage: 'EduCourselevel not found',
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
      eduCourseLevelRepository.findById.mockResolvedValue(mockEduCourseLevel);
      eduCourseLevelRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseLevelId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.softDelete).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'EduCourselevel soft delete failed',
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
      eduCourseLevelRepository.findById.mockResolvedValue(mockEduCourseLevel);
      eduCourseLevelRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseLevelId,
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
      eduCourseLevelRepository.findById.mockResolvedValue(mockEduCourseLevel);
      eduCourseLevelRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseLevelId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.softDelete).toHaveBeenCalledWith(
        mockEduCourseLevelId,
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
      eduCourseLevelRepository.findById.mockResolvedValue(mockEduCourseLevel);
      eduCourseLevelRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseLevelId,
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
